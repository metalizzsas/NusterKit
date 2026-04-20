import type { IOBase, WAGO as WAGOConfig } from "$types/spec/iohandlers";

import ModbusTCP from "modbus-serial";
import ping from "ping";

import { TurbineEventLoop } from "../../events";
import { AsyncMutex } from "../../utils/async-mutex";

const MAX_RECONNECT_DELAY = 30_000; // 30s cap
const BASE_RECONNECT_DELAY = 2_000; // 2s initial

export class WAGO implements IOBase, WAGOConfig
{
    type = "wago" as const;

    connected = false;
    unreachable = false;
    ip: string;

    public client: ModbusTCP;
    private connectTimer?: ReturnType<typeof setInterval>;
    private reconnectTimer?: ReturnType<typeof setTimeout>;
    private reconnectAttempts = 0;
    private connecting = false;
    private ioMutex = new AsyncMutex();

    constructor(ip: string)
    {
        this.ip = ip;
        this.client = new ModbusTCP();
        this.connect();
    }

    async connect(): Promise<boolean>
    {
        // Prevent overlapping connect attempts
        if (this.connecting) return false;
        if (this.unreachable) return false;

        this.connecting = true;

        try {
            const available = await new Promise<boolean>((resolve) => {
                ping.sys.probe(this.ip, (isAlive) => resolve(isAlive ?? false));
            });

            if (!available) {
                this.unreachable = true;
                TurbineEventLoop.emit('log', 'error', `WAGO: Failed to ping, cancelling connection.`);
                return false;
            }

            await this.client.connectTCP(this.ip, { port: 502 }).catch(error => TurbineEventLoop.emit('log', 'error', `WAGO: ${error}`));

            this.connected = this.client.isOpen;

            if (this.connected) {
                TurbineEventLoop.emit('log', 'info', "WAGO: Connected");
                this.reconnectAttempts = 0;
                this.clearReconnectTimer();
                this.startKeepAlive();
                return true;
            }

            return false;
        } finally {
            this.connecting = false;
        }
    }

    private startKeepAlive(): void {
        if (this.connectTimer) clearInterval(this.connectTimer);

        this.connectTimer = setInterval(() => {
            this.connected = this.client.isOpen;
            if (!this.connected) {
                TurbineEventLoop.emit('log', 'info', "WAGO: Disconnected, scheduling reconnect");
                this.clearKeepAlive();
                this.scheduleReconnect();
            }
        }, 2000);
    }

    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1), MAX_RECONNECT_DELAY);
        TurbineEventLoop.emit('log', 'info', `WAGO: Reconnect attempt #${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = undefined;
            const success = await this.connect();
            if (!success && !this.unreachable) {
                this.scheduleReconnect();
            }
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    private clearKeepAlive(): void {
        if (this.connectTimer) {
            clearInterval(this.connectTimer);
            this.connectTimer = undefined;
        }
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void>
    {
        if(this.unreachable)
        {
            TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
            return;
        }

        await this.ioMutex.acquire();
        try {
            if(!this.client.isOpen)
            {
                const connected = await this.connect();

                if(!connected)
                    return;
            }

            if(word && word == true)
            {
                await this.client.writeRegister(address, data);
            }
            else
            {
                await this.client.writeCoil(address, data == 1);
            }
        } finally {
            this.ioMutex.release();
        }
    }

    async readData(address: number, word?: boolean): Promise<number>
    {
        if(this.unreachable)
        {
            TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
            return 0;
        }

        await this.ioMutex.acquire();
        try {
            if(!this.client.isOpen)
            {
                const connected = await this.connect();

                if(!connected)
                    return 0;
            }

            let result = null;

            if(word && word == true)
            {
                result = await this.client.readHoldingRegisters(address, 1);
                return result.data[0];
            }
            else
            {
                result = await this.client.readCoils(address, 1);
                return result.data[0] ? 1 : 0;
            }
        } finally {
            this.ioMutex.release();
        }
    }

    dispose(): void {
        this.clearKeepAlive();
        this.clearReconnectTimer();
        try {
            this.client.close(() => {});
        } catch {
            // best-effort close
        }
    }

    toJSON()
    {
        return {
            type: this.type,
            ip: this.ip
        }
    }
}
