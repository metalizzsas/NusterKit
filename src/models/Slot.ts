import { Schema, model } from "mongoose";

export interface ISlot{
    name: string;
    product?: IProduct;
}

interface ISlotSensor
{
    io: string;
    type: string;
    value?: number;
}

interface IProduct
{
    serial: string; // product serial number

    name: string; // product name
    series: ProductSeries; // product series

    lifetime: number; // lifetime in month
    lifecycle: number; //lifetime while loaded

    expirationdate: number; // expiration date
}

enum ProductSeries{
    LookLikeChromium = "llc",
    UtilitySilver = "usl",
    Topcoat = "tc",
    Basecoat = "bc",
    WaxRemover = "wr",
    ResinCleaner = "rc"
}

const ProductSchema = new Schema<IProduct>({
    serial: { type: String, required: true },
    name: { type: String, required: true },
    series: { type: String, required: true },
    lifetime: { type: Number, required: true },
    lifecycle: { type: Number, required: true },
    expirationdate: { type: Number, required: true }
});

const SlotSchema = new Schema<ISlot>({
    name: { type: String, required: true },
    product: ProductSchema
});

const SlotModel = model('slot', SlotSchema);

export class Slot
{
    name: string;
    type: string;
    isProductable: boolean;

    sensors: ISlotSensor[];

    product?: IProduct;

    constructor(name: string, type: string, isProductable: boolean, sensors: ISlotSensor[])
    {
        this.name = name;
        this.type = type;
        this.isProductable = isProductable;

        this.sensors = sensors;

        if(this.isProductable)
        {
            this._configureSlot();
            this.readSensors();
        }
    }

    /**
     * Creates slot into mongodb if it is productable
     */
    private async _configureSlot()
    {
        let slot = await SlotModel.findOne({name: this.name});

        if(slot == null)
        {
            let newSlot: ISlot = {
                name: this.name
            };

            await SlotModel.create(newSlot);
        }
    }

    /**
     * loads this slot with a product
     * @param product {IProduct} 
     */
    public async loadSlot(product: IProduct): Promise<boolean>
    {
        let slot = await SlotModel.find({name: this.name});

        if(slot != undefined)
        {
            await SlotModel.findOneAndUpdate({name: this.name}, {product: product});

            return true;
        }
        else
        {
            //TODO: log the fact that the slot is missing in database but this should never happen
            return false;
        }
    }

    public async unloadSlot(): Promise<boolean>
    {
        let slot = await SlotModel.find({name: this.name});

        if(slot != undefined)
        {
            await SlotModel.findOneAndUpdate({name: this.name}, {$unset: {product: ""}});
            return true;
        }
        else
        {
            //TODO: log the fact that the slot is missing in database but this should never happen
            return false;
        }
    }
    /**
     * get product loaded in this slot
     */
    public async productLoaded(): Promise<IProduct | null>
    {
        if(!this.isProductable)
            return null;
        else
        {
            let slot = await SlotModel.findOne({name: this.name});
            return (slot?.product != null) ? slot.product! : null;
        }
    }
    /**
     * Reads all the sensors of this slot
     * @returns {Boolean}
     */
    public async readSensors(): Promise<boolean>
    {
        return true;
    }
}