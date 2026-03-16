import { Server } from "socket.io";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { Message, Conversation, User } = db;

let pub, sub;

export const initSocket = async (httpServer) => {
  // Redis clients
  pub = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  sub = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  await pub.connect();
  await sub.connect();
  console.log("Redis connected");

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Auth middleware — verify JWT on socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "first_name", "last_name", "email", "role"],
      });
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: user ${socket.user.id}`);

    // Join personal room — for direct notifications
    socket.join(`user_${socket.user.id}`);

    // Join conversation room
    socket.on("join_conversation", async (conversationId) => {
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) return;

      // Only allow adopter or shelter member to join
      const isAdopter = conversation.adopter_id === socket.user.id;
      const isShelterMember = socket.user.role === "shelter";

      if (!isAdopter && !isShelterMember) return;

      socket.join(`conversation_${conversationId}`);
      console.log(
        `User ${socket.user.id} joined conversation ${conversationId}`,
      );

      // Mark messages as read
      await Message.update(
        { is_read: true },
        {
          where: {
            conversation_id: conversationId,
            is_read: false,
            sender_id: { [db.Sequelize.Op.ne]: socket.user.id },
          },
        },
      );

      // Reset unread count
      const isAdopterUser = conversation.adopter_id === socket.user.id;
      await conversation.update(
        isAdopterUser ? { adopter_unread: 0 } : { shelter_unread: 0 },
      );
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { conversation_id, content, file_url, file_type } = data;

        const conversation = await Conversation.findByPk(conversation_id);
        if (!conversation) return;

        // Save message to DB
        const message = await Message.create({
          conversation_id,
          sender_id: socket.user.id,
          content,
          file_url: file_url || null,
          file_type: file_type || null,
          is_read: false,
        });

        // Update conversation last_message_at and unread count
        const isAdopter = conversation.adopter_id === socket.user.id;
        await conversation.update({
          last_message_at: new Date(),
          shelter_unread: isAdopter
            ? conversation.shelter_unread + 1
            : conversation.shelter_unread,
          adopter_unread: !isAdopter
            ? conversation.adopter_unread + 1
            : conversation.adopter_unread,
        });

        // Build message payload
        const isAnonymous = conversation.is_anonymous;
        const senderInfo =
          isAnonymous && isAdopter
            ? { id: null, name: "Anonymous", role: "adopter" }
            : {
                id: socket.user.id,
                name: `${socket.user.first_name} ${socket.user.last_name}`,
                role: socket.user.role,
              };

        const payload = {
          id: message.id,
          conversation_id,
          content,
          file_url: file_url || null,
          file_type: file_type || null,
          sender: senderInfo,
          is_read: false,
          createdAt: message.createdAt,
        };

        // Publish to Redis
        await pub.publish("messages", JSON.stringify(payload));

        // Broadcast to conversation room
        io.to(`conversation_${conversation_id}`).emit("new_message", payload);
      } catch (err) {
        console.error("send_message error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      socket.to(`conversation_${data.conversation_id}`).emit("user_typing", {
        user_id: socket.user.id,
        is_typing: data.is_typing,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });

  // Subscribe to Redis messages channel
  await sub.subscribe("messages", (messageStr) => {
    const message = JSON.parse(messageStr);
    console.log("Redis message received:", message.id);
  });

  return io;
};
