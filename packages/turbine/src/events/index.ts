import { EventLoop } from "./eventLoop";

export const TurbineEventLoop = new EventLoop();

TurbineEventLoop.setMaxListeners(300);