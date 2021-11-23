import express from "express";
import mongoose from "mongoose";
import { Machine } from "./classes/Machine";

class Server{
    public app = express();
}

const server  = new Server();

server.app.listen(80, () => { console.log("Listening on port 80")});

mongoose.connect('mongodb://localhost/nuster2');


let MachineC = new Machine("metalfog", "m", 2, "123456");

MachineC.configureRouters();

server.app.use('/maintenance', MachineC.maintenanceController!.router)
