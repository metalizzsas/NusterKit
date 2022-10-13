module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: { // add these parser options
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.svelte'],
        ecmaVersion: 2019,
        sourceType: 'module'
    },
    env: {
        es6: true,
        browser: true
    },
    plugins: [
        'svelte3',
        '@typescript-eslint'
    ],
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
    settings: {
        'svelte3/typescript': require('typescript'),
        'svelte3/compiler': require('svelte/compiler'),
    },
    extends: [ // then, enable whichever type-aware rules you want to use
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    rules: {
        "no-unsafe-member-access": 0
    }
};