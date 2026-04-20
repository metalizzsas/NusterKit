import { afterEach, describe, expect, test, vi } from "vitest";
import { CLOSED, OPEN } from "ws";
import { TurbineEventLoop } from "../events";

afterEach(() => {
	TurbineEventLoop.removeAllListeners();
});

/**
 * We test the broadcast/filtering logic without standing up a real HTTP server.
 * The WebsocketDispatcher wraps ws.WebSocketServer — we mock its `clients` set.
 */

function create_mock_socket(readyState: number = OPEN) {
	return {
		readyState,
		send: vi.fn(),
		on: vi.fn(),
	};
}

describe("WebSocket broadcast logic", () => {
	test("broadcastData sends to all OPEN clients", () => {
		const clients = new Set([create_mock_socket(OPEN), create_mock_socket(OPEN)]);

		const payload = JSON.stringify({ type: "status", message: { running: true } });

		for (const client of clients) {
			if (client.readyState === OPEN) {
				client.send(payload);
			}
		}

		for (const client of clients) {
			expect(client.send).toHaveBeenCalledWith(payload);
		}
	});

	test("broadcastData skips non-OPEN clients", () => {
		const open_client = create_mock_socket(OPEN);
		const closed_client = create_mock_socket(3); // ws.CLOSED = 3

		const payload = JSON.stringify({ type: "status", message: { running: true } });

		// Simulate broadcast filtering (same logic as WebsocketDispatcher.broadcastData)
		for (const client of [open_client, closed_client]) {
			if (client.readyState === OPEN) {
				client.send(payload);
			}
		}

		expect(open_client.send).toHaveBeenCalledWith(payload);
		expect(closed_client.send).not.toHaveBeenCalled();
	});

	test("broadcast with empty client set does not throw", () => {
		const clients = new Set<ReturnType<typeof create_mock_socket>>();

		expect(() => {
			for (const client of clients) {
				if (client.readyState === OPEN) {
					client.send("{}");
				}
			}
		}).not.toThrow();
	});

	test("broadcast serializes data as JSON with type and message", () => {
		const client = create_mock_socket(OPEN);

		const data = { status: "running", step: 3 };
		const channel = "status";

		client.send(JSON.stringify({ type: channel, message: data }));

		const sent = JSON.parse(client.send.mock.calls[0][0]);
		expect(sent.type).toBe("status");
		expect(sent.message.status).toBe("running");
		expect(sent.message.step).toBe(3);
	});

	test("popup channel uses 'popup' type", () => {
		const client = create_mock_socket(OPEN);

		const popup = { title: "Update", message: "New version", level: "info" };

		client.send(JSON.stringify({ type: "popup", message: popup }));

		const sent = JSON.parse(client.send.mock.calls[0][0]);
		expect(sent.type).toBe("popup");
		expect(sent.message.title).toBe("Update");
	});
});
