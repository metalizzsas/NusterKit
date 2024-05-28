import type { DocFile } from "@nuster/turbine/types/docs";
import { env } from "$env/dynamic/private";

export const load = async ({ fetch, locals }) => {

    const docFiles: DocFile[] = [];

    const nusterDocsFileRequest = await fetch(`http://localhost:${env.PORT || 4080}/docs/files.json`);
    if(nusterDocsFileRequest.status === 200 && nusterDocsFileRequest.ok)
    {
        const nusterDocsFiles = await nusterDocsFileRequest.json();
        docFiles.push(...nusterDocsFiles);
    }

    const machineDocsFileRequest = await fetch(`http://${env.TURBINE_ADDRESS}/static/docs/files.json`);
    if(machineDocsFileRequest.status === 200 && machineDocsFileRequest.ok)
    {
        const machineDocsFiles = await machineDocsFileRequest.json();
        docFiles.push(...machineDocsFiles);
    }

    return { docFiles: docFiles.filter(doc => doc.lang === locals.settings.lang) };
};