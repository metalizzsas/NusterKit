import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TurbineEventLoop } from "../../events";
import { RevolutionPi } from "./revolution-pi";

/**
 * The RevPi handler operates on the piControl process image as a plain file.
 * Tests stand a temp file in for /dev/piControl0 and verify the byte-level
 * semantics against the known process-image conventions.
 */
describe("RevolutionPi handler", () => {
	let device_path: string;
	let handler: RevolutionPi;

	beforeEach(async () => {
		device_path = join(tmpdir(), `revpi-test-${Date.now()}-${Math.random()}`);
		// Pre-allocate 4 KiB like the real process image
		await fs.writeFile(device_path, Buffer.alloc(4096));
	});

	afterEach(async () => {
		await handler?.dispose();
		TurbineEventLoop.removeAllListeners();
		try {
			await fs.unlink(device_path);
		} catch {
			// already gone
		}
	});

	async function make_handler(): Promise<RevolutionPi> {
		handler = new RevolutionPi(device_path);
		// constructor kicks off connect() async — give it a tick to settle
		for (let i = 0; i < 10 && !handler.connected; i++) {
			await new Promise((r) => setTimeout(r, 5));
		}
		return handler;
	}

	test("connects to an existing device file", async () => {
		await make_handler();
		expect(handler.connected).toBe(true);
		expect(handler.unreachable).toBe(false);
	});

	test("marks handler unreachable when device file is missing", async () => {
		handler = new RevolutionPi(join(tmpdir(), "does-not-exist"));
		for (let i = 0; i < 10 && !handler.unreachable; i++) {
			await new Promise((r) => setTimeout(r, 5));
		}
		expect(handler.connected).toBe(false);
		expect(handler.unreachable).toBe(true);
	});

	test("word round-trip (int16 little-endian)", async () => {
		await make_handler();
		await handler.writeData(100, 0x1234, "word");
		const v = await handler.readData(100, "word");
		expect(v).toBe(0x1234);

		// Negative signed int16
		await handler.writeData(200, -42, "word");
		const n = await handler.readData(200, "word");
		expect(n).toBe(-42);
	});

	test("dword round-trip (int32 little-endian)", async () => {
		await make_handler();
		await handler.writeData(300, 0x7fff_ffff, "dword");
		expect(await handler.readData(300, "dword")).toBe(0x7fff_ffff);

		await handler.writeData(308, -123_456, "dword");
		expect(await handler.readData(308, "dword")).toBe(-123_456);
	});

	test("bit round-trip across all 8 bits of one byte without disturbing neighbours", async () => {
		await make_handler();
		// Pre-set neighbouring bytes to 0xFF — they must stay 0xFF
		await handler.writeData(50, 0xffff, "word");

		const base_byte = 54; // away from the neighbours above
		for (let bit = 0; bit < 8; bit++) {
			const addr = base_byte * 8 + bit;
			await handler.writeData(addr, 1, "bit");
			expect(await handler.readData(addr, "bit")).toBe(1);

			// All other bits in the same byte must still read 0
			for (let other = 0; other < 8; other++) {
				if (other === bit) continue;
				expect(await handler.readData(base_byte * 8 + other, "bit")).toBe(0);
			}

			await handler.writeData(addr, 0, "bit");
			expect(await handler.readData(addr, "bit")).toBe(0);
		}

		// Neighbours still intact
		expect(await handler.readData(50, "word")).toBe(Buffer.from([0xff, 0xff]).readInt16LE(0));
	});

	test("bit write is read-modify-write safe — other bits in the byte preserved", async () => {
		await make_handler();
		const byte_offset = 128;

		// Prime the byte with bits 0, 2, 4, 6 set → 0b01010101 = 0x55
		const seed = Buffer.alloc(1);
		seed[0] = 0x55;
		const fd = await fs.open(device_path, "r+");
		await fd.write(seed, 0, 1, byte_offset);
		await fd.close();

		// Flip bit 1 via the handler
		await handler.writeData(byte_offset * 8 + 1, 1, "bit");

		// Expect 0x57 (0b01010111)
		const check = Buffer.alloc(1);
		const rfd = await fs.open(device_path, "r");
		await rfd.read(check, 0, 1, byte_offset);
		await rfd.close();
		expect(check[0]).toBe(0x57);
	});

	test("toJSON exposes type + devicePath", async () => {
		await make_handler();
		expect(handler.toJSON()).toEqual({ type: "revolutionpi", devicePath: device_path });
	});
});
