import { z } from "zod";

// ============================================================
// Base / leaf schemas
// ============================================================

export const ComparatorSchema = z.enum(["==", "===", "!=", "!==", ">", "<", ">=", "<="]);

// ============================================================
// Parameter block schemas (recursive via z.lazy)
// ============================================================

export const StringParameterBlocksSchema = z.union([z.string(), z.object({ string: z.string() })]);

// NumericParameterBlocks is recursive (e.g. add: NumericParameterBlocks[]).
// We define the shape one level deep; inner items use z.unknown() to avoid
// circular $ref in OpenAPI output.
const NumericInnerSchema = z.unknown();

export const NumericParameterBlocksSchema = z.union([
	z.number(),
	z.object({ number: z.number() }),
	z.object({ add: z.array(NumericInnerSchema) }),
	z.object({ multiply: z.array(NumericInnerSchema) }),
	z.object({ sub: z.tuple([NumericInnerSchema, NumericInnerSchema]) }),
	z.object({ divide: z.tuple([NumericInnerSchema, NumericInnerSchema]) }),
	z.object({ reverse: NumericInnerSchema }),
	z.object({
		conditional: z.object({
			comparison: z.tuple([NumericInnerSchema, ComparatorSchema, NumericInnerSchema]),
			value_if_true: NumericInnerSchema,
			value_if_false: NumericInnerSchema,
		}),
	}),
	z.object({ io_read: StringParameterBlocksSchema }),
	z.object({ profile: StringParameterBlocksSchema }),
	z.object({ read_var: StringParameterBlocksSchema }),
	z.object({ read_machine_var: StringParameterBlocksSchema }),
	z.object({
		get_regulation_state: z.object({
			container: StringParameterBlocksSchema,
			regulation: StringParameterBlocksSchema,
		}),
	}),
]);

export const StatusParameterBlocksSchema = z.union([
	z.object({
		maintenance_status: z.union([StringParameterBlocksSchema, z.tuple([StringParameterBlocksSchema, NumericParameterBlocksSchema])]),
	}),
	z.object({ product_status: StringParameterBlocksSchema }),
]);

// ============================================================
// Program block schemas (recursive via z.lazy)
// ============================================================

// AllProgramBlocks is recursive (for/if/while contain blocks: AllProgramBlocks[]).
// Inner block arrays use z.unknown() to avoid circular $ref.
const BlockArraySchema = z.array(z.unknown());

export const AllProgramBlocksSchema = z.union([
	z.object({ for: z.object({ limit: NumericParameterBlocksSchema, blocks: BlockArraySchema }) }),
	z.object({
		if: z.object({
			comparison: z.tuple([NumericParameterBlocksSchema, ComparatorSchema, NumericParameterBlocksSchema]),
			true_blocks: BlockArraySchema,
			false_blocks: BlockArraySchema.optional(),
		}),
	}),
	z.object({
		while: z.object({
			comparison: z.tuple([NumericParameterBlocksSchema, ComparatorSchema, NumericParameterBlocksSchema]),
			blocks: BlockArraySchema,
		}),
	}),
	z.object({ sleep: NumericParameterBlocksSchema }),
	z.object({ stop: StringParameterBlocksSchema }),
	z.object({ set_var: z.tuple([StringParameterBlocksSchema, NumericParameterBlocksSchema]) }),
	z.object({
		start_timer: z.object({
			timer_name: StringParameterBlocksSchema,
			timer_interval: NumericParameterBlocksSchema,
			blocks: BlockArraySchema,
		}),
	}),
	z.object({ stop_timer: StringParameterBlocksSchema }),
	z.object({ load_container: z.tuple([StringParameterBlocksSchema, StringParameterBlocksSchema]) }),
	z.object({ unload_container: StringParameterBlocksSchema }),
	z.object({ io_write: z.tuple([StringParameterBlocksSchema, NumericParameterBlocksSchema]) }),
	z.object({ append_maintenance: z.tuple([StringParameterBlocksSchema, NumericParameterBlocksSchema]) }),
	z.object({
		set_regulation_state: z.object({
			container: StringParameterBlocksSchema,
			regulation: StringParameterBlocksSchema,
			state: NumericParameterBlocksSchema,
		}),
	}),
]);

// ============================================================
// Nuster / CallToAction schemas
// ============================================================

