/**
 * Re-exported types derived from the OpenAPI spec.
 * These replace direct imports from @nuster/turbine.
 */
import type { paths } from "./openapi";

// Helper: extract the JSON response body for a given path + method
type ResponseBody<P extends keyof paths, M extends string> =
	M extends keyof paths[P]
		? paths[P][M] extends { responses: { 200: { content: { "application/json": infer T } } } }
			? T
			: never
		: never;

// Helper: extract a single item from an array response
type ResponseItem<P extends keyof paths, M extends string> =
	ResponseBody<P, M> extends (infer T)[] ? T : ResponseBody<P, M>;

// --- Profile types ---
export type ProfileHydrated = ResponseItem<"/v1/profiles/", "get">;

// --- Maintenance types ---
export type MaintenanceHydrated = ResponseItem<"/v1/maintenances/", "get">;

// --- Cycle types ---
export type CyclePremade = ResponseItem<"/v1/cycle/premades", "get">;

// --- IO types ---
// IO routes only have POST, extract from maintenances or define based on Status
// The IOGateJSON schema is used in the status response

// --- Configuration types ---
export type Configuration = ResponseBody<"/config/actual", "get">;

// --- Settings types ---
export type Settings = ResponseBody<"/settings", "get">;

// --- Network types ---
export type AccessPoint = ResponseItem<"/network/wifi/list", "get">;
export type NetworkDevice = ResponseItem<"/network/devices", "get">;

// --- Machine Specs types ---
export type MachineSpecs = ResponseBody<"/configs", "get">[string];
