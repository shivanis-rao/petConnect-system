import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import shelterRoutes from "./routes/shelter.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/shelters", shelterRoutes);

export default app;
