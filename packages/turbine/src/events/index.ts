import { EventLoop } from "./event-loop";

export const TurbineEventLoop = new EventLoop();

TurbineEventLoop.setMaxListeners(300);