import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

import { jsPDF } from "jspdf";
import { promises } from "fs";
import path from "path";
import type { IHistoryHydrated } from '@metalizzsas/nuster-typings/src/hydrated/cycle';

export const GET: RequestHandler = async (ctx: RequestEvent): Promise<Response> => {

    const id = ctx.params.id;
    const ip = ctx.request.headers.get("linker");

    if(id !== undefined && ip !== null)
    {
        const historyRequest = await fetch(`http://${ip}/api/v1/cycle/history/${id}`);

        if(historyRequest.status == 200)
        {
            const history = await historyRequest.json() as IHistoryHydrated;
            const document = new jsPDF();

            //TODO: Fix image loading
            const image = await promises.readFile(path.resolve("static", "icons", "pwa-192.png"), { encoding: "base64url" });

            document.addImage("data:image/png;base64," + image, "PNG", 10, 10, 20, 20);

            document.setFontSize(30);
            document.text("Nuster", 40, 22);

            document.setFontSize(25);
            document.text("History — " + history.cycle.name, 10, 80);

            document.setFontSize(18);
            document.text(`Rating: ${(history.rating ?? "—")} / 5`, 10, 90);

            //TODO fixme
            return new Response(document.output(undefined, `History-${history.id.slice(8, history.id.length - 1)}.pdf`), {headers: {'Content-Type': 'application/pdf'}});
        }
        else
        {
            throw new Error("Failed to load history from api");
        }
    }
    else
    {
        throw new Error("Failed to find parameters");
    }
};