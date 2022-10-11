module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        extraFileExtensions: [".svelte"],
    },
    overrides: [
        {
            files: ["*.svelte"],
            parser: "svelte-eslint-parser",
            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },
        {
            files: [".ts"],
            parser: "@typescript-eslint/parser"
        }
    ],
};