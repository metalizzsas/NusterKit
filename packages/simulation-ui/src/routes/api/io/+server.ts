import { env } from "$env/dynamic/private";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, fetch }) => {
	const { gate, value } = (await request.json()) as { gate: string; value: number };

	if (!gate || typeof value !== "number") error(400, "Missing gate or value");

	const res = await fetch(
		`${env.SIMULATION_URL}/io/${gate.replace("#", "_")}/${value}`,
		{ method: "POST" },
	);

	if (!res.ok) error(502, "Failed to update gate");

	return json({ ok: true });
};
