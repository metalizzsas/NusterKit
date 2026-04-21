/**
 * Extract the OpenAPI spec from Fastify routes at build time.
 *
 * This script boots a minimal Fastify instance, registers all route plugins
 * with stub options (handlers are never invoked), and writes the generated
 * OpenAPI JSON to `openapi.json` at the package root.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import {
	machine_routes,
	system_routes,
	io_routes,
	profile_routes,
	maintenance_routes,
	container_routes,
	cycle_routes,
	call_to_action_routes,
	network_routes,
} from "../src/routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
	const app = Fastify({ logger: false });

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	await app.register(fastifySwagger, {
		openapi: {
			info: {
				title: "NusterKit Turbine API",
				description: "Machine control API for NusterKit industrial systems",
				version: "3.0.0",
			},
		},
		transform: jsonSchemaTransform,
	});

	// Register all route plugins with minimal stub options.
	// Handlers are never executed — we only need the schema metadata.
	app.register(machine_routes, {
		machines_path: "/dev/null",
		production_enabled: false,
		soft_exit: async () => {},
		get_machine: () => undefined,
	});

	app.register(system_routes, {
		update_file: "/dev/null",
		settings_path: "/dev/null",
		soft_exit: async () => {},
	});

	app.register(io_routes, {
		prefix: "/v1/io",
		gates: [] as never,
	});

	app.register(profile_routes, {
		prefix: "/v1/profiles",
		profiles_router: {} as never,
	});

	app.register(maintenance_routes, {
		prefix: "/v1/maintenances",
		tasks: [],
	});

	app.register(container_routes, {
		prefix: "/v1/containers",
		containers: [],
	});

	app.register(cycle_routes, {
		prefix: "/v1/cycle",
		cycleTypes: [],
		cyclePremades: [],
		state: { program: undefined },
	});

	app.register(call_to_action_routes, {
		prefix: "/v1/calltoaction",
	});

	app.register(network_routes, {
		prefix: "/network",
		network_router: {} as never,
	});

	await app.ready();

	const spec = app.swagger();
	const outPath = path.resolve(__dirname, "..", "openapi.json");
	fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));

	console.log(`OpenAPI spec written to ${outPath}`);
	await app.close();
}

main().catch((err) => {
	console.error("Failed to extract OpenAPI spec:", err);
	process.exit(1);
});
