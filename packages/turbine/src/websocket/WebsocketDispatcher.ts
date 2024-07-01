import type { WebsocketData } from "../types/hydrated";
import type { Popup, CallToAction, CallToActionFront } from "../types/spec/nuster";

import type { Server } from "http";
import type { WebSocket } from "ws";

import { OPEN, WebSocketServer } from "ws";
import { TurbineEventLoop } from "../events";
import { CalltoActionRouter } from "../routers/CallToAction";

const productionEnabled = process.env.NODE_ENV === 'production';

/** Websocket manager */
export class WebsocketDispatcher
{
    /** Underlying Websocket server */
    private wsServer: WebSocketServer;
    
    /** Connect popup data */
    private connectPopups: Array<Popup<CallToAction>> = [];
    /** Wheter the connect popup has been displayed or not */
    private connectPopupDisplayed = false;

    /**
     * Creates a websocket dispatcher bound to the given http server
     * @param httpServer Http server to bind the websocket server to
     */
    constructor(httpServer: Server)
    {        
        this.wsServer = new WebSocketServer({server: httpServer, path: productionEnabled ? '' : '/ws/'});
        
        this.wsServer.on("listening", () => {
            TurbineEventLoop.emit('log', 'info', 'Websocket: Server listening..');
        });
        
        this.wsServer.on('connection', this.onConnect.bind(this));
        TurbineEventLoop.on("nuster.modal", this.togglePopup.bind(this));
    }

    /**
     * Add a popup to be displayed on all NusterDesktop clients
     * @param popup Popup data to be displayed on all NusterDesktop clients
     */
    addConnectPopup(popup: Popup<CallToAction>)
    {
        this.connectPopups = [...this.connectPopups, popup];
    }

    /** 
     * toggle a popup on all NusterDesktop clients
     * @param popup Popup data send to all clients
     */
    togglePopup(popup: Popup<CallToAction>)
    {
        Promise.all<CallToActionFront>((popup.callToActions ?? []).map(cta => CalltoActionRouter.generateCallToAction(cta))).then(v => {
            this.broadcastData({...popup, callToActions: v }, "popup");
        });
    }

    /**
     * Broadcast data to all NusterDesktop clients
     * @param data data to be sent over Websocket
     * @param channel channel used to send data
     */
    broadcastData<T extends WebsocketData>(data: T["message"], channel: T["type"] = "status")
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
        
        TurbineEventLoop.emit('log', 'trace', "Websocket: New client");

        if(this.connectPopups !== undefined && this.connectPopupDisplayed == false)
        {
            setTimeout(() => {
                if(this.connectPopups)
                {
                    TurbineEventLoop.emit('log', 'info', "Websocket: Displaying connect popup.");
                    this.connectPopups.forEach(popup => this.togglePopup(popup));
                    this.connectPopupDisplayed = true;
                }
            }, 2000);
        }

        ws.on("close", () => {
            TurbineEventLoop.emit('log', 'trace', "Websocket: Client disconnected");
        });
    }
}