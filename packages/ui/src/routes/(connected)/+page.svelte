<script lang="ts">

    import Flex from "$lib/components/layout/flex.svelte";
    import { _, date as i18n_date } from "svelte-i18n";

	import Wrapper from "$lib/components/Wrapper.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import Cycle from "./Cycle.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { ActionData, PageData } from "./$types";
	import Gate from "$lib/components/io/Gate.svelte";
	import Toggle from "$lib/components/inputs/Toggle.svelte";
	import Label from "$lib/components/Label.svelte";
	import { page } from "$app/stores";
	import { enhance } from "$app/forms";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ArrowLeft, ArrowPath, Bolt, ChevronRight, Folder, Square3Stack3d, UserCircle } from "@steeze-ui/heroicons";
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";
	import { cn } from "$lib/utils/cn.js";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    /** Wizard state — undefined: step 1 (pick a cycle type), set: step 2 (pick a profile). */
    let selected_type_name: string | undefined = $state(undefined);

    let cycle_data = $derived($realtime.cycle);

    let selected_type = $derived(data.cycleStartOptions.find((t) => t.name === selected_type_name));

    /* ── Step 2 folder filter ─────────────────────────────────────────
       "all" = every profile, null = profiles without a folder, string = that folder. */
    let folder_filter = $state<string | null | "all">("all");

    let folders = $derived(
        [...new Set((selected_type?.profiles ?? []).map((p) => p.folder).filter((f): f is string => typeof f === "string" && f.length > 0))].sort(
            (a, b) => a.localeCompare(b),
        ),
    );

    let filtered_profiles = $derived(
        (selected_type?.profiles ?? []).filter((p) => folder_filter === "all" || (p.folder ?? null) === folder_filter),
    );

    $effect(() => {
        // Reset the folder filter whenever the selected cycle type changes
        void selected_type_name;
        folder_filter = "all";
    });

    // When a cycle is prepared, remember its type so "change selection" lands back on step 2.
    $effect(() => {
        if (cycle_data !== undefined && cycle_data.status.mode === "created") {
            const option = data.cycleStartOptions.find((t) => t.name === cycle_data?.name);
            selected_type_name = option !== undefined && option.profiles.length > 0 ? option.name : undefined;
        }
    });

    const chip_class = (active: boolean) =>
        cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
            active
                ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
                : "bg-zinc-200/60 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-100",
        );
</script>

