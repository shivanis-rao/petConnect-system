import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import petRoutes from "./routes/pet.routes.js";

const app = express();

app.use(cors({origin:"http://localhost:5173"}));
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/users", userRoutes);


app.use("/api/shelter/pets", petRoutes);


import { browsePets } from "./controllers/pet.controller.js";
app.get("/api/pets/browse", browsePets);

export default app;