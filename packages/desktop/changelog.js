import fs from "fs";
import path from "path";

/**
 * Copy changet `CHANGELOG.md` to static files
 * @returns {import("vite").Plugin}
 */
export function changelog() {

    return {
        name: "changelog-changeset",

        buildStart() {
            fs.copyFileSync(path.resolve("CHANGELOG.md"), path.resolve("static", "CHANGELOG.md"));
        }
    }
}