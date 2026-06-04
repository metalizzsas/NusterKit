<script lang="ts">
	import { _ } from "svelte-i18n";
	import { page } from "$app/stores";
	import { Icon } from "@steeze-ui/svelte-icon";
	import {
		Square3Stack3d,
		UserCircle,
		Beaker,
		Wrench,
		QuestionMarkCircle,
		CommandLine,
		Cog6Tooth,
	} from "@steeze-ui/heroicons";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { realtime, realtimeConnected } from "$lib/utils/stores/nuster";
	import { computeContainersState, computeMaintenancesState } from "$lib/utils/state";
	import { cn } from "$lib/utils/cn.js";

	let containersState = $derived(computeContainersState($realtime.containers, $realtime.io).result);
	let maintenancesState = $derived(computeMaintenancesState($realtime.maintenance));

	let cycleMode = $derived($realtime.cycle?.status.mode);
	let cycleDot = $derived.by(() => {
		if (!$realtime.cycle) return null;
		if (cycleMode === "started") return "bg-emerald-500 animate-pulse";
		if (cycleMode === "paused") return "bg-amber-500";
		return "bg-indigo-500";
	});

	const stateDot = (s: "good" | "warn" | "error" | "info") => {
		if (s === "error") return "bg-red-500 animate-pulse";
		if (s === "warn") return "bg-amber-500 animate-pulse";
		if (s === "info") return "bg-indigo-500";
		return null;
	};

	let containerDot = $derived(stateDot(containersState));
	let maintenanceDot = $derived(stateDot(maintenancesState));

	let updateAvailable = $derived(
		$page.data.machine_configuration.hypervisorData?.appState !== "applied" &&
			$page.data.machine_configuration.hypervisorData?.overallDownloadProgress === null,
	);
	let settingsDot = $derived(updateAvailable ? "bg-indigo-500 animate-pulse" : null);

	let showProfiles = $derived(
		$page.data.machine_configuration.settings.profilesShown === true ||
			$page.data.machine_configuration.settings.devMode === true,
	);
	let devMode = $derived($page.data.machine_configuration.settings.devMode === true);

	const path = $derived($page.url.pathname);
	const isActive = (href: string, exclusive = false) =>
		exclusive ? path === href : path === href || path.startsWith(href + "/");

	/* Refined nav buttons: muted by default, brand-indigo "pill" when active.
	   A thin left accent bar reinforces the selected state without a heavy gray slab. */
	const navItemClass = [
		"relative h-12 px-3 gap-3.5 rounded-xl font-medium text-[0.95rem] transition-all duration-200",
		"text-zinc-500 hover:bg-zinc-900/[0.04] hover:text-zinc-900",
		"dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100",
		"data-[active=true]:bg-indigo-500/10 data-[active=true]:text-indigo-700 data-[active=true]:font-semibold data-[active=true]:hover:bg-indigo-500/10 data-[active=true]:hover:text-indigo-700",
		"dark:data-[active=true]:bg-indigo-400/10 dark:data-[active=true]:text-indigo-200 dark:data-[active=true]:hover:bg-indigo-400/10 dark:data-[active=true]:hover:text-indigo-200",
		"data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-5 data-[active=true]:before:w-[3px] data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-indigo-500 dark:data-[active=true]:before:bg-indigo-400",
		"group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:before:hidden",
	].join(" ");

	const iconClass = "size-[1.35rem] shrink-0";
	const dotClass = "absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full";
</script>