export const CallToActionSchema = z.object({
	name: z.string(),
	APIEndpoint: z
		.object({
			url: z.string(),
			method: z.enum(["get", "put", "post", "delete"]),
			body: z.unknown().optional(),
		})
		.optional(),
	UIEndpoint: z.string().optional(),
});

export const PopupSchema = z.object({
	title: z.string(),
	message: z.string(),
	level: z.enum(["info", "warn", "error"]),
	callToActions: z.array(CallToActionSchema).optional(),
	payload: z.record(z.string(), z.string()).optional(),
});

const HomeInfoSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("io"), path: z.string() }),
	z.object({ type: z.literal("container.regulation.state"), path: z.tuple([z.string(), z.string()]) }),
	z.object({ type: z.literal("container.regulation.target"), path: z.tuple([z.string(), z.string()]) }),
]);

export const NusterSchema = z.object({
	connectPopup: PopupSchema.optional(),
	homeInformations: z.array(HomeInfoSchema).optional(),
});

// ============================================================
// IO schemas
// ============================================================

const IOGateBaseSchema = z.object({
	name: z.string(),
	size: z.enum(["bit", "word"]),
	bus: z.enum(["in", "out"]),
	type: z.enum(["default", "mapped", "pt100"]),
	controllerId: z.number(),
	address: z.number(),
	default: z.number(),
	unity: z.string().optional(),
});

export const IOGateSpecSchema = IOGateBaseSchema.extend({
	mapOutMin: z.number().optional(),
	mapOutMax: z.number().optional(),
	mapInMin: z.number().optional(),
	mapInMax: z.number().optional(),
});

const IOHandlerBaseSchema = z.object({
	type: z.string(),
	ip: z.string(),
	ioScannerInterval: z.number().optional(),
});

export const IOHandlerSpecSchema = IOHandlerBaseSchema.extend({
	size: z.union([z.literal(16), z.literal(32)]).optional(),
});

// ============================================================
// Container spec schemas
// ============================================================

export const ContainerProductSchema = z.object({
	lifespan: z.number().optional(),
});

const ContainerSensorSpecSchema = z.object({
	io: z.string(),
	logic: z.enum(["level-min", "level-max", "level-limit-max", "presence"]).optional(),
});

const ContainerRegulationSecuritySchema = z.union([
	z.object({ name: z.string(), value: z.number() }),
	z.object({ name: z.string(), valueDiff: z.number() }),
]);

const ContainerRegulationSpecSchema = z.object({
	name: z.string(),
	target: z.number(),
	maxTarget: z.number(),
	securityMax: z.number(),
	security: z.array(ContainerRegulationSecuritySchema),
	sensor: z.string(),
	active: z.array(z.string()),
	plus: z.array(z.string()),
	minus: z.array(z.string()),
});

export const ContainerSpecSchema = z.object({
	name: z.string(),
	type: z.string(),
	sensors: z.array(ContainerSensorSpecSchema).optional(),
	regulations: z.array(ContainerRegulationSpecSchema).optional(),
	supportedProductSeries: z.array(z.string()).optional(),
	callToAction: z.array(CallToActionSchema).optional(),
});

// ============================================================
// Maintenance spec schemas
// ============================================================

export const MaintenanceSpecSchema = z.object({
	name: z.string(),
	durationType: z.enum(["cycle", "duration", "sensor"]),
	durationLimit: z.number().optional(),
	sensorLimitValue: z.number().optional(),
	sensorBaseValue: z.number().optional(),
	sensorGate: z.string().optional(),
	requireEnableGate: z.string().optional(),
});

// ============================================================
// Profile spec schemas
// ============================================================

const ProfileSkeletonFieldBaseSchema = z.object({
	name: z.string(),
	type: z.enum(["bool", "float", "int", "incremental", "time"]),
	value: z.number(),
	unity: z.string().optional(),
	detailsShown: z.boolean().optional(),
});

export const ProfileSkeletonFieldSchema = ProfileSkeletonFieldBaseSchema.extend({
	floatMin: z.number().optional(),
	floatMax: z.number().optional(),
	floatStep: z.number().optional(),
	baseValue: z.number().optional(),
	incrementalRangeMin: z.number().optional(),
	incrementalRangeMax: z.number().optional(),
	units: z.array(z.enum(["hours", "minutes", "seconds", "milliseconds"])).optional(),
});

export const ProfileSkeletonSchema = z.object({
	name: z.string(),
	fields: z.array(ProfileSkeletonFieldSchema),
});

