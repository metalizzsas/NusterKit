import express from "express";
import { SimulationMachine } from "./simulationMachine";
import cors from "cors";

export const app = express();
app.use(cors());

new SimulationMachine("metalfog", "m", 1);

app.listen(4081, () => {
    console.log("express started up"); 
});