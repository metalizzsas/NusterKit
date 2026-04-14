import { TurbineEventLoop } from "../events";

type CleanupFn = () => void | Promise<void>;

interface ShutdownResource {
	name: string;
	cleanup: CleanupFn;
}

const SHUTDOWN_TIMEOUT = 10_000; // 10s max for entire shutdown

/**
 * Tracks disposable resources and shuts them down in reverse order of registration.
 * Ensures cleanup runs exactly once, with a global timeout to prevent hanging.
 */
export class GracefulShutdown {
	private resources: ShutdownResource[] = [];
	private shutdownStarted = false;

	/** Register a resource for cleanup. Last registered = first disposed. */
	register(name: string, cleanup: CleanupFn): void {
		this.resources.push({ name, cleanup });
	}

	/** Remove a registered resource by name (e.g. when it's already disposed). */
	unregister(name: string): void {
		this.resources = this.resources.filter(r => r.name !== name);
	}

	/** Execute all cleanup functions in reverse order with a global timeout. */
	async shutdown(): Promise<void> {
		if (this.shutdownStarted) {
			TurbineEventLoop.emit("log", "warning", "Shutdown: Already in progress, skipping duplicate call.");
			return;
		}
		this.shutdownStarted = true;

		TurbineEventLoop.emit("log", "info", `Shutdown: Disposing ${this.resources.length} resources...`);

		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error("Shutdown timed out")), SHUTDOWN_TIMEOUT);
		});

		try {
			await Promise.race([this.disposeAll(), timeoutPromise]);
			TurbineEventLoop.emit("log", "info", "Shutdown: All resources disposed.");
		} catch (err) {
			TurbineEventLoop.emit("log", "error", `Shutdown: ${(err as Error).message}`);
		}
	}

	private async disposeAll(): Promise<void> {
		// Reverse order — last registered is first disposed
		const reversed = [...this.resources].reverse();

		for (const resource of reversed) {
			try {
				TurbineEventLoop.emit("log", "info", `Shutdown: Disposing ${resource.name}...`);
				await resource.cleanup();
			} catch (err) {
				TurbineEventLoop.emit("log", "error", `Shutdown: Failed to dispose ${resource.name}: ${(err as Error).message}`);
			}
		}
	}
}
