/**
 * Local type definitions for types that are NOT derivable from the OpenAPI spec.
 * These replace imports from @nuster/turbine for WebSocket messages, component
 * display types, and utility types.
 */
import type { ProfileHydrated, Configuration } from "$lib/api/types";
export type { ProfileHydrated } from "$lib/api/types";

// ============================================================
// Utility types
// ============================================================

export type Modify<T, R> = Omit<T, keyof R> & R;

// ============================================================
// Machine data
// ============================================================

export type MachineData = Configuration & {
	turbineVersion: string;
	nuster?: Nuster;
	hypervisorData?: HypervisorData;
	vpnData?: VPNData;
};

interface HypervisorData {
	status: string;
	appState: string;
	overallDownloadProgress?: number;
	containers: {
		status: string;
		serviceName: string;
		appId: number;
		imageId: number;
		serviceId: number;
		containerId: string;
		createdAt: string;
	}[];
	images: {
		name: string;
		appId: number;
		serviceName: string;
		imageId: number;
		dockerImageId: string;
		status: string;
		downloadProgress?: number;
	}[];
	release: string;
}

interface VPNData {
	status: string;
	vpn: {
		enabled: boolean;
		connected: boolean;
	};
}

// ============================================================
// Nuster spec types
// ============================================================

type Nuster = {
	connectPopup?: Popup<CallToAction>;
	homeInformations?: Array<HomeInfo>;
};

export type CallToAction = {
	name: string;
	APIEndpoint?: {
		url: string;
		method: "get" | "put" | "post" | "delete";
		body?: unknown;
	};
	UIEndpoint?: string;
};

export type CallToActionFront = {
	name: string;
	id: string;
};

export interface Popup<T extends CallToAction | CallToActionFront> {
	title: string;
	message: string;
	level: "info" | "warn" | "error";
	callToActions?: T[];
	payload?: Record<string, string>;
}

type HomeInfoIO = { type: "io"; path: string };
type HomeInfoContainerRegulationState = { type: "container.regulation.state"; path: [string, string] };
type HomeInfoContainerRegulationTarget = { type: "container.regulation.target"; path: [string, string] };
type HomeInfo = HomeInfoIO | HomeInfoContainerRegulationState | HomeInfoContainerRegulationTarget;

// ============================================================
// Container types (extended from OpenAPI)
// ============================================================

export type ContainerHydrated = {
	name: string;
	type: string;
	isProductable: boolean;
	productData?: ContainerProductData;
	sensors?: ContainerSensorHydrated[];
	regulations?: ContainerRegulationHydrated[];
	callToAction?: CallToAction[];
	supportedProductSeries?: string[];
};

export type ContainerProductData = {
	loadedProductType: string;
	loadDate: string;
	lifetimeRemaining: number;
};

export type ContainerSensorHydrated = {
	name: string;
	io: string;
	value?: number;
	unity?: string;
	logic?: string;
};

export type ContainerRegulationHydrated = {
	name: string;
	current: number;
	currentUnity?: string;
	state: boolean;
	target: number;
	maxTarget: number;
};

// ============================================================
// IO types
// ============================================================

export type IOGateJSON = {
	name: string;
	type: string;
	locked: boolean;
	category: string;
	value: number;
	unity?: string;
	bus: "in" | "out";
	size: "bit" | "word";
	mapOutMin?: number;
	mapOutMax?: number;
};

// ============================================================
// Cycle / PBR types
// ============================================================

export type PBRMode = "creating" | "created" | "started" | "paused" | "ending" | "ended";

export interface PBRVariable {
	name: string;
	value: number;
}

export interface PBRTimer {
	name: string;
	enabled: boolean;
}

export type PBRStatus = {
	mode: PBRMode;
	estimatedRunTime?: number;
	overallPausedTime?: number;
	pausable: boolean;
	startDate?: number;
	endDate?: number;
	endReason?: string;
	progress?: number;
};

export type PBRStartConditionHydrated = {
	name: string;
	result: string;
};

export type ProgramBlockRunnerHydrated = {
	name: string;
	profileRequired: boolean;
	status: PBRStatus;
	timers: Array<PBRTimer & { timer?: unknown }>;
	variables: PBRVariable[];
	currentStepIndex: number;
	runConditions: PBRStartConditionHydrated[];
	steps: PBRStepHydrated[];
	profile?: ProfileHydrated;
	additionalInfo?: string[];
	events: Array<{ data: string; time: number }>;
};

export type PBRStepHydrated = {
	name: string;
	type: string;
	state: string;
	isEnabled: boolean;
	runAmount: number;
	runCount: number;
	duration: number | null;
	progress: number | null;
	progresses: Array<number | null>;
	startTime?: number;
	endTime?: number;
	endReason?: string;
};

// ============================================================
// Realtime / WebSocket types
// ============================================================

export type MaintenanceHydrated = {
	name: string;
	durationType: "cycle" | "duration" | "sensor";
	duration: number;
	durationMax: number;
	durationProgress: number;
	sensorUnit?: string;
	operationDate?: string;
};

export interface Status {
	cycle?: ProgramBlockRunnerHydrated;
	containers: ContainerHydrated[];
	io: IOGateJSON[];
	maintenance: MaintenanceHydrated[];
	network: {
		accessPoints: AccessPoint[];
		devices: NetworkDevice[];
	};
}

type AccessPoint = {
	ssid: string;
	strength: number;
	frenquency: number;
	encryption: number;
	active: boolean;
	path: string;
};

type NetworkDevice = {
	iface: string;
	path: string;
	address?: string;
	gateway?: string;
	subnet?: string;
};

export type WebsocketData = StatusMessage | PopupMessage;

type StatusMessage = {
	type: "status";
	message: Status;
};

type PopupMessage = {
	type: "popup";
	message: Popup<CallToActionFront>;
};

// ============================================================
// Docs types
// ============================================================

export type DocFile = {
	name: string;
	lang: string;
	type: "machine" | "nuster";
	folder: string;
	href: string;
};

// ============================================================
// Machine specs (for configuration pages)
// ============================================================

export type MachineSpecsList = Record<string, unknown>;
