// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type Pocketbase, { BaseAuthStore } from "pocketbase";

// and what to do when importing types
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: Pocketbase,
			user: BaseAuthStore["model"] | undefined
		}
		interface PageData {
			user: BaseAuthStore["model"] | undefined
		}
		// interface Platform {}
	}
}

export {};
