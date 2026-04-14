/**
 * A minimal Promise-based async mutex.
 * Guarantees that only one holder can be inside the critical section at a time.
 */
export class AsyncMutex {
	private _queue: Array<() => void> = [];
	private _locked = false;

	async acquire(): Promise<void> {
		if (!this._locked) {
			this._locked = true;
			return;
		}
		return new Promise<void>((resolve) => {
			this._queue.push(resolve);
		});
	}

	release(): void {
		if (this._queue.length > 0) {
			const next = this._queue.shift()!;
			next();
		} else {
			this._locked = false;
		}
	}
}
