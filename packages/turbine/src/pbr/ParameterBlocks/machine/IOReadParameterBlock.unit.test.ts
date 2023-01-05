import { test, expect } from "@jest/globals";
import { IOReadParameterBlock } from "./IOReadParameterBlock";
import type { IOGateBase } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { TurbineEventLoop } from "../../../events";

const gate: IOGateBase = {
    name: "test-gate",
    category: "generic",
    type: "default",
    controllerId: 0,
    address: 0,
    default: 0,
    value: 1,
    size: "bit",
    bus: "in",
    async read() { return true; },
    async write() { return true; }
}

const ioReadParameterBlock = new IOReadParameterBlock({"io_read": "test-gate"});

test("IOReadParameterBlocks listens for events.", () => {

    const hasListener = TurbineEventLoop.emit(`io.updated.test-gate`, gate);
    expect(hasListener).toBe(true);
});

test("IOReadParameterBlocks gets correct value.", () => {

    expect(ioReadParameterBlock.data).toBe(1);
});

