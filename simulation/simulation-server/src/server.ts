import type { Configuration, MachineSpecs } from "@nuster/turbine/types";
import { SimulationMachine } from "./simulationMachine";
import express, { Request, Response } from "express";
import cors from "cors";

export const app = express();
app.use(cors());
app.use(express.json());

let machine: SimulationMachine | undefined = undefined;

app.listen(4082, () => {
    console.log("express started up"); 
});

app.post("/config", (req: Request<any, any, { configuration: Configuration, specs: MachineSpecs }>, res: Response) => {

    if(machine)
    {
        res.end("Machine already defined");
        return;
    }

    console.log("Received configuration.");

    machine = new SimulationMachine(req.body.configuration, req.body.specs);

    res.end("machine defined");
});