export const ProfileSpecSchema = z.object({
	id: z.string(),
	name: z.string(),
	skeleton: z.string(),
	values: z.array(z.object({ key: z.string(), value: z.number() })),
});

// ============================================================
// Cycle spec schemas (PBRRunCondition, PBRStep, ProgramBlockRunner)
// ============================================================

export const PBRRunConditionSchema = z.object({
	name: z.string(),
	startOnly: z.boolean(),
	checkchain: z.object({
		io: z.object({ gateName: z.string(), gateValue: z.number() }).optional(),
		parameter: StatusParameterBlocksSchema.optional(),
	}),
	disabled: NumericParameterBlocksSchema.optional(),
});

export const PBRStepSpecSchema = z.object({
	name: z.string(),
	isEnabled: NumericParameterBlocksSchema,
	runAmount: NumericParameterBlocksSchema.optional(),
	runConditions: z.array(PBRRunConditionSchema).optional(),
	partialStepFallback: z.number().optional(),
	crashStepFallback: z.number().optional(),
	startBlocks: z.array(AllProgramBlocksSchema),
	endBlocks: z.array(AllProgramBlocksSchema),
	blocks: z.array(AllProgramBlocksSchema),
});

export const ProgramBlockRunnerSpecSchema = z.object({
	name: z.string(),
	profileRequired: z.boolean(),
	pausable: z.literal(true).optional(),
	runConditions: z.array(PBRRunConditionSchema),
	steps: z.array(PBRStepSpecSchema),
	additionalInfo: z.array(z.string()).optional(),
});

// ============================================================
// Cycle premade schema (needed before addons and MachineSpecs)
// ============================================================

export const CyclePremadeSchema = z.object({
	name: z.string(),
	cycle: z.string(),
	profile: z.string().optional(),
});

// ============================================================
// Addon schemas
// ============================================================

const AddonContentSchema = z.union([
	z.object({ path: z.literal("nuster.homeInformations"), mode: z.literal("merge"), content: z.array(HomeInfoSchema) }),
	z.object({ path: z.literal("iogates"), mode: z.literal("merge"), content: z.array(IOGateSpecSchema) }),
	z.object({ path: z.literal("profilePremades"), mode: z.literal("merge"), content: z.array(ProfileSpecSchema) }),
	z.object({ path: z.literal("cyclePremades"), mode: z.literal("merge"), content: z.array(CyclePremadeSchema) }),
	z.object({ path: z.string(), mode: z.literal("merge"), content: z.array(z.string()) }),
	z.object({ path: z.string(), mode: z.literal("set"), content: z.number() }),
	z.object({ path: z.string(), mode: z.literal("set"), content: z.array(ContainerRegulationSpecSchema) }),
]);

export const AddonSchema = z.object({
	addonName: z.string(),
	content: z.array(AddonContentSchema),
});

// ============================================================
// MachineSpecs schema (GET /configs values)
// ============================================================

export const MachineSpecsSchema = z.object({
	$schema: z.string(),
	nuster: NusterSchema.optional(),
	cycleTypes: z.array(ProgramBlockRunnerSpecSchema),
	cyclePremades: z.array(CyclePremadeSchema),
	iohandlers: z.array(IOHandlerSpecSchema),
	iogates: z.array(IOGateSpecSchema),
	maintenance: z.array(MaintenanceSpecSchema),
	profileSkeletons: z.array(ProfileSkeletonSchema),
	profilePremades: z.array(ProfileSpecSchema),
	containerProducts: z.record(z.string(), ContainerProductSchema),
	containers: z.array(ContainerSpecSchema),
	variables: z.array(z.string()),
	addons: z.array(AddonSchema).optional(),
});

// ============================================================
// Hydrated response schemas (shared / reusable)
// ============================================================

export const ProfileValueSchema = z.object({
	name: z.string(),
	value: z.number(),
	type: z.string().optional(),
	unity: z.string().optional(),
	detailsShown: z.boolean().optional(),
	floatMin: z.number().optional(),
	floatMax: z.number().optional(),
	floatStep: z.number().optional(),
	baseValue: z.number().optional(),
	incrementalRangeMin: z.number().optional(),
	incrementalRangeMax: z.number().optional(),
	units: z.array(z.enum(["hours", "minutes", "seconds", "milliseconds"])).optional(),
});

