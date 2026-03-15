import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import shelterRoutes from "./routes/shelter.routes.js";
import petRoutes from "./routes/pet.routes.js";
import { browsePets } from "./controllers/pet.controller.js";
import adoptionRoutes from "./routes/adoption.routes.js";
import conversationRoutes from './routes/conversation.routes.js';


const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes);

app.use("/api/shelters", shelterRoutes);
app.use('/api/conversations', conversationRoutes);
app.use("/api/shelter/pets", petRoutes);
app.get("/api/pets/browse", browsePets);
app.use("/api/adoption", (req, res, next) => {
  console.log("ADOPTION ROUTE HIT:", req.method, req.url);
  next();
});
app.use("/api/adoption",adoptionRoutes);

export default app;
