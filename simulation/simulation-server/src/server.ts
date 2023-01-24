import express, { Request, Response } from "express";
import { SimulationMachine } from "./simulationMachine";
import cors from "cors";
import type { Configuration } from "@metalizzsas/nuster-typings";

export const app = express();
app.use(cors());
app.use(express.json());

let machine: SimulationMachine | undefined = undefined;

app.listen(4082, () => {
    console.log("express started up"); 
});

app.post("/config", (req: Request<any, any, Configuration>, res: Response) => {

    if(machine)
    {
        res.end("Machine already defined");
        return;
    }

    console.log("Received configuration.");

    const { model, variant, revision, addons } = req.body;

    machine = new SimulationMachine(model, variant, revision, addons);

    res.end("machine defined");
});