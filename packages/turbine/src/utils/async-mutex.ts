/**
 * A minimal Promise-based async mutex.
 * Guarantees that only one holder can be inside the critical section at a time.
 */
export class AsyncMutex {
	private _queue: Array<() => void> = [];
	private _locked = false;

	async acquire(timeout_ms?: number): Promise<void> {
		if (!this._locked) {
			this._locked = true;
			return;
		}
		return new Promise<void>((resolve, reject) => {
			let timer: ReturnType<typeof setTimeout> | undefined;
			let settled = false;

			const wrapped_resolve = () => {
				if (settled) return;
				settled = true;
				if (timer) clearTimeout(timer);
				resolve();
			};

			this._queue.push(wrapped_resolve);

			if (timeout_ms !== undefined) {
				timer = setTimeout(() => {
					if (settled) return;
					settled = true;
					const idx = this._queue.indexOf(wrapped_resolve);
					if (idx !== -1) this._queue.splice(idx, 1);
					reject(new Error(`AsyncMutex: acquire timed out after ${timeout_ms}ms`));
				}, timeout_ms);
			}
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
