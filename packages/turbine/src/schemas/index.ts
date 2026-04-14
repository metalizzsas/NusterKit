import { z } from "zod";

// ============================================================
// Shared / Reusable schemas
// ============================================================

export const ProfileValueSchema = z.object({
	name: z.string(),
	value: z.number(),
	type: z.string().optional(),
	unity: z.string().optional(),
	detailsShown: z.boolean().optional(),
});

export const ProfileHydratedSchema = z.object({
	id: z.string(),
	name: z.string(),
	skeleton: z.string(),
	isPremade: z.boolean(),
	modificationDate: z.coerce.date(),
	values: z.array(ProfileValueSchema),
});

export const CyclePremadeSchema = z.object({
	name: z.string(),
	cycle: z.string(),
	profile: z.string().optional(),
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
	name: z.string(),
	io: z.string(),
	value: z.number().optional(),
	unity: z.string().optional(),
});

export const ContainerHydratedSchema = z.object({
	name: z.string(),
	type: z.string(),
	isProductable: z.boolean(),
	productData: ContainerProductDataSchema.optional(),
	sensors: z.array(ContainerSensorHydratedSchema).optional(),
	regulations: z.array(ContainerRegulationHydratedSchema).optional(),
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
});

export const AccessPointSchema = z.object({
	ssid: z.string(),
	strength: z.number(),
	frenquency: z.number(), // note: typo preserved from original type
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

export const AddonSchema = z.object({
	addonName: z.string(),
}).passthrough();

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
