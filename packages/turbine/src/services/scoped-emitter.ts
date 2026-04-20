/**
 * A lightweight typed EventEmitter scoped to a subsystem lifecycle.
 * Disposing the emitter removes ALL listeners at once — no manual cleanup needed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ScopedEmitter<Events extends Record<string, (...args: any[]) => void>> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>();
	private disposed = false;

	on<K extends keyof Events>(event: K, listener: Events[K]): void {
		if (this.disposed) return;
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(listener);
	}

	off<K extends keyof Events>(event: K, listener: Events[K]): void {
		this.listeners.get(event)?.delete(listener);
	}

	emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
		if (this.disposed) return;
		const set = this.listeners.get(event);
		if (set) {
			for (const listener of set) {
				listener(...args);
			}
		}
	}

	/** Remove ALL listeners for ALL events. Called when the owning subsystem is destroyed. */
	dispose(): void {
		this.disposed = true;
		this.listeners.clear();
	}

	listenerCount<K extends keyof Events>(event: K): number {
		return this.listeners.get(event)?.size ?? 0;
	}
}
