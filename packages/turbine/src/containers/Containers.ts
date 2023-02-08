import { LoggerInstance } from "../app";
import { ContainerModel } from "../models";
import { ContainerRegulation } from "./ContainerRegulation";
import { TurbineEventLoop } from "../events";

import type { CallToAction } from "@metalizzsas/nuster-typings/build/spec/nuster";
import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";
import type { Container as ContainerConfig } from "@metalizzsas/nuster-typings/build/spec/containers";

import type { ContainerHydrated, ContainerProductData, ContainerSensorHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import { Products } from "./Products";

export class Container implements ContainerConfig
{
    name: string;
    type: string;

    sensors?: ContainerSensorHydrated[];
    regulations?: ContainerRegulation[];

    callToAction: CallToAction[];

    productData?: ContainerProductData;

    supportedProductSeries?: ProductSeries[];

    constructor(container: ContainerConfig)
    {        
        this.name = container.name;
        this.type = container.type;
        
        //optionals
        this.supportedProductSeries = container.supportedProductSeries;
        this.sensors = container.sensors;
        this.regulations = container.regulations?.map(r => new ContainerRegulation(this.name, r));

        this.callToAction = container.callToAction ?? [];

        TurbineEventLoop.on(`container.unload.${this.name}`, this.unloadProduct.bind(this));
        TurbineEventLoop.on(`container.load.${this.name}`, (producSeries) => { this.loadProduct(producSeries) });

        TurbineEventLoop.on(`container.read.${this.name}`, async (options) => {
            options.callback?.(await this.socketData());
        });

        for(const sensor of this.sensors ?? [])
        {
            TurbineEventLoop.on(`io.updated.${sensor.io}`, async (gate) => {
                if(sensor.logic == "level-min" && gate.value == 0 && await this.isProductLoaded() == true)
                    this.unloadProduct();
            });
        }
    }

    /**
     * Load product in 
     * @param productSeries 
     * @returns 
     */
    async loadProduct(productSeries: ProductSeries): Promise<boolean>
    {
        if(this.supportedProductSeries === undefined)
        {
            LoggerInstance.error(`Container: ${this.name} is not loadable.`);
            return false;
        }

        const slot = await ContainerModel.findOne({ name: this.name });

        if(slot === null)
        {
            LoggerInstance.info(`Container: ${this.name} was not found in database.`);

            const newTrackedSlot = new ContainerModel({
                name: this.name,
                loadedProductType: productSeries,
            });
            
            await newTrackedSlot.save();

            this.socketData().then(data => {
                TurbineEventLoop.emit(`container.updated.${this.name}`, data);
            });

            return true;
        }
        else
        {
            slot.loadedProductType = productSeries;
            slot.loadDate = new Date().toISOString();
            await slot.save();

            this.socketData().then(data => {
                TurbineEventLoop.emit(`container.updated.${this.name}`, data);
            });            
            return true;
        }

    }

    async unloadProduct()
    {
        const slot = await ContainerModel.findOne({ name: this.name });

        if(slot)
        {
            await slot.delete();
        }

        this.socketData().then(data => {
            TurbineEventLoop.emit(`container.updated.${this.name}`, data);
        });

        return true;
    }
    
    async fetchSlotData()
    {
        const containerDocument = await ContainerModel.findOne({ name: this.name });

        if(containerDocument && this.isProductable)
        {
            const limitTime = new Date(containerDocument.loadDate).getTime() + 1000 * 60 * 60 * 24 * (Products[containerDocument.loadedProductType].lifespan ?? -1);

            let lifetimeRemaining = (limitTime) - Date.now();
            lifetimeRemaining = lifetimeRemaining < 0 ? 0 : lifetimeRemaining;

            this.productData = { 
                loadedProductType: containerDocument.loadedProductType, 
                loadDate: containerDocument.loadDate, 
                lifetimeRemaining: lifetimeRemaining
            };
        }
        else
        {
            this.productData = undefined;
        }
    }

    async isProductLoaded(): Promise<boolean>
    {
        const doc = await ContainerModel.findOne({ name: this.name });
        return doc != null;
    }

    get isProductable(): boolean
    {
        return this.supportedProductSeries !== undefined;
    }

    async socketData(): Promise<ContainerHydrated>
    {
        await this.fetchSlotData();
        return { ...this, isProductable: this.isProductable } as ContainerHydrated;
    }
}