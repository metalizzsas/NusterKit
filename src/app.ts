import express from "express";
import mongoose from "mongoose";
import { Machine } from "./classes/Machine";

class Server{
    public app = express();
    
}

const server  = new Server();

server.app.use(express.json());

server.app.listen(80, () => { console.log("Listening on port 80")});

mongoose.connect('mongodb://localhost/nuster2');

mongoose.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
        delete converted.__v;
    }
});

//_id moved to id
//deleted __v
//in toObject
mongoose.set('toObject', {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
        delete converted.__v;
    }
})


let MachineC = new Machine("metalfog", "m", 2, "123456");

MachineC.configureRouters();

server.app.use('/maintenance', MachineC.maintenanceController!.router)
server.app.use('/io', MachineC.ioController!.router)
server.app.use('/profile', MachineC.profileController!.router)
