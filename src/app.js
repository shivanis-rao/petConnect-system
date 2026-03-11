import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import petRoutes from "./routes/pet.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ------------------- USER ROUTES -------------------
app.use("/api/users", userRoutes);

// ---------------- SHELTER PET ROUTES ----------------
// Only shelter CRUD operations (protected by authMiddleware inside pet.routes.js)
app.use("/api/shelter/pets", petRoutes);

// ---------------- PUBLIC PET BROWSING ----------------
// Only the browse route
import { browsePets } from "./controllers/pet.controller.js";
app.get("/api/pets/browse", browsePets);

export default app;