export const ProfileHydratedSchema = z.object({
	id: z.string(),
	name: z.string(),
	skeleton: z.string(),
	isPremade: z.boolean(),
	modificationDate: z.coerce.date(),
	values: z.array(ProfileValueSchema),
});

export const ContainerProductDataSchema = z.object({
	loadedProductType: z.string(),
	loadDate: z.string(),
	lifetimeRemaining: z.number(),
});

export const ContainerRegulationHydratedSchema = z.object({
	name: z.string(),
	current: z.number(),
	currentUnity: z.string().optional(),
	state: z.boolean(),
	target: z.number(),
	maxTarget: z.number(),
});

export const ContainerSensorHydratedSchema = z.object({
	io: z.string(),
	logic: z.enum(["level-min", "level-max", "level-limit-max", "presence"]).optional(),
});

export const ContainerHydratedSchema = z.object({
	name: z.string(),
	type: z.string(),
	isProductable: z.boolean(),
	productData: ContainerProductDataSchema.optional(),
	sensors: z.array(ContainerSensorHydratedSchema).optional(),
	regulations: z.array(ContainerRegulationHydratedSchema).optional(),
	callToAction: z.array(CallToActionSchema).optional(),
	supportedProductSeries: z.array(z.string()).optional(),
});

export const MaintenanceHydratedSchema = z.object({
	name: z.string(),
	durationType: z.enum(["cycle", "duration", "sensor"]),
	duration: z.number(),
	durationMax: z.number(),
	durationProgress: z.number(),
	sensorUnit: z.string().optional(),
	operationDate: z.coerce.date().optional(),
});

export const IOGateJSONSchema = z.object({
	name: z.string(),
	type: z.string(),
	locked: z.boolean(),
	category: z.string(),
	value: z.number(),
	unity: z.string().optional(),
	bus: z.enum(["in", "out"]),
	size: z.enum(["bit", "word"]),
	mapOutMin: z.number().optional(),
	mapOutMax: z.number().optional(),
});

export const AccessPointSchema = z.object({
	ssid: z.string(),
	strength: z.number(),
	frenquency: z.number(),
	encryption: z.number(),
	active: z.boolean(),
	path: z.string(),
});

export const NetworkDeviceSchema = z.object({
	iface: z.string(),
	path: z.string(),
	address: z.string().optional(),
	gateway: z.string().optional(),
	subnet: z.string().optional(),
});

export const SettingsSchema = z.object({
	theme: z.string().optional(),
	lang: z.string().optional(),
});

export const SettingsVariableSchema = z.object({
	name: z.string(),
	value: z.number(),
});

export const ConfigurationSchema = z.object({
	$schema: z.string().optional(),
	name: z.string(),
	serial: z.string(),
	model: z.string(),
	addons: z.array(z.string()),
	machineAddons: z.array(AddonSchema),
	settings: z.object({
		devMode: z.boolean(),
		profilesShown: z.boolean(),
		onlyShowSelectedProfileFields: z.boolean(),
		hideMultilayerIndications: z.boolean(),
		variables: z.array(SettingsVariableSchema),
	}),
});

// ============================================================
// PBR Hydrated schemas (cycle runtime state)
// ============================================================

export const PBRStatusSchema = z.object({
	mode: z.enum(["creating", "created", "started", "paused", "ending", "ended"]),
	estimatedRunTime: z.number().optional(),
	overallPausedTime: z.number().optional(),
	pausable: z.boolean(),
	startDate: z.number().optional(),
	endDate: z.number().optional(),
	endReason: z.string().optional(),
	progress: z.number().optional(),
});

export const PBRVariableSchema = z.object({
	name: z.string(),
	value: z.number(),
});

export const PBRTimerSchema = z.object({
	name: z.string(),
	enabled: z.boolean(),
});

export const PBRStartConditionHydratedSchema = z.object({
	name: z.string(),
	startOnly: z.boolean(),
	result: z.enum(["good", "warning", "error", "disabled"]),
});

export const PBRStepHydratedSchema = z.object({
	name: z.string(),
	type: z.enum(["single", "multiple"]),
	state: z.enum(["created", "started", "disabled", "partial", "skipped", "ending", "ended", "crashed"]),
	isEnabled: z.boolean(),
	runAmount: z.number(),
	runCount: z.number(),
	duration: z.number().nullable(),
	progress: z.number().nullable(),
	progresses: z.array(z.number().nullable()),
	startTime: z.number().optional(),
	endTime: z.number().optional(),
	endReason: z.string().optional(),
});

