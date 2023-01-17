import type { PageServerLoad } from "../$types";

type helpFile = {
    lang: string,
    folder: string | undefined,
    name: string,
    filename: string;
};

type langFile = {
    lang: string;
    filename: string;
};

export const load = (() => {

    const helpFolder = import.meta.glob("../../../static/help/**/*.md", { as: "raw" });
    const langFiles = import.meta.glob("../../../static/help/**/*.json", { as: "raw" });

    const list = Object.keys(helpFolder).map(k => k.replace("../../../static/help", ""));
    const langList = Object.keys(langFiles).map(k => k.replace("../../../static/help", ""));

    const regex = new RegExp(/\/(\w*)\/?(\w*)?\/(\w*)\./);
    
    const files: Array<helpFile> = [];
    const langs: Array<langFile> = [];

    for(const file of list) {

        const reg = regex.exec(file);

        if(reg != null)
        {
            if(reg[3] === "export")
                continue;
            
            files.push({
                lang: reg[1],
                folder: reg[2],
                name: reg[3],
                filename: file
            });
        }
    }

    for(const lang of langList)
    {
        const reg = regex.exec(lang);

        if(reg != null)
        {
            langs.push({
                lang: reg[1],
                filename: lang
            });
        }
    }

    return { files, langs };

}) satisfies PageServerLoad;