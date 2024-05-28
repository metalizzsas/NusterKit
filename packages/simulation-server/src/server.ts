import type { Configuration, MachineSpecs } from "@nuster/turbine/types";
import { SimulationMachine } from "./simulationMachine";
import express, { Request, Response } from "express";
import cors from "cors";

const port = process.env.PORT || 4082;

const app = express();

app.use(cors());
app.use(express.json());

let machine: SimulationMachine | undefined = undefined;

app.listen(port, () => {
    console.log(`Nuster simulation server started on port ${port}.`); 
});

app.post("/config", (req: Request<any, any, { configuration: Configuration, specs: MachineSpecs }>, res: Response) => {

    if(machine)
    {
        console.warn(`Machine is already defined.`);
        res.status(400);
        res.end("Machine already defined");
        return;
    }

    console.log(`Simulation server received ${req.body.configuration.model} configuration.`);

    machine = new SimulationMachine(req.body.configuration, req.body.specs);

    app.use(machine.expressRouter);

    res.end("machine defined");
});