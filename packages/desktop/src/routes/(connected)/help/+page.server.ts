import type { PageServerLoad } from "../$types";

type HelpRootFile = {
    lang: "fr" | "en" | "it";
    category: "machine" | "software";
    files: {
            name: string;
            path: string;
            folder: string | undefined;
    }[];
};

export type HelpDocument = {
    category: "machine" | "software";
    lang: "fr" | "en" | "it";
    name: string;
    folder: string | undefined;
    path: string;
}

export const load = (async () => {

    const documents: Array<HelpDocument> = [];

    const filesIndexes = import.meta.glob("../../../../static/documentation/**/files.json", { query: "?json" });

    for(const file in filesIndexes)
    {
        const files = await filesIndexes[file]() as HelpRootFile;

        for(const file of files.files)
        {
            documents.push({
                category: files.category,
                lang: files.lang,
                name: file.name,
                folder: file.folder,
                path: file.path
            });
        }
    }

    return { documents };

}) satisfies PageServerLoad;