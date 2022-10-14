import { IPopup } from "@metalizzsas/nuster-typings/build/hydrated";
import { Server } from "http";
import { OPEN, WebSocket, WebSocketServer } from "ws";
import { LoggerInstance } from "../app";

const productionEnabled = process.env.NODE_ENV === 'production';

export class WebsocketDispatcher
{
    private static _instance: WebsocketDispatcher;

    wsServer: WebSocketServer;
    
    /** Connect popup data */
    connectPopup?: IPopup;
    /** Wheter the connect popup has been displayed or not */
    connectPopupDisplayed = false;

    private constructor(httpServer: Server)
    {        
        this.wsServer = new WebSocketServer({server: httpServer, path: productionEnabled ? '' : '/ws/'});
        
        this.wsServer.on("listening", () => {
            LoggerInstance.info("Websocket: Server listening..");
        });
        
        this.wsServer.on('connection', this.onConnect.bind(this));
    }

    static getInstance(httpServer?: Server)
    {
        if(!this._instance)
            if(httpServer !== undefined)
                this._instance = new WebsocketDispatcher(httpServer);
            else
                throw new Error("Websocket: Failed to instantiate, missing data");

        return this._instance;
    }

    /** 
     * toggle a popup on all NusterDesktop clients
     * @param popup Popup data send to all clients
     */
    togglePopup(popup: IPopup)
    {
        this.broadcastData(popup, "popup");
    }

    /**
     * Broadcast data to all NusterDesktop clients
     * @param data data to be sent over Websocket
     * @param channel channel used to send data
     */
    broadcastData(data: unknown, channel: "message" | "status" | "popup" = "message")
    {
        for(const client of this.wsServer.clients)
        {
            //Check that the client socket is still open
            if(client.readyState == OPEN)
            {
                client.send(JSON.stringify({
                    type: channel,
                    message: data
                }));
            }
        }
    }

    /**
     * Event handler used by the websocket server
     * @param ws Websocket connected
     */
    private onConnect(ws: WebSocket)
    {
        this.wsServer.clients.add(ws);

        LoggerInstance.trace("Websocket: New client");

        if(this.connectPopup !== undefined && this.connectPopupDisplayed == false)
        {
            setTimeout(() => {
                if(this.connectPopup)
                {
                    LoggerInstance.info("Websocket: Displaying connect popup.");
                    this.togglePopup(this.connectPopup);
                    this.connectPopupDisplayed = true;
                }
            }, 2000);
        }

        ws.on("close", () => {
            LoggerInstance.trace("Websocket: Client disconnected");
        });
    }
}