export const ProgramBlockRunnerHydratedSchema = z.object({
	name: z.string(),
	profileRequired: z.boolean(),
	status: PBRStatusSchema,
	timers: z.array(PBRTimerSchema),
	variables: z.array(PBRVariableSchema),
	currentStepIndex: z.number(),
	runConditions: z.array(PBRStartConditionHydratedSchema),
	steps: z.array(PBRStepHydratedSchema),
	profile: ProfileHydratedSchema.optional(),
	additionalInfo: z.array(z.string()).optional(),
	events: z.array(z.object({ data: z.string(), time: z.number() })),
});

// ============================================================
// Aggregate response schemas
// ============================================================

/** Schema for GET /realtime — full machine status */
export const StatusSchema = z.object({
	cycle: ProgramBlockRunnerHydratedSchema.optional(),
	containers: z.array(ContainerHydratedSchema),
	io: z.array(IOGateJSONSchema),
	maintenance: z.array(MaintenanceHydratedSchema),
	network: z.object({
		accessPoints: z.array(AccessPointSchema),
		devices: z.array(NetworkDeviceSchema),
	}),
});

/** Schema for GET /machine — machine configuration + metadata */
export const HypervisorDataSchema = z.object({
	status: z.string(),
	appState: z.string(),
	overallDownloadProgress: z.number().optional(),
	containers: z.array(
		z.object({
			status: z.string(),
			serviceName: z.string(),
			appId: z.number(),
			imageId: z.number(),
			serviceId: z.number(),
			containerId: z.string(),
			createdAt: z.string(),
		}),
	),
	images: z.array(
		z.object({
			name: z.string(),
			appId: z.number(),
			serviceName: z.string(),
			imageId: z.number(),
			dockerImageId: z.string(),
			status: z.string(),
			downloadProgress: z.number().optional(),
		}),
	),
	release: z.string(),
});

export const VPNDataSchema = z.object({
	status: z.string(),
	vpn: z.object({
		enabled: z.boolean(),
		connected: z.boolean(),
	}),
});

export const MachineDataSchema = ConfigurationSchema.extend({
	turbineVersion: z.string(),
	nuster: NusterSchema.optional(),
	hypervisorData: HypervisorDataSchema.optional(),
	vpnData: VPNDataSchema.optional(),
});

/** Schema for GET /configs — available machine specs by model name */
export const MachineSpecsListSchema = z.record(z.string(), MachineSpecsSchema);

// ============================================================
// Route-specific param/query/body schemas
// ============================================================

// IO Routes
export const IOWriteParamsSchema = z.object({
	name: z.string().min(1),
	value: z.string(),
});

export const IOWriteQuerySchema = z.object({
	force: z.enum(["true", "false"]).optional(),
});

// Container Routes
export const ContainerLoadParamsSchema = z.object({
	container: z.string().min(1),
	series: z.string().min(1),
});

export const ContainerUnloadParamsSchema = z.object({
	container: z.string().min(1),
});

export const RegulationStateParamsSchema = z.object({
	container: z.string().min(1),
	regulation: z.string().min(1),
	state: z.enum(["true", "false"]),
});

export const RegulationTargetParamsSchema = z.object({
	container: z.string().min(1),
	regulation: z.string().min(1),
	target: z.string().regex(/^\d+$/, "Must be a number"),
});

// Cycle Routes
export const CycleStartParamsSchema = z.object({
	name: z.string().min(1),
	id: z.string().optional(),
});

// Maintenance Routes
export const MaintenanceNameParamsSchema = z.object({
	name: z.string().min(1),
});

// Profile Routes
export const ProfileIdParamsSchema = z.object({
	id: z.string().min(1),
});

// Network Routes
export const WifiConnectBodySchema = z.object({
	ssid: z.string().min(1),
	password: z.string().optional(),
});

// CallToAction Routes
export const CallToActionIdParamsSchema = z.object({
	id: z.string().min(1),
});

// ============================================================
// Common response schemas
// ============================================================

export const ErrorResponseSchema = z.object({
	error: z.string(),
});

export const OkResponseSchema = z.object({
	ok: z.literal(true),
});

export const MessageResponseSchema = z.object({
	message: z.string(),
});
