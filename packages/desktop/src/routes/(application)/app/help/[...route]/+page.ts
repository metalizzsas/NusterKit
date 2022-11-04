import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (ctx) => {

  let markdownFile = ctx.params.route;

  if(ctx.params.route.endsWith("/") || !ctx.params.route.endsWith(".md"))
    markdownFile += "index.md";
  
  const mkdRequest = await ctx.fetch("/help/" + markdownFile);

  if(mkdRequest.ok && mkdRequest.status == 200)
    return {
      markdown: await mkdRequest.text()
    }
  else
    throw error(404, "not found");
};