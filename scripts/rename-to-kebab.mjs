#!/usr/bin/env node
/**
 * Renames all files and directories in packages/turbine/src to kebab-case
 * and updates all import/require paths.
 *
 * Handles case-insensitive filesystems (macOS) by using a two-step rename
 * via a temporary name when needed.
 */
import fs from "fs";
import path from "path";

const ROOT = "packages/turbine/src";

// Convert PascalCase/camelCase to kebab-case
function to_kebab(name) {
	return name
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}

// Safe rename that handles case-insensitive filesystems
function safe_rename(old_path, new_path) {
	if (old_path === new_path) return;

	// On case-insensitive FS, rename via temp to avoid collision
	const temp_path = old_path + ".__tmp_rename__";
	fs.renameSync(old_path, temp_path);
	fs.renameSync(temp_path, new_path);
}

// Walk and collect directories bottom-up (deepest first)
function walk_dirs(dir) {
	const dirs = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			const full = path.join(dir, entry.name);
			dirs.push(...walk_dirs(full));
			dirs.push(full);
		}
	}
	return dirs;
}

// Walk and collect files
function walk_files(dir) {
	const files = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walk_files(full));
		} else {
			files.push(full);
		}
	}
	return files;
}

// Phase 1: Rename directories (deepest first)
console.log("Phase 1: Renaming directories...");
const all_dirs = walk_dirs(ROOT);
let dirs_renamed = 0;

for (const dir_path of all_dirs) {
	const dir_name = path.basename(dir_path);
	const kebab_name = to_kebab(dir_name);
	if (kebab_name !== dir_name) {
		const new_path = path.join(path.dirname(dir_path), kebab_name);
		console.log(`  ${dir_name} -> ${kebab_name}`);
		safe_rename(dir_path, new_path);
		dirs_renamed++;
	}
}

console.log(`  Renamed ${dirs_renamed} directories.\n`);

// Phase 2: Rename files
console.log("Phase 2: Renaming files...");
const all_files = walk_files(ROOT);
let files_renamed = 0;

for (const file_path of all_files) {
	const file_name = path.basename(file_path);
	if (!file_name.endsWith(".ts") && !file_name.endsWith(".svelte")) continue;

	// Handle compound extensions
	let ext;
	if (file_name.endsWith(".unit.test.ts")) ext = ".unit.test.ts";
	else if (file_name.endsWith(".test.ts")) ext = ".test.ts";
	else if (file_name.endsWith(".d.ts")) ext = ".d.ts";
	else ext = path.extname(file_name);

	const base = file_name.slice(0, file_name.length - ext.length);
	const kebab_base = to_kebab(base);

	if (kebab_base !== base) {
		const new_path = path.join(path.dirname(file_path), kebab_base + ext);
		safe_rename(file_path, new_path);
		files_renamed++;
	}
}

console.log(`  Renamed ${files_renamed} files.\n`);

// Phase 3: Update all imports
console.log("Phase 3: Updating imports...");

const ts_files = walk_files(ROOT).filter(f => f.endsWith(".ts"));

function rewrite_import_segment(segment) {
	if (segment === "." || segment === "..") return segment;
	if (segment.startsWith("$")) return segment;
	const has_ext = segment.endsWith(".ts");
	const base = has_ext ? segment.slice(0, -3) : segment;
	const kebab = to_kebab(base);
	return has_ext ? kebab + ".ts" : kebab;
}

let imports_updated = 0;

for (const file_path of ts_files) {
	let content = fs.readFileSync(file_path, "utf-8");
	let changed = false;

	const import_regex = /(from\s+["'])([^"']+)(["'])/g;
	const require_regex = /(require\s*\(\s*["'])([^"']+)(["']\s*\))/g;

	function rewrite(match, prefix, import_path, suffix) {
		if (!import_path.startsWith(".") && !import_path.startsWith("$types")) {
			return match;
		}

		const segments = import_path.split("/");
		let any_changed = false;

		for (let i = 0; i < segments.length; i++) {
			if (segments[i] === "." || segments[i] === "..") continue;
			if (segments[i] === "$types") continue;

			const new_seg = rewrite_import_segment(segments[i]);
			if (new_seg !== segments[i]) {
				segments[i] = new_seg;
				any_changed = true;
			}
		}

		if (any_changed) {
			changed = true;
			return prefix + segments.join("/") + suffix;
		}
		return match;
	}

	content = content.replace(import_regex, rewrite);
	content = content.replace(require_regex, rewrite);

	if (changed) {
		fs.writeFileSync(file_path, content);
		imports_updated++;
	}
}

console.log(`  Updated imports in ${imports_updated} files.\n`);
console.log("Done! Run 'npx tsc --noEmit' to verify.");
