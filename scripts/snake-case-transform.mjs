#!/usr/bin/env node
/**
 * Transforms locally-declared camelCase identifiers in packages/turbine/src to snake_case
 * and consolidates import blocks (no blank lines between imports).
 *
 * Strategy: Only rename identifiers that are DECLARED in our code.
 * This avoids renaming external library APIs (Prisma, Fastify, Node.js, etc.).
 */
import fs from "fs";
import path from "path";

const ROOT = "packages/turbine/src";

// camelCase → snake_case converter
function to_snake(name) {
	return name
		.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
		.toLowerCase();
}

// Check if an identifier is camelCase
function is_camel_case(name) {
	if (/^[A-Z]/.test(name)) return false; // PascalCase
	if (!/[A-Z]/.test(name)) return false; // already snake_case or lowercase
	if (name.length <= 1) return false;
	if (name.startsWith("_")) {
		const rest = name.slice(1);
		if (/^[A-Z]/.test(rest)) return false;
		return /[A-Z]/.test(rest);
	}
	return true;
}

// Walk and collect .ts files (excluding .d.ts declaration files)
function walk_files(dir, include_dts = false) {
	const files = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk_files(full, include_dts));
		} else if (entry.name.endsWith(".ts")) {
			if (!include_dts && entry.name.endsWith(".d.ts")) continue;
			files.push(full);
		}
	}
	return files;
}

// Identifiers we explicitly keep as-is (even if detected as "declared")
const NEVER_RENAME = new Set([
	// Node.js globals
	"setTimeout", "clearTimeout", "setInterval", "clearInterval",
	"setImmediate", "clearImmediate", "isNaN", "parseInt", "parseFloat",
	"structuredClone", "queueMicrotask",
	// Fastify
	"toJSON", "preHandler", "serializerCompiler", "validatorCompiler",
	"jsonSchemaTransform", "routePrefix", "parseAs",
	"addContentTypeParser", "withTypeProvider",
	// Node.js / EventEmitter
	"setMaxListeners", "addListener", "removeAllListeners",
	"removeListener", "listenerCount", "eventNames",
	"rawListeners", "prependListener",
	// Vitest
	"beforeEach", "afterEach", "beforeAll", "afterAll",
	"toBe", "toEqual", "toContain", "toBeGreaterThan",
	"toBeGreaterThanOrEqual", "toBeLessThan", "toBeDefined",
	"toBeUndefined", "toHaveBeenCalledWith", "toHaveBeenCalled",
	"toHaveProperty", "toThrow", "mockResolvedValue",
	"mockRejectedValue", "mockReturnValue", "useFakeTimers",
	"useRealTimers", "advanceTimersByTime", "getTimerCount",
	// Buffer methods
	"readUintLE", "writeUint32LE", "writeUint16LE", "readUInt16LE",
	"readUInt32LE", "writeUInt16LE", "writeUInt32LE",
	// modbus-serial
	"connectTCP", "isOpen", "writeRegister", "writeCoil",
	"readHoldingRegisters", "readCoils", "setID",
	// enip-ts
	"dataItem",
	// Prisma client methods
	"findUnique", "findMany", "findFirst", "createMany",
	"updateMany", "deleteMany", "upsert",
	// WebSocket
	"readyState", "binaryType",
	// Zod
	"openapi", "contentType",
	// Common JS string/array/object methods
	"charCodeAt", "codePointAt", "fromCharCode",
	"toFixed", "toString", "valueOf", "indexOf", "findIndex",
	"startsWith", "endsWith", "includes", "trimStart", "trimEnd",
	"padStart", "padEnd", "toUpperCase", "toLowerCase",
	"localeCompare", "lastIndexOf", "matchAll",
	// Fastify request/reply
	"statusCode",
	// Process/env
	"nextTick",
]);

