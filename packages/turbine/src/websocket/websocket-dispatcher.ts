import type { WebsocketData } from "../types/hydrated";
import type { Popup, CallToAction, CallToActionFront } from "../types/spec/nuster";
import type { Machine } from "../machine";

import type { Server } from "http";
import type { WebSocket } from "ws";

import { OPEN, WebSocketServer } from "ws";
import { TurbineEventLoop } from "../events";
import { CalltoActionRouter } from "../routers/call-to-action";

const productionEnabled = process.env.NODE_ENV === 'production';

type DirtyDomain = "io" | "containers" | "cycle" | "maintenance" | "network";

/** Websocket manager */
export class WebsocketDispatcher
{
	/** Underlying Websocket server */
	private wsServer: WebSocketServer;

	/** Machine reference for data collection */
	private machine?: Machine;

	/** Dirty flags per domain */
	private dirtyFlags: Record<DirtyDomain, boolean> = { io: false, containers: false, cycle: false, maintenance: false, network: false };
	/** Debounce timer for batching dirty signals */
	private debounceTimer?: ReturnType<typeof setTimeout>;
	/** Debounce window in milliseconds */
	private readonly DEBOUNCE_MS = 50;

	/** Connect popup data */
	private connectPopups: Array<Popup<CallToAction>> = [];
	/** Wheter the connect popup has been displayed or not */
	private connectPopupDisplayed = false;
	/** Pending popup display timer */
	private popupTimer?: ReturnType<typeof setTimeout>;
	/** Stored modal listener reference for cleanup */
	private _onModal: (popup: Popup<CallToAction>) => void;
	/** Stored dirty listener reference for cleanup */
	private _onDirty: (domain: DirtyDomain) => void;

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
		this._onModal = this.togglePopup.bind(this);
		TurbineEventLoop.on("nuster.modal", this._onModal);

		this._onDirty = (domain) => {
			this.dirtyFlags[domain] = true;
			if (!this.debounceTimer) {
				this.debounceTimer = setTimeout(() => this.flush(), this.DEBOUNCE_MS);
			}
		};
		TurbineEventLoop.on("ws.dirty", this._onDirty);
	}

	/**
	 * Set the machine reference for data collection
	 * @param machine Machine instance
	 */
	setMachine(machine: Machine): void
	{
		this.machine = machine;
	}

	/**
	 * Flush dirty domains: build partial status and broadcast as "patch"
	 */
	private async flush(): Promise<void>
	{
		this.debounceTimer = undefined;

		if (!this.machine) return;

		// Snapshot and reset dirty flags
		const snapshot = { ...this.dirtyFlags };
		this.dirtyFlags = { io: false, containers: false, cycle: false, maintenance: false, network: false };

		const patch: Record<string, unknown> = {};

		if (snapshot.io) {
			patch.io = this.machine.ioRouter.socketData;
		}
		if (snapshot.containers) {
			patch.containers = await this.machine.containerRouter.socketData();
		}
		if (snapshot.cycle) {
			// Use null instead of undefined so JSON.stringify preserves the key
			const cycleData = this.machine.cycleRouter.socketData;
			patch.cycle = cycleData === undefined ? null : cycleData;
		}
		if (snapshot.maintenance) {
			patch.maintenance = this.machine.maintenanceRouter.socketData();
		}
		if (snapshot.network) {
			patch.network = this.machine.networkRouter?.socketData ?? { devices: [], accessPoints: [] };
		}

		if (Object.keys(patch).length > 0) {
			this.broadcastData(patch as never, "patch");
		}
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
		}).catch(err => {
			TurbineEventLoop.emit('log', 'error', `WebsocketDispatcher: popup generation failed: ${(err as Error).message}`);
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
	 * Send data to a single client
	 * @param ws WebSocket client
	 * @param data data to be sent
	 * @param channel channel used to send data
	 */
	private sendToClient(ws: WebSocket, data: unknown, channel: string): void
	{
		if (ws.readyState === OPEN) {
			ws.send(JSON.stringify({ type: channel, message: data }));
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

		// Send full status to newly connected client
		if (this.machine) {
			this.machine.socketData().then(status => {
				this.sendToClient(ws, status, "status");
			}).catch(err => {
				TurbineEventLoop.emit('log', 'error', `WebsocketDispatcher: initial status failed: ${(err as Error).message}`);
			});
		}

		if(this.connectPopups !== undefined && this.connectPopupDisplayed == false)
		{
			this.popupTimer = setTimeout(() => {
				this.popupTimer = undefined;
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

	dispose(): void {
		if (this.popupTimer) {
			clearTimeout(this.popupTimer);
			this.popupTimer = undefined;
		}
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = undefined;
		}
		TurbineEventLoop.removeListener("nuster.modal", this._onModal);
		TurbineEventLoop.removeListener("ws.dirty", this._onDirty);
		this.wsServer.close();
	}
}
