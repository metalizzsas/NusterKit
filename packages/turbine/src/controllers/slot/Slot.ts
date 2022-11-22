import type { ICallToAction } from "@metalizzsas/nuster-typings/build/spec/nuster/ICallToAction";
import type { ISlotHydrated, ISlotProductData } from "@metalizzsas/nuster-typings/build/hydrated/slot";
import type { IConfigSlot } from "@metalizzsas/nuster-typings/build/spec/slot";
import { type EProductSeries, ESlotProducts } from "@metalizzsas/nuster-typings/build/spec/slot/products";

import { LoggerInstance } from "../../app";
import { SlotModel } from "./SlotModel";
import { SlotSensor } from "./SlotSensor";

export class Slot implements IConfigSlot
{
    name: string;
    type: string;

    sensors?: SlotSensor[];
    callToAction: ICallToAction[];

    productData?: ISlotProductData;

    supportedProductSeries?: EProductSeries[];

    constructor(slot: IConfigSlot)
    {
        this.name = slot.name;
        this.type = slot.type;
        
        //optionals
        this.supportedProductSeries = slot.supportedProductSeries;
        this.sensors = slot.sensors?.map(s => new SlotSensor(this, s));
        this.callToAction = slot.callToAction ?? [];
    }

    async loadSlot(productSeries: EProductSeries): Promise<boolean>
    {
        const slot = await SlotModel.findOne({ name: this.name });

        if(slot && this.supportedProductSeries !== undefined)
        {
            slot.loadedProductType = productSeries;
            slot.loadDate = new Date();      
            await slot.save();
        }
        else if(this.supportedProductSeries !== undefined)
        {
            const newTrackedSlot = new SlotModel({
                name: this.name,
                loadedProductType: productSeries,
            });

            await newTrackedSlot.save();
        }
        else
        {
            LoggerInstance.error(`Slots: Failed to load ${this.name} document.`);
        }
        return true;
    }

    async unloadSlot()
    {
        const slot = await SlotModel.findOne({ name: this.name });

        if(slot)
        {
            await slot.delete();
        }
        return true;
    }
    
    async fetchSlotData()
    {
        const slotDocument = await SlotModel.findOne({ name: this.name });

        if(slotDocument && this.isProductable)
        {
            const limitTime = slotDocument.loadDate.getTime() + 1000 * 60 * 60 * 24 * ESlotProducts[slotDocument.loadedProductType].lifespan;

            let lifetimeRemaining = (limitTime) - Date.now();
            lifetimeRemaining = lifetimeRemaining < 0 ? 0 : lifetimeRemaining;

            this.productData = { 
                loadedProductType: slotDocument.loadedProductType, 
                loadDate: slotDocument.loadDate, 
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
        const doc = await SlotModel.findOne({ name: this.name });
        return doc != null;
    }

    get isProductable(): boolean
    {
        return this.supportedProductSeries !== undefined;
    }

    async socketData(): Promise<ISlotHydrated>
    {
        await this.fetchSlotData();
        // TODO Check this type assertion
        return {...this, isProductable: this.isProductable} as unknown as ISlotHydrated;
    }
}