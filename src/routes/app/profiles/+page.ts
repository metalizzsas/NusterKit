import { goto, invalidate } from '$app/navigation';
import '$lib/app.css';
import ModalPrompt from '$lib/components/modals/modalprompt.svelte';
import NavContainer from '$lib/components/navigation/navcontainer.svelte';
import Profile from '$lib/components/profile/profile.svelte';
import type { Profile as ProfileModel } from '$lib/utils/interfaces';
import { Linker } from '$lib/utils/linker';
import { navActions, navBackFunction, navTitle, useNavContainer } from '$lib/utils/navstack';
import type { PageLoad } from '@sveltejs/kit';
import { onDestroy } from 'svelte';
import { _ } from 'svelte-i18n';

throw new Error("@migration task: Check if you need to migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: PageLoad = async (ctx) => {
	let profilesList = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles`,
	);

	let profileSkeletons = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/skeletons`,
	);

	return {
		profiles: await profilesList.json(),
		profileSkeletons: await profileSkeletons.json(),
	};
};
