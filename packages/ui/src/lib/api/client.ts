import createClient from "openapi-fetch";
import type { paths } from "./openapi";

export type TurbineClient = ReturnType<typeof createClient<paths>>;

export function createTurbineClient(baseUrl: string, customFetch?: typeof fetch) {
	return createClient<paths>({
		baseUrl,
		fetch: customFetch,
	});
}
