import express from "express";
import type { Request, Response } from "express";
import { SimulationMachine } from "./simulationMachine";
import cors from "cors";

export const app = express();
app.use(cors());

const machine = new SimulationMachine("metalfog", "m", 1);

app.listen(4081, () => {
    console.log("express started up"); 
});

app.get("/", (req: Request, res: Response) => {
    res.write("hello world");
    res.end();
});