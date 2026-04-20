import { describe, test, expect, afterEach } from "vitest";
import { validateEnv } from "./validate-env";

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
});

describe("validateEnv", () => {
	test("passes in development (no required vars)", () => {
		process.env.NODE_ENV = "development";

		expect(() => validateEnv()).not.toThrow();
	});

	test("throws when production vars are missing", () => {
		process.env.NODE_ENV = "production";
		delete process.env.DATABASE_URL;
		delete process.env.BALENA_SUPERVISOR_ADDRESS;
		delete process.env.BALENA_SUPERVISOR_API_KEY;
		delete process.env.BALENA_APP_ID;

		expect(() => validateEnv()).toThrow("DATABASE_URL");
	});

	test("passes in production when all vars are set", () => {
		process.env.NODE_ENV = "production";
		process.env.DATABASE_URL = "file:/data/database.db";
		process.env.BALENA_SUPERVISOR_ADDRESS = "http://localhost:48484";
		process.env.BALENA_SUPERVISOR_API_KEY = "key123";
		process.env.BALENA_APP_ID = "123";

		expect(() => validateEnv()).not.toThrow();
	});
});
