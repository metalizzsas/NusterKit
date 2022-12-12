import express, { Request, Response } from "express";
import { SimulationMachine } from "./simulationMachine";
import cors from "cors";

export const app = express();
app.use(cors());
app.use(express.json());

let machine: SimulationMachine = undefined;

app.listen(4081, () => {
    console.log("express started up"); 
});

app.post("/config", (req: Request, res: Response) => {

    console.log("Received configuration");

    const { model, variant, revision } = req.body;

    machine = new SimulationMachine(model, variant, revision);

});