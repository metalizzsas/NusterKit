import type { Logger } from "./interfaces";
import { TurbineEventLoop } from "../events";

/**
 * Logger adapter — wraps TurbineEventLoop.emit('log', ...) for direct access.
 * In Phase 2.8+, this could be replaced with a pino logger or similar.
 */
export class LoggerAdapter implements Logger {
	log(level: "trace" | "info" | "warning" | "error" | "fatal", message: string): void {
		TurbineEventLoop.emit("log", level, message);
	}
}
