import express from "express"
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import petRoutes from "./routes/pet.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/shelter/pets", petRoutes);
// public browse
app.use("/api/pets", petRoutes);

export  default app;