<Sidebar.Root collapsible="icon" class="border-r border-zinc-200 dark:border-white/5">
	<Sidebar.Header class="p-3 group-data-[collapsible=icon]:p-2">
		<a
			href="/"
			class="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-zinc-200/60 dark:hover:bg-white/5 group-data-[collapsible=icon]:justify-center"
			aria-label={$_("nuster.lead")}
		>
			<div class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg">
				<img
					src="/icons/icon-t-192.png"
					alt={$_("nuster.logo")}
					class="h-8 w-8"
				/>
			</div>
			<div class="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
				<span class="truncate text-base font-semibold tracking-tight">{$_("nuster.lead")}</span>
				<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<span
						class={cn(
							"h-1.5 w-1.5 rounded-full",
							$realtimeConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse",
						)}
					></span>
					{$realtimeConnected ? "online" : "offline"}
				</span>
			</div>
		</a>
	</Sidebar.Header>

	<Sidebar.Content class="px-2 group-data-[collapsible=icon]:px-1">
		<Sidebar.Group class="p-0">
			<Sidebar.GroupContent>
				<Sidebar.Menu class="gap-1">
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={isActive("/", true)}
							tooltipContent={$_("cycle.lead")}
							size="lg"
							class={navItemClass}
						>
							{#snippet child({ props })}
								<a href="/" {...props}>
									<span class="relative grid place-items-center">
										<Icon src={Square3Stack3d} theme="solid" class={iconClass} />
										{#if cycleDot}
											<span class={cn(dotClass, cycleDot)}></span>
										{/if}
									</span>
									<span class="truncate group-data-[collapsible=icon]:hidden">{$_("cycle.lead")}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>

					{#if showProfiles}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={isActive("/profiles")}
								tooltipContent={$_("profile.lead")}
								size="lg"
								class={navItemClass}
							>
								{#snippet child({ props })}
									<a href="/profiles" {...props}>
										<span class="grid place-items-center">
											<Icon src={UserCircle} theme="solid" class={iconClass} />
										</span>
										<span class="truncate group-data-[collapsible=icon]:hidden">{$_("profile.lead")}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}

					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={isActive("/containers")}
							tooltipContent={$_("container.lead")}
							size="lg"
							class={navItemClass}
						>
							{#snippet child({ props })}
								<a href="/containers" {...props}>
									<span class="relative grid place-items-center">
										<Icon src={Beaker} theme="solid" class={iconClass} />
										{#if containerDot}
											<span class={cn(dotClass, containerDot)}></span>
										{/if}
									</span>
									<span class="truncate group-data-[collapsible=icon]:hidden">{$_("container.lead")}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>

					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={isActive("/maintenances")}
							tooltipContent={$_("maintenance.lead")}
							size="lg"
							class={navItemClass}
						>
							{#snippet child({ props })}
								<a href="/maintenances" {...props}>
									<span class="relative grid place-items-center">
										<Icon src={Wrench} theme="solid" class={iconClass} />
										{#if maintenanceDot}
											<span class={cn(dotClass, maintenanceDot)}></span>
										{/if}
									</span>
									<span class="truncate group-data-[collapsible=icon]:hidden">{$_("maintenance.lead")}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>

					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={isActive("/help")}
							tooltipContent={$_("help.lead")}
							size="lg"
							class={navItemClass}
						>
							{#snippet child({ props })}
								<a href="/help" {...props}>
									<span class="grid place-items-center">
										<Icon src={QuestionMarkCircle} theme="solid" class={iconClass} />
									</span>
									<span class="truncate group-data-[collapsible=icon]:hidden">{$_("help.lead")}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>

					{#if devMode}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={isActive("/io")}
								tooltipContent={$_("gates.lead")}
								size="lg"
								class={navItemClass}
							>
								{#snippet child({ props })}
									<a href="/io" {...props}>
										<span class="grid place-items-center">
											<Icon src={CommandLine} theme="solid" class={iconClass} />
										</span>
										<span class="truncate group-data-[collapsible=icon]:hidden">{$_("gates.lead")}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="p-2">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					isActive={isActive("/settings")}
					tooltipContent={$_("settings.lead")}
					size="lg"
					class={navItemClass}
				>
					{#snippet child({ props })}
						<a href="/settings" {...props}>
							<span class="relative grid place-items-center">
								<Icon src={Cog6Tooth} theme="solid" class={iconClass} />
								{#if settingsDot}
									<span class={cn(dotClass, settingsDot)}></span>
								{/if}
							</span>
							<span class="truncate group-data-[collapsible=icon]:hidden">{$_("settings.lead")}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
