import fs from "fs";
import path from "path";

import { TurbineEventLoop } from "./events";
import { prisma } from "./db";

export type MigratedProfile = {

    name: string;
    skeleton: string;
    modificationDate: Date;

    values: Array<{ key: string, value: number }>;

}

export type MigratedMaintenance = {

    name: string;
    duration: number;
    operationDate?: Date;

}

export type MigratedContainer = {

    name: string;

    loadedProductType: string;
    loadedProductDate: Date;

}

export const migrate = async (basePath: string) => {

    const migrationFile = path.resolve(basePath, 'db-migration.json');

    if(!fs.existsSync(migrationFile))
    {
        TurbineEventLoop.emit('log', 'warning', 'DB Migration: Migration file do not exists. Have you exported the database using Nuster 1.12.9?');
        return;
    }

    TurbineEventLoop.emit('log', 'warning', 'DB Migration: Migration file exists. Starting migration process.');

    const migrationFileContent = fs.readFileSync(migrationFile, { encoding: 'utf-8' });

    const migrationData = JSON.parse(migrationFileContent) as {
        migratedProfiles: Array<MigratedProfile>,
        migratedMaintenances: Array<MigratedMaintenance>,
        migratedContainers: Array<MigratedContainer>
    };

    for(const profile of migrationData.migratedProfiles)
    {
        await prisma.profile.create({
            data: {
                name: profile.name,
                skeleton: profile.skeleton,
                modificationDate: profile.modificationDate,
                values: {
                    create: profile.values
                }
            }
        });
    }

    TurbineEventLoop.emit('log', 'warning', `DB Migration: Migrated ${migrationData.migratedProfiles.length} profiles.`);

    await prisma.container.deleteMany({});

    for(const container of migrationData.migratedContainers)
    {
        await prisma.container.create({
            data: {
                name: container.name,
                loadedProductType: container.loadedProductType,
                loadDate: container.loadedProductDate
            }
        });
    }

    TurbineEventLoop.emit('log', 'warning', `DB Migration: Migrated ${migrationData.migratedContainers.length} containers.`);

    await prisma.maintenance.deleteMany({});

    for(const maintenance of migrationData.migratedMaintenances)
    {
        await prisma.maintenance.create({
            data: {
                name: maintenance.name,
                duration: maintenance.duration,
                operationDate: maintenance.operationDate
            }
        });
    }
    
    TurbineEventLoop.emit('log', 'warning', `DB Migration: Migrated ${migrationData.migratedMaintenances.length} maintenances.`);
    TurbineEventLoop.emit('log', 'warning', 'DB Migration: Migration process ended.');

    fs.unlinkSync(migrationFile);
}