import fs from "fs";
import path from "path";

import { SpecsSchema as fileSchema } from "@metalizzsas/nuster-typings";
import { matchers } from 'jest-json-schema';

expect.extend(matchers);

let files = fs.readdirSync(path.resolve("src", "data"), { withFileTypes: true }).filter(k => k.isDirectory()).map(k => k.name);

for(const file of files)
{
    test(`Validating JSON Schema for ${file} specs.json.`, () => {
        const fileContent = JSON.parse(fs.readFileSync(path.resolve("src", "data", file, "specs.json"), "utf-8"));
        expect(fileContent).toMatchSchema(fileSchema);
    });
}