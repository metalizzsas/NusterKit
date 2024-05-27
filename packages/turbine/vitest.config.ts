import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({

    plugins: [tsconfigPaths()],

    test: {
        exclude: ["./build"],
        include: ["./src/**/*.unit.test.ts"]
    }
});