<script lang="ts">
	import { translateProfileName } from "$lib/utils/i18n/i18nprofile";

	import { Icon } from "@steeze-ui/svelte-icon";
	import {
		UserCircle,
		Square3Stack3d,
		MagnifyingGlass,
		ChevronRight,
		Folder,
	} from "@steeze-ui/heroicons";
	import { cn } from "$lib/utils/cn.js";
	import EmptyState from "$lib/components/EmptyState.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import TextField from "$lib/components/inputs/TextField.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";

	import { date as i18nDate, time as i18nTime, _ } from "svelte-i18n";
	import type { PageData } from "./$types";
	import { goto } from "$app/navigation";

	let { data }: { data: PageData } = $props();

	const PER_PAGE = 12;

	let search = $state("");
	let typeFilter = $state<"all" | "premade" | "user">("all");
	/** "all" = no folder filtering, null = profiles without a folder, string = that folder. */
	let folderFilter = $state<string | null | "all">("all");
	let currentPage = $state(1);

	/** Distinct folders across user profiles, alphabetical. */
	let folders = $derived(
		[...new Set(data.profiles.map((p) => p.folder).filter((f): f is string => typeof f === "string" && f.length > 0))].sort((a, b) =>
			a.localeCompare(b),
		),
	);

	let filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return data.profiles.filter((p) => {
			if (typeFilter === "premade" && !p.isPremade) return false;
			if (typeFilter === "user" && p.isPremade) return false;
			if (folderFilter !== "all" && (p.folder ?? null) !== folderFilter) return false;
			if (q.length === 0) return true;
			const name = translateProfileName($_, p).toLowerCase();
			return name.includes(q);
		});
	});

	$effect(() => {
		// Reset to page 1 whenever filters change
		void search;
		void typeFilter;
		void folderFilter;
		currentPage = 1;
	});

	$effect(() => {
		// Drop the folder filter if its folder disappears (e.g. last profile moved out)
		if (folderFilter !== "all" && folderFilter !== null && !folders.includes(folderFilter)) {
			folderFilter = "all";
		}
	});

	let pageItems = $derived(
		filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
	);

	const typeOptions = [
		{ value: "all", label: $_("profile.filter.all") },
		{ value: "premade", label: $_("profile.filter.premade") },
		{ value: "user", label: $_("profile.filter.user") },
	] as const;
</script>

<PageHeader title={$_("profile.lead")} />

<div class="flex flex-col gap-4">
	<!-- Filters -->
	<div class="flex flex-col gap-3 sm:flex-row">
		<div class="relative grow">
			<Icon
				src={MagnifyingGlass}
				class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<TextField
				placeholder={$_("profile.filter.search_placeholder")}
				bind:value={search}
				class="pl-10"
			/>
		</div>

		<Select.Root
			type="single"
			value={typeFilter}
			onValueChange={(v) => {
				if (v) typeFilter = v as typeof typeFilter;
			}}
		>
			<Select.Trigger class="h-11 w-full border-border bg-white text-base shadow-xs transition-colors hover:border-indigo-400 dark:bg-zinc-800 sm:w-48">
				<span data-slot="select-value">
					{typeOptions.find((o) => o.value === typeFilter)?.label}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#each typeOptions as opt (opt.value)}
					<Select.Item value={opt.value} label={opt.label} class="min-h-11 py-2 text-base">
						{opt.label}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Folder chips — only when at least one folder exists -->
	{#if folders.length > 0}
		<div class="-my-1 flex items-center gap-2 overflow-x-auto py-1">
			<button
				type="button"
				onclick={() => (folderFilter = "all")}
				class={cn(
					"shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
					folderFilter === "all"
						? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
						: "bg-zinc-200/60 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-100",
				)}
			>
				{$_("profile.folder.all")}
			</button>
			{#each folders as folder (folder)}
				<button
					type="button"
					onclick={() => (folderFilter = folder)}
					class={cn(
						"flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
						folderFilter === folder
							? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
							: "bg-zinc-200/60 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-100",
					)}
				>
					<Icon src={Folder} theme="solid" class="h-4 w-4 opacity-70" />
					{folder}
				</button>
			{/each}
			<button
				type="button"
				onclick={() => (folderFilter = null)}
				class={cn(
					"shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
					folderFilter === null
						? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200"
						: "bg-zinc-200/60 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-100",
				)}
			>
				{$_("profile.folder.none")}
			</button>
		</div>
	{/if}

	<!-- List -->
	{#if filtered.length === 0}
		<EmptyState
			icon={UserCircle}
			title={$_(search.trim().length > 0 ? "profile.filter.empty_title" : "profile.empty.title")}
			description={$_(
				search.trim().length > 0 ? "profile.filter.empty_description" : "profile.empty.description",
			)}
		/>
	{:else}
		<ul class="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
			{#each pageItems as profile (profile.id)}
				<li>
					<button
						type="button"
						onclick={() => void goto(`/profiles/${profile.id}`)}
						class="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
					>
						<div
							class="grid h-10 w-10 shrink-0 place-items-center rounded-lg {profile.isPremade
								? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300'
								: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200'}"
						>
							<Icon
								src={profile.isPremade ? Square3Stack3d : UserCircle}
								theme="solid"
								class="h-5 w-5"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-base font-semibold text-foreground">
								{translateProfileName($_, profile)}
							</p>
							<p class="flex items-center gap-2 truncate text-sm text-muted-foreground">
								{#if profile.isPremade}
									{$_("profile.premades.true")}
								{:else}
									<span class="truncate">
										{$i18nDate(new Date(profile.modificationDate), { format: "medium" })}
										—
										{$i18nTime(new Date(profile.modificationDate), { format: "short" })}
									</span>
									{#if profile.folder}
										<span class="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-300">
											<Icon src={Folder} theme="solid" class="h-3 w-3 opacity-70" />
											{profile.folder}
										</span>
									{/if}
								{/if}
							</p>
						</div>
						<Icon
							src={ChevronRight}
							class="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
						/>
					</button>
				</li>
			{/each}
		</ul>

		<!-- Pagination -->
		{#if filtered.length > PER_PAGE}
			<Pagination.Root count={filtered.length} perPage={PER_PAGE} bind:page={currentPage}>
				{#snippet children({ pages, currentPage: cp })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as p (p.key)}
							<Pagination.Item>
								{#if p.type === "ellipsis"}
									<Pagination.Ellipsis />
								{:else}
									<Pagination.Link page={p} isActive={cp === p.value}>
										{p.value}
									</Pagination.Link>
								{/if}
							</Pagination.Item>
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		{/if}

		<p class="text-center text-xs text-muted-foreground">
			{filtered.length}
			{filtered.length === 1 ? $_("profile.count.one") : $_("profile.count.other")}
		</p>
	{/if}
</div>
