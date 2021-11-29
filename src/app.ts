import express from "express";
import mongoose from "mongoose";
import websocket, { WebSocketServer } from "ws";
import { Server } from "http";

import dgram from "dgram";

import { Machine } from "./classes/Machine";

class NTurbine
{
    public app = express();
    public httpServer?: Server;
    public wsServer?: WebSocketServer;

    public machine: Machine;

    constructor()
    {
        this.machine = new Machine();

        this.machine.configureRouters();

        this._express();
        this._discovery();
        this._websocket();
        this._mongoose();

        this._machine();
    }
    /**
     * Configure Express over network
     */
    private _express()
    {
        this.httpServer = this.app.listen(80, () => { console.log("Listning on 80"); });
        this.app.use(express.json());
    }
    /**
     * Create UDP4 discovery service
     */
    private _discovery()
    {
        const udp = dgram.createSocket('udp4');

        setInterval(() => {
            udp.send("test", 2222, '255.255.255.255', (error: Error | null, bytes: number) => {
                console.log("sent", bytes);
            });
        }, 1000);
    }
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new websocket.Server({server: this.httpServer });
        this.wsServer.on('connection', (ws: websocket.WebSocket) => { this.wsServer!.clients.add(ws); console.log("new client")});
    }
    /**
     * Connect and configure mongoose
     */
    private _mongoose()
    {
        mongoose.connect('mongodb://localhost/nuster2');

        //move id to _id
        //remove __v

        mongoose.set('toJSON', {
            virtuals: true,
            transform: (doc, converted) => {
                delete converted._id;
                delete converted.__v;
            }
        });

        mongoose.set('toObject', {
            virtuals: true,
            transform: (doc, converted) => {
                delete converted._id;
                delete converted.__v;
            }
        });
    }
    /**
     * Add all machines routes to express
     */
    private _machine()
    {
        this.app.use('/maintenance', this.machine.maintenanceController!.router)
        this.app.use('/io', this.machine.ioController!.router)
        this.app.use('/profile', this.machine.profileController!.router)
        this.app.use('/slot', this.machine.slotController!.router)
        this.app.use('/manual', this.machine.manualmodeController!.router)
    }
}

new NTurbine();