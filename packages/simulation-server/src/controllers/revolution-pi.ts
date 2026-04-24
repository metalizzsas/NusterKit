import type { IOGates } from "@nuster/turbine/types/spec/iogates";
import type { RevolutionPi as RevolutionPiConfig } from "@nuster/turbine/types/spec/iohandlers";
import { openSync, readSync, writeSync, closeSync, existsSync } from "fs";

const DEFAULT_DEVICE_PATH = "/tmp/nuster-revpi-sim.img";
const IMAGE_SIZE = 4096;

type SimulationGate = IOGates & { value: number };

/**
 * RevolutionPi simulation controller — mirrors a 4 KiB piControl process image
 * onto a backing file that Turbine can point `REVPI_DEVICE_PATH` at.
 *
 * The UI toggles gate values through the existing `/io/:name/:value` route;
 * this controller keeps the backing file in sync so Turbine reads the same bytes.
 */
export class RevolutionPiController
{
    private gates: SimulationGate[];

    private fd: number;

    devicePath: string;

    index: number;

    /**
     * `gates` is taken by reference — mutations to `.value` will be visible in the
     * simulation machine's shared iogates array, so the existing `/io` endpoint
     * reflects the backing-file state without any extra plumbing.
     */
    constructor(controller: RevolutionPiConfig, gates: SimulationGate[], index: number)
    {
        this.index = index;
        this.devicePath = process.env.REVPI_DEVICE_PATH ?? controller.devicePath ?? DEFAULT_DEVICE_PATH;

        this.gates = gates;

        const existed = existsSync(this.devicePath);
        this.fd = openSync(this.devicePath, "a+");
        closeSync(this.fd);
        this.fd = openSync(this.devicePath, "r+");

        if (!existed) {
            const zero = Buffer.alloc(IMAGE_SIZE);
            writeSync(this.fd, zero, 0, IMAGE_SIZE, 0);
        }

        for (const gate of this.gates) {
            this.writeGate(gate);
        }

        console.log(`Created RevolutionPi simulation controller at ${this.devicePath}`);
    }

    /** Sync every gate's `value` from the backing file. Called on /io GET. */
    readGates(): void
    {
        for (const gate of this.gates) {
            gate.value = this.read_gate_from_file(gate);
        }
    }

    /** Write a gate's `value` into the backing file. Called on /io/:name/:value POST. */
    writeGate(gate: SimulationGate): void
    {
        if (gate.size === "bit") {
            const byte_offset = gate.address >> 3;
            const bit_index = gate.address & 7;
            const buf = Buffer.alloc(1);
            readSync(this.fd, buf, 0, 1, byte_offset);
            const mask = 1 << bit_index;
            buf[0] = gate.value ? buf[0] | mask : buf[0] & ~mask;
            writeSync(this.fd, buf, 0, 1, byte_offset);
            return;
        }

        if (gate.size === "word") {
            const buf = Buffer.alloc(2);
            buf[0] = gate.value & 0xff;
            buf[1] = (gate.value >> 8) & 0xff;
            writeSync(this.fd, buf, 0, 2, gate.address);
            return;
        }

        // dword
        const buf = Buffer.alloc(4);
        buf[0] = gate.value & 0xff;
        buf[1] = (gate.value >> 8) & 0xff;
        buf[2] = (gate.value >> 16) & 0xff;
        buf[3] = (gate.value >>> 24) & 0xff;
        writeSync(this.fd, buf, 0, 4, gate.address);
    }

    private read_gate_from_file(gate: SimulationGate): number
    {
        if (gate.size === "bit") {
            const byte_offset = gate.address >> 3;
            const bit_index = gate.address & 7;
            const buf = Buffer.alloc(1);
            readSync(this.fd, buf, 0, 1, byte_offset);
            return (buf[0] >> bit_index) & 1;
        }

        if (gate.size === "word") {
            const buf = Buffer.alloc(2);
            readSync(this.fd, buf, 0, 2, gate.address);
            return buf.readInt16LE(0);
        }

        const buf = Buffer.alloc(4);
        readSync(this.fd, buf, 0, 4, gate.address);
        return buf.readInt32LE(0);
    }

    /** Returns a hex snapshot of the backing image for the UI to render a byte grid. */
    snapshot(): { devicePath: string; bytes: string } {
        const buf = Buffer.alloc(IMAGE_SIZE);
        readSync(this.fd, buf, 0, IMAGE_SIZE, 0);
        return { devicePath: this.devicePath, bytes: buf.toString("hex") };
    }

    owns(gate: IOGates & { controllerId: number }): boolean {
        return gate.controllerId === this.index;
    }

    close(): void
    {
        try { closeSync(this.fd); } catch { /* best-effort */ }
    }
}
