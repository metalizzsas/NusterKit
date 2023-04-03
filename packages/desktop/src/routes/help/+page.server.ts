import type { PageServerLoad } from "../$types";

type HelpRootFile = {
    lang: "fr" | "en" | "it";
    category: "machine" | "software";
    folders: Record<string, {
        name: string;
        files: {
            name: string;
            path: string;
        }[]
    }>;
}

export type HelpDocument = {
    category: "machine" | "software";
    lang: "fr" | "en" | "it";
    name: string;
    folder: string;
    path: string;
}

export const load = (async () => {

    const documents: Array<HelpDocument> = [];

    const filesIndexes = import.meta.glob("../../../static/documentation/**/files.json", { as: "json" });

    for(const file in filesIndexes)
    {
        const files = structuredClone(await filesIndexes[file]()) as HelpRootFile;

        for(const folder in files.folders)
        {
            const folderName = files.folders[folder].name;

            for(const file of files.folders[folder].files)
            {
                documents.push({
                    category: files.category,
                    lang: files.lang,
                    name: file.name,
                    folder: folderName,
                    path: file.path
                });
            }
        }
    }

    return { documents };

}) satisfies PageServerLoad;