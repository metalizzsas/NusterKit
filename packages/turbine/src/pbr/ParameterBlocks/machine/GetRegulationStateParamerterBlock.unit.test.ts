import { test, expect } from "vitest";
import { TurbineEventLoop } from "../../../events";
import { GetRegulationStateParameterBlock } from "./GetRegulationStateParameterBlock";

const state = true;

const getRegulationStateParameterBlock = new GetRegulationStateParameterBlock({
    "get_regulation_state": {
        "container": "test-container",
        "regulation": "test-regulation"
    }
});

test("GetRegulationStateParameterBlock listens for events.", () => {

    const hasListener = TurbineEventLoop.emit(`container.test-container.regulation.test-regulation.state_updated`, state);
    expect(hasListener).toBe(true);

});

test("GetRegulationStateParameterBlock gets correct value.", () => {

    expect(getRegulationStateParameterBlock.data).toBe(1);

});