import { describe, test, expect, vi, afterEach } from "vitest";
import { validateEnv } from "./validateEnv";

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
});

describe("validateEnv", () => {
	test("passes when PORT is set in development", () => {
		process.env.NODE_ENV = "development";
		process.env.PORT = "4080";

		expect(() => validateEnv()).not.toThrow();
	});

	test("throws when PORT is missing", () => {
		process.env.NODE_ENV = "development";
		delete process.env.PORT;

		expect(() => validateEnv()).toThrow("Missing required environment variables");
		expect(() => validateEnv()).toThrow("PORT");
	});

	test("throws when production vars are missing in production", () => {
		process.env.NODE_ENV = "production";
		process.env.PORT = "4080";
		delete process.env.DATABASE_URL;
		delete process.env.BALENA_SUPERVISOR_ADDRESS;
		delete process.env.BALENA_SUPERVISOR_API_KEY;
		delete process.env.BALENA_APP_ID;

		expect(() => validateEnv()).toThrow("DATABASE_URL");
	});

	test("passes in production when all vars are set", () => {
		process.env.NODE_ENV = "production";
		process.env.PORT = "4080";
		process.env.DATABASE_URL = "file:/data/database.db";
		process.env.BALENA_SUPERVISOR_ADDRESS = "http://localhost:48484";
		process.env.BALENA_SUPERVISOR_API_KEY = "key123";
		process.env.BALENA_APP_ID = "123";

		expect(() => validateEnv()).not.toThrow();
	});

	test("warns for missing optional vars in development", () => {
		process.env.NODE_ENV = "development";
		process.env.PORT = "4080";
		delete process.env.SIMULATION_ADDRESS;
		delete process.env.SIMULATION_PORT;

		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		validateEnv();

		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("SIMULATION_ADDRESS"));
		warnSpy.mockRestore();
	});
});
