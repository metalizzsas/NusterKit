import fs from "fs/promises";
import path from "path";

async function getFiles(root: string, directory: string): Promise<string[]>
{
    const subFolders = await fs.readdir(path.resolve(root, directory), { withFileTypes: true });
    const files: Array<string> = [];

    for(const folder of subFolders)
    {
        if(folder.isDirectory())
            files.push(...await getFiles(path.resolve(root, directory), folder.name));
        else
            files.push(path.resolve(root, directory, folder.name));
    }
    return files;
}

/**
 * Vite plugins that copies `@metalizzsas/nuster-misc` data to svelte static files
 * @returns Vite plugin
 */
export const documentationCopy = () => {

    return {
        name: "nuster-documentation-copy",
        buildStart: async () => {
            const files = await getFiles(path.resolve("node_modules", "@metalizzsas", "nuster-misc"), "documentation");

            files.forEach(f => {

                const newName = f.replace(new RegExp(/\/(.*)\/documentation\//), "");
                const newPath = path.resolve("static", "documentation", newName);
                const fileName = new RegExp(/.+(\/.+)$/).exec(newName)?.at(1);

                if(fileName !== undefined)
                {
                    const folderPath = path.resolve("static", "documentation", newName.replace(fileName, ""));
    
                    void fs.mkdir(folderPath, { recursive: true }).then(() => {
                        void fs.copyFile(f, newPath);
                    });
                }
            });
        }
    }
}