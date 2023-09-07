import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
import { ContainerModel, MaintenanceModel, ProfileModel } from "./models";

import fs from "fs";
import { TurbineEventLoop } from "./events";
import path from "path";

export type MigratedProfile = {

    name: string;
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

    loadedProductType: ProductSeries;
    loadedProductDate: Date;

}

export const migrate = async (basePath: string) => {

    const migrationFile = path.resolve(basePath, 'db-migration.json')

    if(fs.existsSync(migrationFile))
    {
        TurbineEventLoop.emit('log', 'warning', 'DB Migration: Migration file already exists. deleting.');
        fs.unlinkSync(migrationFile);
    }

    TurbineEventLoop.emit('log', 'warning', 'DB Migration: Starting migration process');
    const exportedFile = {
        migratedProfiles: [],
        migratedMaintenances: [],
        migratedContainers: []
    } as {
        migratedProfiles: Array<MigratedProfile>,
        migratedMaintenances: Array<MigratedMaintenance>,
        migratedContainers: Array<MigratedContainer>
    };

    const profiles = await ProfileModel.find({});
    
    for(const profile of profiles)
    {
        const profile2 = profile as unknown as Omit<typeof profile, "values"> & { values: Map<string, number> };
        
        exportedFile.migratedProfiles.push({
            name: profile.name,
            modificationDate: new Date(profile.modificationDate),
            values: [...profile2.values.keys()].map(k => ({ key: k, value: profile2.values.get(k) as number }))
        });
    }

    const containers = await ContainerModel.find({});

    for(const container of containers)
    {
        exportedFile.migratedContainers.push({
            name: container.name,
            loadedProductType: container.loadedProductType,
            loadedProductDate: new Date(container.loadDate)
        });
    }

    const maintenances = await MaintenanceModel.find({});

    for(const maintenance of maintenances)
    {
        exportedFile.migratedMaintenances.push({
            name: maintenance.name,
            duration: maintenance.duration,
            operationDate: maintenance.operationDate ? new Date(maintenance.operationDate) : undefined
        });
    }

    TurbineEventLoop.emit('log', 'warning', 'DB Migration: Ended source database data extraction.');

    fs.writeFileSync(path.resolve(basePath, 'db-migration.json'), JSON.stringify(exportedFile, null, 4));

    TurbineEventLoop.emit('log', 'warning', 'DB Migration: Exported file to /data/db-migration.json');
}