import { EProductSeries, ICallToAction, IConfigSlot, ISlotProductOptions, ISlotSensor } from "../../interfaces/ISlot";
import { IOController } from "../io/IOController";
import { SlotModel } from "./SlotModel";
import { SlotSensor } from "./SlotSensor";

export class Slot implements IConfigSlot
{
    name: string;
    type: string;

    sensors: ISlotSensor[];
    callToAction: ICallToAction[];

    productOptions?: ISlotProductOptions;

    productData?: { productSeries: EProductSeries, loadDate: Date, lifetimeProgress: number, lifetimeRemaining: number };

    constructor(slot: IConfigSlot, ioMgr: IOController)
    {
        this.name = slot.name;
        this.type = slot.type;
        
        this.sensors = slot.sensors.map(s => new SlotSensor(this, s, ioMgr));
        this.callToAction = slot.callToAction ?? [];

        this.productOptions = slot.productOptions;
    }

    async loadSlot(productSeries?: EProductSeries): Promise<boolean>
    {
        const slot = await SlotModel.findOne({ name: this.name });

        if(slot && this.productOptions)
        {
            slot.productSeries = productSeries ?? this.productOptions.defaultProductSeries;
            slot.loadDate = new Date();

            await slot.save();
        }
        else if(this.productOptions)
        {
            const newTrackedSlot = new SlotModel({
                name: this.name,
                productSeries: productSeries ?? this.productOptions.defaultProductSeries,
            });

            await newTrackedSlot.save();
        }
        else
        {
            console.log("Failed to load slot");
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
        const slot = await SlotModel.findOne({ name: this.name });

        if(slot && this.productOptions)
        {
            const limitTime = slot.loadDate.getTime() + 1000 * 60 * 60 * 24 * this.productOptions.lifespan;

            //Avoid negative values
            let lifetimeProgress = 1 - (Date.now() / limitTime);
            lifetimeProgress = lifetimeProgress < 0 ? 0 : lifetimeProgress;

            let lifetimeRemaining = (limitTime) - Date.now();
            lifetimeRemaining = lifetimeRemaining < 0 ? 0 : lifetimeRemaining;

            this.productData = { productSeries: slot.productSeries, 
                loadDate: slot.loadDate, 
                lifetimeProgress: lifetimeProgress,
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
        return this.productOptions !== undefined;
    }

    async socketData()
    {
        await this.fetchSlotData();
        return { ...this, isProductable: this.isProductable, productData: this.productData };
    }
}