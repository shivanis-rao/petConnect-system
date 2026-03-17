import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import shelterRoutes from "./routes/shelter.routes.js";
import petRoutes from "./routes/pet.routes.js";
import { browsePets } from "./controllers/pet.controller.js";
import adoptionRoutes from "./routes/adoption.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
   'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
  'https://portfolio-dinner-skills-asks.trycloudflare.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from: ${origin}`);
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
  'Content-Type', 
  'Authorization',
  'bypass-tunnel-reminder'
],
}));

app.use(express.json());

// ✅ FIX FOR CLOUDFLARE: Trust proxy
app.set('trust proxy', 1);



app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes);

app.use("/api/shelters", shelterRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/shelter/pets", petRoutes);
app.get("/api/pets/browse", browsePets);
app.use("/api/adoption", (req, res, next) => {
  console.log("ADOPTION ROUTE HIT:", req.method, req.url);
  next();
});
app.use("/api/adoption", adoptionRoutes);

export default app;