<PageHeader title={$_(`cycle.lead`)}>
	{#snippet actions()}
		{#if cycle_data !== undefined && cycle_data.status.mode === "created"}
			<form action="?/patchCycle" method="post" use:enhance>
				<button
					type="submit"
					class="flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-200"
				>
					<Icon src={ArrowPath} theme="mini" class="h-4 w-4" />
					{$_("cycle.start.change_selection")}
				</button>
			</form>
		{/if}
	{/snippet}
</PageHeader>

{#if cycle_data === undefined}

	{@const has_home_informations = $page.data.machine_configuration.nuster?.homeInformations !== undefined}
	<Flex direction="row" gap={6}>
		<div class={cn("min-w-0", has_home_informations ? "shrink-0 basis-3/5" : "grow")}>

			{#if selected_type === undefined}

				<!-- ── Step 1 · pick a cycle type ─────────────────────────── -->
				<p class="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
					<span class="font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-300">{$_("cycle.start.step_type")}</span>
					<span class="mx-1.5">·</span>{$_("cycle.start.choose_type")}
				</p>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{#each data.cycleStartOptions as cycle_type (cycle_type.name)}
						{@const has_profiles = cycle_type.profiles.length > 0}
						{#if has_profiles || !cycle_type.profileRequired}
							<form action="?/prepareCycle" method="post" use:enhance>
								<input type="hidden" name="cycle_type" value={cycle_type.name} />
								<button
									type={has_profiles ? "button" : "submit"}
									onclick={has_profiles ? () => (selected_type_name = cycle_type.name) : undefined}
									class={cn(
										"group flex min-h-[6.5rem] w-full flex-col justify-between gap-3 rounded-xl border border-border bg-white p-4 text-left transition-all duration-200 dark:bg-zinc-800",
										"hover:border-indigo-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
									)}
								>
									<div class="flex w-full items-center gap-3">
										<div
											class={cn(
												"grid h-11 w-11 shrink-0 place-items-center rounded-lg",
												has_profiles
													? "bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300"
													: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300",
											)}
										>
											<Icon src={has_profiles ? Square3Stack3d : Bolt} theme="solid" class="h-6 w-6" />
										</div>
										<h2 class="min-w-0 grow text-base font-semibold leading-snug">
											{$_(`cycle.names.${cycle_type.name}`)}
										</h2>
										<Icon
											src={ChevronRight}
											theme="mini"
											class="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5"
										/>
									</div>

									<p class="text-xs text-zinc-500 dark:text-zinc-400">
										{#if has_profiles}
											{cycle_type.profiles.length === 1
												? $_("cycle.start.profile_count_one")
												: $_("cycle.start.profile_count", { values: { n: cycle_type.profiles.length } })}
										{:else}
											{$_("cycle.start.no_profile_needed")}
										{/if}
									</p>
								</button>
							</form>
						{/if}
					{/each}
				</div>

			{:else}

				<!-- ── Step 2 · pick a profile ────────────────────────────── -->
				<Flex items="center" gap={3} class="mb-3">
					<button
						type="button"
						onclick={() => (selected_type_name = undefined)}
						class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-white text-zinc-600 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:bg-zinc-800 dark:text-zinc-300"
						aria-label={$_("cycle.start.back_to_types")}
					>
						<Icon src={ArrowLeft} theme="mini" class="h-5 w-5" />
					</button>
					<p class="min-w-0 text-sm text-zinc-500 dark:text-zinc-400">
						<span class="font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-300">{$_("cycle.start.step_profile")}</span>
						<span class="mx-1.5">·</span>{$_("cycle.start.choose_profile")}
						<span class="mx-1.5">—</span><span class="font-medium text-zinc-700 dark:text-zinc-200">{$_(`cycle.names.${selected_type.name}`)}</span>
					</p>
				</Flex>

				{#if folders.length > 0}
					<!-- Folder filter chips -->
					<div class="-my-1 mb-2 flex items-center gap-2 overflow-x-auto py-1">
						<button type="button" onclick={() => (folder_filter = "all")} class={chip_class(folder_filter === "all")}>
							{$_("profile.folder.all")}
						</button>
						{#each folders as folder (folder)}
							<button type="button" onclick={() => (folder_filter = folder)} class={chip_class(folder_filter === folder)}>
								<Icon src={Folder} theme="solid" class="h-4 w-4 opacity-70" />
								{folder}
							</button>
						{/each}
						<button type="button" onclick={() => (folder_filter = null)} class={chip_class(folder_filter === null)}>
							{$_("profile.folder.none")}
						</button>
					</div>
				{/if}

				{#if filtered_profiles.length > 0}
					<div class="overflow-hidden rounded-xl border border-border bg-white dark:bg-zinc-800">
						{#each filtered_profiles as profile, index (profile.id)}
							<form action="?/prepareCycle" method="post" use:enhance>
								<input type="hidden" name="cycle_type" value={selected_type.name} />
								<input type="hidden" name="profile_id" value={profile.id} />
								<button
									type="submit"
									class={cn(
										"group flex w-full items-center gap-3 p-3.5 text-left transition-colors",
										"hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:bg-indigo-50/60 dark:hover:bg-indigo-500/10 dark:focus-visible:bg-indigo-500/10",
										index > 0 && "border-t border-border",
									)}
								>
									<div
										class={cn(
											"grid h-10 w-10 shrink-0 place-items-center rounded-lg",
											profile.isPremade
												? "bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300"
												: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300",
										)}
									>
										<Icon src={profile.isPremade ? Square3Stack3d : UserCircle} theme="solid" class="h-6 w-6" />
									</div>
									<div class="min-w-0 grow">
										<h3 class="truncate text-base font-semibold leading-snug">
											{translateProfileName($_, profile)}
										</h3>
										<p class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
											{#if profile.isPremade}
												{$_("profile.premades.true")}
											{:else}
												{#if profile.modificationDate}
													<span class="truncate">{$i18n_date(new Date(profile.modificationDate), { format: "medium" })}</span>
												{/if}
												{#if profile.folder && folder_filter === "all"}
													<span class="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-200/60 px-1.5 py-0.5 font-medium text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
														<Icon src={Folder} theme="solid" class="h-3 w-3 opacity-70" />
														{profile.folder}
													</span>
												{/if}
											{/if}
										</p>
									</div>
									<Icon
										src={ChevronRight}
										theme="mini"
										class="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5"
									/>
								</button>
							</form>
						{/each}
					</div>
				{:else}
					<div class="rounded-xl border border-border bg-white dark:bg-zinc-800">
						{#if selected_type.profiles.length === 0}
							<EmptyState
								icon={UserCircle}
								title={$_("cycle.start.no_compatible_profiles")}
								description={$_("cycle.start.no_compatible_profiles_sub")}
							/>
						{:else}
							<!-- The folder filter emptied the list — the chips above stay available -->
							<EmptyState icon={Folder} title={$_("profile.filter.empty_title")} />
						{/if}
					</div>
				{/if}

			{/if}
		</div>

		<!-- ── Right panel · machine info ─────────────────────────────── -->
		{#if has_home_informations}
			<div class="grow">
				<Wrapper>
					<h3>{$_('cycle.unselected_informations.lead')}</h3>
					<p class="mt-2 mb-6">{$_('cycle.unselected_informations.sub')}</p>

					<Flex direction="col">
							{#each $page.data.machine_configuration.nuster.homeInformations as homeInfo}
								{#if homeInfo.type === "io"}
									{@const gate = $realtime.io.find(k => k.name === homeInfo.path)}
									{#if gate !== undefined}
										<Gate io={gate} editable={false}/>
									{/if}
								{:else if homeInfo.type === "container.regulation.state"}
									{@const regulationState = $realtime.containers.find(k => k.name === homeInfo.path.at(0))?.regulations?.find(k => k.name === homeInfo.path.at(1))?.state}
									{#if regulationState !== undefined}
										<Flex items="center">
											<p>{$_(`containers.${homeInfo.path[0]}.regulations.${homeInfo.path[1]}`)} → {$_('container.regulation.enabled')}</p>
											<div class="h-[1px] grow bg-zinc-500/50" />
											<Toggle value={regulationState} locked={true}/>
										</Flex>
									{/if}
								{:else if homeInfo.type === "container.regulation.target"}
									{@const regulation = $realtime.containers.find(k => k.name === homeInfo.path.at(0))?.regulations?.find(k => k.name === homeInfo.path.at(1))}
									{#if regulation !== undefined}
										<Flex items="center">
											<p>{$_(`containers.${homeInfo.path[0]}.regulations.${homeInfo.path[1]}`)} → {$_('container.regulation.target')}</p>
											<div class="h-[1px] grow bg-zinc-500/50" />
											<Label>{regulation.target} <span class="font-semibold">{regulation.currentUnity}</span></Label>
										</Flex>
									{/if}
								{/if}
							{/each}
					</Flex>
				</Wrapper>
			</div>
		{/if}
	</Flex>

{:else}

	<Wrapper>
		<Cycle />
	</Wrapper>

{/if}
