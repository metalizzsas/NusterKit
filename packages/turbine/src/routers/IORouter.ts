import { Router } from "./Router";
import { DefaultGate } from "../io/IOGates/DefaultGate";
import { MappedGate } from "../io/IOGates/MappedGate";
import { EX260Sx } from "../io/IOHandlers/EX260Sx";
import { WAGO } from "../io/IOHandlers/WAGO";
import type { IOGates } from "../types/spec/iogates";
import { PT100Gate } from "../io/IOGates/PT100Gate";
import type { IOBase, IOHandlers } from "../types/spec/iohandlers";
import type { IOGatesHydrated } from "../types/hydrated/io";
import { TurbineEventLoop } from "../events";

export class IORouter extends Router
{
    /** IO Physical handlers */
    handlers: IOBase[] = [];
    /** IO Physical gates */
    gates: IOGatesHydrated[] = [];

    /** IO Scanner interval timer */
    private timer?: ReturnType<typeof setInterval>;

    private ioScannerInterval = 500;

    /** Previous gate values for change detection */
    private previousValues = new Map<string, number>();

    constructor(handlers: IOHandlers[], gates: IOGates[])
    {
        super();

        // Register IO Handlers from their types
        for(const handler of handlers)
        {
            if(process.env.NODE_ENV != "production")
                handler.ip = "127.0.0.1";

            if(process.env.SIMULATION_ADDRESS !== undefined)
                handler.ip = process.env.SIMULATION_ADDRESS;

            if(handler.ioScannerInterval !== undefined)
                this.ioScannerInterval = handler.ioScannerInterval;

            switch(handler.type)
            {
                case "wago": this.handlers.push(new WAGO(handler.ip)); break;
                case "ex260sx": this.handlers.push(new EX260Sx(handler.ip, handler.size)); break;
            }
        }
        
        // Register gates from their correspondig type
        for(const gate of gates)
        {
            switch(gate.type)
            {
                case "mapped": this.gates.push(new MappedGate(gate, this.handlers[gate.controllerId])); break;
                case "pt100": this.gates.push(new PT100Gate(gate, this.handlers[gate.controllerId])); break;
                case "default": this.gates.push(new DefaultGate(gate, this.handlers[gate.controllerId])); break;
            }
        }

        this.startIOScanner();

        TurbineEventLoop.on(`io.resetAll`, async () => {
            for(const gate of this.gates.filter(g => g.bus == "out"))
            {
                await gate.write(gate.default);
            }
        });

        TurbineEventLoop.on('io.snapshot', (options) => {

            const snapshot = this.gates.filter(g => g.bus === "out" && g.locked === false).reduce((acc, gate) => {
                acc[gate.name] = gate.value;
                return acc;
            }, {} as Record<string, number>);

            options.callback(snapshot);
        })
    }

    /**
     * Starts The IO Scanner,
     * Scans the inputs to find their data from the Physical controllers
     */
    public startIOScanner()
    {
        if(!this.timer)
        {
            TurbineEventLoop.emit('log', 'info', `IOScanner: Started with interval ${this.ioScannerInterval}ms`);

            this.timer = setInterval(async () => {
                for(const g of this.gates.filter((g) => g.bus == "in"))
                {
                    await g.read();
                }

                // Change detection: only emit ws.dirty if any input gate value changed
                let changed = false;
                for (const g of this.gates.filter((g) => g.bus === "in")) {
                    if (this.previousValues.get(g.name) !== g.value) {
                        changed = true;
                        this.previousValues.set(g.name, g.value);
                    }
                }
                if (changed) {
                    TurbineEventLoop.emit("ws.dirty", "io");
                }

            }, this.ioScannerInterval);
        }
    }

    public stopIOScanner()
    {
        if(this.timer)
            clearInterval(this.timer);
    }

    /**
     * Return the data towards the socket
     */
    public get socketData(): IOGatesHydrated[]
    {
        return this.gates;
    }
}