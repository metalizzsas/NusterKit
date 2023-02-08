import { ContainerRegulation } from "../../../containers/ContainerRegulation";
import { TurbineEventLoop } from "../../../events";
import { DefaultGate } from "../../../io/IOGates/DefaultGate";
import { RegulationStatusParameterBlock } from "./RegulationStatusParameterBlock";

const temperatureGate = new DefaultGate({
    "address": 0,
    "bus": "in",
    "name": "temperature",
    "type": "default",
    "size": "word",
    "controllerId": 0,
    "default": 20
}, {});

const regulationContainer = new ContainerRegulation("bac", {
    "name": "temperature",
    "active": [],
    "maxTarget": 50,
    "plus": [],
    "sensor": "",
    "target": 20,
    "security": [] 
});

const regulationStatusPB = new RegulationStatusParameterBlock({"regulation_status": ["bac", "tempererature"]});

TurbineEventLoop.emit(`container.bac.regulation.temperature.set_target`, { target: 30 });
TurbineEventLoop.emit(`container.bac.regulation.temùperature.set_state`, { state: true });

expect(regulationStatusPB.data).toBe("good");