// Auto-collect ALL camelCase identifiers from types/ directory
// These define JSON/DB/API contracts (properties AND methods) that must not be renamed
function collect_type_identifiers(dir) {
	const id_pattern = /\b([a-z_][a-zA-Z0-9_]*)\b/g;
	const ids = new Set();
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			for (const p of collect_type_identifiers(full)) ids.add(p);
		} else if (entry.name.endsWith(".ts")) {
			const content = fs.readFileSync(full, "utf-8");
			for (const m of content.matchAll(id_pattern)) {
				if (/[A-Z]/.test(m[1]) && m[1].length > 1) ids.add(m[1]);
			}
		}
	}
	return ids;
}

const type_identifiers = collect_type_identifiers(path.join(ROOT, "types"));
for (const p of type_identifiers) NEVER_RENAME.add(p);
console.log(`  Auto-excluded ${type_identifiers.size} type contract identifiers.`);

const all_files = walk_files(ROOT);

// Exclude files that define data contracts (JSON schema, API responses, Prisma)
// Types/ and schemas/ define external contracts that must not be renamed.
const scannable_files = all_files.filter(f => !f.includes("/types/") && !f.includes("/schemas/"));

// ─────────────────────────────────────────────────
// Phase 1: Collect identifiers that are DECLARED in our code
// ─────────────────────────────────────────────────
console.log("Phase 1: Collecting declared camelCase identifiers...");

const declared_identifiers = new Set();

