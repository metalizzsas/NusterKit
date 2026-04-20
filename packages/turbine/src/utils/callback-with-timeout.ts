/**
 * Wraps an event-callback promise pattern with a timeout.
 * If the callback is not invoked within `ms` milliseconds, rejects with an error.
 */
export function callback_with_timeout<T = void>(executor: (resolve: (value: T) => void) => void, ms: number, label: string): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		let settled = false;
		const timer = setTimeout(() => {
			if (!settled) {
				settled = true;
				reject(new Error(`callback_with_timeout: "${label}" timed out after ${ms}ms`));
			}
		}, ms);

		executor((value: T) => {
			if (!settled) {
				settled = true;
				clearTimeout(timer);
				resolve(value);
			}
		});
	});
}
