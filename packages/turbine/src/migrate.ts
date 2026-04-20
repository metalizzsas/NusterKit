import fs from "fs";
import path from "path";
import { prisma } from "./db";
import { TurbineEventLoop } from "./events";

export type MigratedProfile = {
	name: string;
	skeleton: string;
	modificationDate: Date;

	values: Array<{ key: string; value: number }>;
};

export type MigratedMaintenance = {
	name: string;
	duration: number;
	operationDate?: Date;
};

export type MigratedContainer = {
	name: string;

	loadedProductType: string;
	loaded_product_date: Date;
};

export const migrate = async (base_path: string) => {
	const migration_file = path.resolve(base_path, "db-migration.json");

	if (!fs.existsSync(migration_file)) {
		TurbineEventLoop.emit("log", "warning", "DB Migration: Migration file do not exists. Have you exported the database using Nuster 1.12.9?");
		return;
	}

	TurbineEventLoop.emit("log", "warning", "DB Migration: Migration file exists. Starting migration process.");

	const migration_file_content = fs.readFileSync(migration_file, { encoding: "utf-8" });

	let migration_data: {
		migrated_profiles: Array<MigratedProfile>;
		migrated_maintenances: Array<MigratedMaintenance>;
		migrated_containers: Array<MigratedContainer>;
	};

	try {
		migration_data = JSON.parse(migration_file_content);
	} catch (ex) {
		TurbineEventLoop.emit("log", "error", `DB Migration: Failed to parse ${migration_file}: ${(ex as Error).message}. Skipping migration.`);
		return;
	}

	for (const profile of migration_data.migrated_profiles) {
		await prisma.profile.create({
			data: {
				name: profile.name,
				skeleton: profile.skeleton,
				modificationDate: profile.modificationDate,
				values: {
					create: profile.values,
				},
			},
		});
	}

	TurbineEventLoop.emit("log", "warning", `DB Migration: Migrated ${migration_data.migrated_profiles.length} profiles.`);

	await prisma.container.deleteMany({});

	for (const container of migration_data.migrated_containers) {
		await prisma.container.create({
			data: {
				name: container.name,
				loadedProductType: container.loadedProductType,
				loadDate: container.loaded_product_date,
			},
		});
	}

	TurbineEventLoop.emit("log", "warning", `DB Migration: Migrated ${migration_data.migrated_containers.length} containers.`);

	await prisma.maintenance.deleteMany({});

	for (const maintenance of migration_data.migrated_maintenances) {
		await prisma.maintenance.create({
			data: {
				name: maintenance.name,
				duration: maintenance.duration,
				operationDate: maintenance.operationDate,
			},
		});
	}

	TurbineEventLoop.emit("log", "warning", `DB Migration: Migrated ${migration_data.migrated_maintenances.length} maintenances.`);
	TurbineEventLoop.emit("log", "warning", "DB Migration: Migration process ended.");

	fs.unlinkSync(migration_file);
};