// Patterns that indicate a LOCAL declaration
const DECLARATION_PATTERNS = [
	// const/let/var declarations: const myVar = ...
	/\b(?:const|let|var)\s+([a-z_][a-zA-Z0-9_]*)\b/g,
	// Function declarations: function myFunc(
	/\bfunction\s+([a-z_][a-zA-Z0-9_]*)\s*[(<]/g,
	// Arrow/method params: (myParam, myParam2) or (myParam: Type)
	/[(,]\s*([a-z_][a-zA-Z0-9_]*)\s*[,:)?\]]/g,
	// Class properties/methods: indented myProp or public myProp or private myProp
	/^\s+(?:public|private|protected|readonly|static|override|abstract|async)*\s*([a-z_][a-zA-Z0-9_]*)\s*[(:=!?;]/gm,
	// Destructured: { myVar, otherVar } or { myVar: alias }
	/[{,]\s*([a-z_][a-zA-Z0-9_]*)\s*[,}:]/g,
	// for...of/in: for (const myVar of/in ...)
	/\bfor\s*\(\s*(?:const|let|var)\s+([a-z_][a-zA-Z0-9_]*)\b/g,
	// Named exports: export const/function/class
	/\bexport\s+(?:const|let|var|function|async\s+function)\s+([a-z_][a-zA-Z0-9_]*)\b/g,
	// catch (err)
	/\bcatch\s*\(\s*([a-z_][a-zA-Z0-9_]*)\s*\)/g,
];

// NOTE: Type/interface property patterns intentionally excluded.
// Type properties define data contracts (JSON files, Prisma, API responses)
// and must not be renamed to avoid breaking serialization.

// Special handling for import destructuring
const IMPORT_NAMED_REGEX = /\bimport\s*(?:type\s*)?\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
const IMPORT_DEFAULT_REGEX = /\bimport\s+([a-z_][a-zA-Z0-9_]*)\s+from\s*["']([^"']+)["']/g;
const IMPORT_STAR_REGEX = /\bimport\s*\*\s*as\s+([a-z_][a-zA-Z0-9_]*)\s+from\s*["']([^"']+)["']/g;

// Track external named imports that must NOT be renamed
const external_imports = new Set();

for (const file of scannable_files) {
	const content = fs.readFileSync(file, "utf-8");

	const is_external = (mod) => !mod.startsWith(".") && !mod.startsWith("$");

	// Named imports
	for (const match of content.matchAll(IMPORT_NAMED_REGEX)) {
		const names_str = match[1];
		const module_path = match[2];
		const names = names_str.split(",");

		for (let n of names) {
			n = n.trim();
			// Strip "type " prefix
			if (n.startsWith("type ")) n = n.slice(5).trim();

			// For "original as alias", the original is the external name (don't rename),
			// the alias is a local binding (rename if local)
			if (n.includes(" as ")) {
				const [original, alias] = n.split(" as ").map(s => s.trim());
				// If from external package, the original name is fixed
				if (is_external(module_path)) {
					external_imports.add(original);
				}
				// The alias is always a local declaration
				if (is_camel_case(alias)) declared_identifiers.add(alias);
			} else {
				if (is_external(module_path)) {
					// Named import from external = fixed name, don't rename
					external_imports.add(n);
				} else {
					// Named import from local module = our code, rename
					if (is_camel_case(n)) declared_identifiers.add(n);
				}
			}
		}
	}

	// Default imports — always a local binding regardless of source
	for (const match of content.matchAll(IMPORT_DEFAULT_REGEX)) {
		if (is_camel_case(match[1])) declared_identifiers.add(match[1]);
	}

	// Star imports — always a local alias
	for (const match of content.matchAll(IMPORT_STAR_REGEX)) {
		if (is_camel_case(match[1])) declared_identifiers.add(match[1]);
	}

	// All other declaration patterns
	for (const pattern of DECLARATION_PATTERNS) {
		// Reset lastIndex for each file
		const regex = new RegExp(pattern.source, pattern.flags);
		for (const match of content.matchAll(regex)) {
			const name = match[1];
			if (name && is_camel_case(name)) {
				declared_identifiers.add(name);
			}
		}
	}
}

// Remove NEVER_RENAME items and external imports
for (const skip of NEVER_RENAME) {
	declared_identifiers.delete(skip);
}
for (const ext of external_imports) {
	declared_identifiers.delete(ext);
}

console.log(`  Found ${declared_identifiers.size} declared camelCase identifiers.`);
console.log(`  Excluded ${external_imports.size} external import names.`);

// Build the rename map
const rename_map = new Map();
for (const id of declared_identifiers) {
	const snake = to_snake(id);
	if (snake !== id) {
		rename_map.set(id, snake);
	}
}

console.log(`  Will rename ${rename_map.size} identifiers.\n`);

// ─────────────────────────────────────────────────
// Phase 2: Apply renames + consolidate imports
// ─────────────────────────────────────────────────
console.log("Phase 2: Applying transforms...");

let files_modified = 0;

// Apply renames to scannable files (excludes types/, schemas/, and .d.ts)
for (const file of scannable_files) {
	let content = fs.readFileSync(file, "utf-8");
	const original = content;

	// --- Consolidate imports: remove blank lines between import/export-from statements ---
	const lines = content.split("\n");
	const consolidated = [];
	let in_import_block = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const is_import = /^(import|export)\s/.test(line.trimStart()) &&
			(line.includes("from") || line.startsWith("import "));
		const is_blank = line.trim() === "";

		if (is_import) {
			in_import_block = true;
			consolidated.push(line);
		} else if (in_import_block && is_blank) {
			// Check if next non-blank line is also an import
			let next_i = i + 1;
			while (next_i < lines.length && lines[next_i].trim() === "") next_i++;
			if (next_i < lines.length && /^(import|export)\s/.test(lines[next_i].trimStart()) && lines[next_i].includes("from")) {
				// Skip this blank line
			} else {
				in_import_block = false;
				consolidated.push(line);
			}
		} else {
			in_import_block = false;
			consolidated.push(line);
		}
	}

	content = consolidated.join("\n");

	// --- Rename identifiers ---
	// Sort by length descending to avoid partial replacements
	const sorted_renames = [...rename_map.entries()].sort((a, b) => b[0].length - a[0].length);

	for (const [old_name, new_name] of sorted_renames) {
		const regex = new RegExp(`\\b${old_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "g");
		content = content.replace(regex, new_name);
	}

	if (content !== original) {
		fs.writeFileSync(file, content);
		files_modified++;
	}
}

console.log(`  Modified ${files_modified} files.\n`);
console.log("Done! Run 'npx tsc --noEmit' to check for errors.");
