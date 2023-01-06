import { test, expect } from "@jest/globals";
import { IOReadParameterBlock } from "./IOReadParameterBlock";
import { TurbineEventLoop } from "../../../events";
import { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

const gate: IOGateJSON = {
    name: "test-gate",
    category: "generic",
    locked: false,
    unity: undefined,
    type: "default",
    value: 1,
    size: "bit",
    bus: "in",
};

const ioReadParameterBlock = new IOReadParameterBlock({"io_read": "test-gate"});

test("IOReadParameterBlocks listens for events.", () => {

    const hasListener = TurbineEventLoop.emit(`io.updated.test-gate`, gate);
    expect(hasListener).toBe(true);
});

test("IOReadParameterBlocks gets correct value.", () => {

    expect(ioReadParameterBlock.data).toBe(1);
});

