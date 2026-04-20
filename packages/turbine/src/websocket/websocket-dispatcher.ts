import type { Server } from "http";
import type { WebSocket } from "ws";
import { OPEN, WebSocketServer } from "ws";
import { TurbineEventLoop } from "../events";
import type { Machine } from "../machine";
import { CalltoActionRouter } from "../routers/call-to-action";
import type { WebsocketData } from "../types/hydrated";
import type { CallToAction, CallToActionFront, Popup } from "../types/spec/nuster";

const production_enabled = process.env.NODE_ENV === "production";

type DirtyDomain = "io" | "containers" | "cycle" | "maintenance" | "network";

/** Websocket manager */
export class WebsocketDispatcher {
	/** Underlying Websocket server */
	private ws_server: WebSocketServer;

	/** Machine reference for data collection */
	private machine?: Machine;

	/** Dirty flags per domain */
	private dirty_flags: Record<DirtyDomain, boolean> = { io: false, containers: false, cycle: false, maintenance: false, network: false };
	/** Debounce timer for batching dirty signals */
	private debounce_timer?: ReturnType<typeof setTimeout>;
	/** Debounce window in milliseconds */
	private readonly DEBOUNCE_MS = 50;

	/** Connect popup data */
	private connect_popups: Array<Popup<CallToAction>> = [];
	/** Wheter the connect popup has been displayed or not */
	private connect_popup_displayed = false;
	/** Pending popup display timer */
	private popup_timer?: ReturnType<typeof setTimeout>;
	/** Stored modal listener reference for cleanup */
	private _on_modal: (popup: Popup<CallToAction>) => void;
	/** Stored dirty listener reference for cleanup */
	private _on_dirty: (domain: DirtyDomain) => void;

	/**
	 * Creates a websocket dispatcher bound to the given http server
	 * @param http_server Http server to bind the websocket server to
	 */
	constructor(http_server: Server) {
		this.ws_server = new WebSocketServer({ server: http_server, path: production_enabled ? "" : "/ws/" });

		this.ws_server.on("listening", () => {
			TurbineEventLoop.emit("log", "info", "Websocket: Server listening..");
		});

		this.ws_server.on("connection", this.on_connect.bind(this));
		this._on_modal = this.toggle_popup.bind(this);
		TurbineEventLoop.on("nuster.modal", this._on_modal);

		this._on_dirty = (domain) => {
			this.dirty_flags[domain] = true;
			if (!this.debounce_timer) {
				this.debounce_timer = setTimeout(() => this.flush(), this.DEBOUNCE_MS);
			}
		};
		TurbineEventLoop.on("ws.dirty", this._on_dirty);
	}

	/**
	 * Set the machine reference for data collection
	 * @param machine Machine instance
	 */
	set_machine(machine: Machine): void {
		this.machine = machine;
	}

	/**
	 * Flush dirty domains: build partial status and broadcast as "patch"
	 */
	private async flush(): Promise<void> {
		this.debounce_timer = undefined;

		if (!this.machine) return;

		// Snapshot and reset dirty flags
		const snapshot = { ...this.dirty_flags };
		this.dirty_flags = { io: false, containers: false, cycle: false, maintenance: false, network: false };

		const patch: Record<string, unknown> = {};

		if (snapshot.io) {
			patch.io = this.machine.io_router.socket_data;
		}
		if (snapshot.containers) {
			patch.containers = await this.machine.container_router.socket_data();
		}
		if (snapshot.cycle) {
			// Use null instead of undefined so JSON.stringify preserves the key
			const cycle_data = this.machine.cycle_router.socket_data;
			patch.cycle = cycle_data === undefined ? null : cycle_data;
		}
		if (snapshot.maintenance) {
			patch.maintenance = this.machine.maintenance_router.socket_data();
		}
		if (snapshot.network) {
			patch.network = this.machine.network_router?.socket_data ?? { devices: [], accessPoints: [] };
		}

		if (Object.keys(patch).length > 0) {
			this.broadcastData(patch as never, "patch");
		}
	}

	/**
	 * Add a popup to be displayed on all NusterDesktop clients
	 * @param popup Popup data to be displayed on all NusterDesktop clients
	 */
	add_connect_popup(popup: Popup<CallToAction>) {
		this.connect_popups = [...this.connect_popups, popup];
	}

	/**
	 * toggle a popup on all NusterDesktop clients
	 * @param popup Popup data send to all clients
	 */
	toggle_popup(popup: Popup<CallToAction>) {
		Promise.all<CallToActionFront>((popup.callToActions ?? []).map((cta) => CalltoActionRouter.generateCallToAction(cta)))
			.then((v) => {
				this.broadcastData({ ...popup, callToActions: v }, "popup");
			})
			.catch((err) => {
				TurbineEventLoop.emit("log", "error", `WebsocketDispatcher: popup generation failed: ${(err as Error).message}`);
			});
	}

	/**
	 * Broadcast data to all NusterDesktop clients
	 * @param data data to be sent over Websocket
	 * @param channel channel used to send data
	 */
	broadcastData<T extends WebsocketData>(data: T["message"], channel: T["type"] = "status") {
		for (const client of this.ws_server.clients) {
			//Check that the client socket is still open
			if (client.readyState == OPEN) {
				client.send(
					JSON.stringify({
						type: channel,
						message: data,
					}),
				);
			}
		}
	}

	/**
	 * Send data to a single client
	 * @param ws WebSocket client
	 * @param data data to be sent
	 * @param channel channel used to send data
	 */
	private send_to_client(ws: WebSocket, data: unknown, channel: string): void {
		if (ws.readyState === OPEN) {
			ws.send(JSON.stringify({ type: channel, message: data }));
		}
	}

	/**
	 * Event handler used by the websocket server
	 * @param ws Websocket connected
	 */
	private on_connect(ws: WebSocket) {
		this.ws_server.clients.add(ws);

		TurbineEventLoop.emit("log", "trace", "Websocket: New client");

		// Send full status to newly connected client
		if (this.machine) {
			this.machine
				.socket_data()
				.then((status) => {
					this.send_to_client(ws, status, "status");
				})
				.catch((err) => {
					TurbineEventLoop.emit("log", "error", `WebsocketDispatcher: initial status failed: ${(err as Error).message}`);
				});
		}

		if (this.connect_popups !== undefined && this.connect_popup_displayed == false) {
			this.popup_timer = setTimeout(() => {
				this.popup_timer = undefined;
				if (this.connect_popups) {
					TurbineEventLoop.emit("log", "info", "Websocket: Displaying connect popup.");
					this.connect_popups.forEach((popup) => this.toggle_popup(popup));
					this.connect_popup_displayed = true;
				}
			}, 2000);
		}

		ws.on("close", () => {
			TurbineEventLoop.emit("log", "trace", "Websocket: Client disconnected");
		});
	}

	dispose(): void {
		if (this.popup_timer) {
			clearTimeout(this.popup_timer);
			this.popup_timer = undefined;
		}
		if (this.debounce_timer) {
			clearTimeout(this.debounce_timer);
			this.debounce_timer = undefined;
		}
		TurbineEventLoop.removeListener("nuster.modal", this._on_modal);
		TurbineEventLoop.removeListener("ws.dirty", this._on_dirty);
		this.ws_server.close();
	}
}
