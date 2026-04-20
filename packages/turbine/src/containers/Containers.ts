import { ContainerRegulation } from "./ContainerRegulation";
import { TurbineEventLoop } from "../events";

import type { CallToAction } from "$types/spec/nuster";
import type { Container as ContainerConfig, ContainerProduct } from "$types/spec/containers";
import type { ContainerHydrated, ContainerProductData, ContainerSensorHydrated } from "$types/hydrated/containers";
import type { IOGateJSON } from "$types/hydrated/io";

import { prisma } from "../db";

export class Container implements ContainerConfig
{
    name: string;
    type: string;

    sensors?: ContainerSensorHydrated[];
    regulations?: ContainerRegulation[];

    callToAction: CallToAction[];

    productData?: ContainerProductData;

    supportedProductSeries?: string[];

    #products: Record<string, ContainerProduct>;

    // Stored listener references for cleanup in dispose()
    private _onUnload!: () => void;
    private _onLoad!: (productSeries: string) => void;
    private _onRead!: (options: { callback?: (container: ContainerHydrated) => void | Promise<void> }) => void;
    private _sensorHandlers: Array<{ event: string, handler: (gate: IOGateJSON) => void }> = [];

    constructor(container: ContainerConfig, products: Record<string, ContainerProduct>)
    {        
        // Load products
        this.#products = products;

        this.name = container.name;
        this.type = container.type;
        
        //optionals
        this.supportedProductSeries = container.supportedProductSeries;
        this.sensors = container.sensors;
        this.regulations = container.regulations?.map(r => new ContainerRegulation(this, r));

        this.callToAction = container.callToAction ?? [];

        

        this._onUnload = this.unloadProduct.bind(this);
        TurbineEventLoop.on(`container.unload.${this.name}`, this._onUnload);

        this._onLoad = (productSeries) => { this.loadProduct(productSeries); };
        TurbineEventLoop.on(`container.load.${this.name}`, this._onLoad);

        this._onRead = async (options) => {
            options.callback?.(await this.socketData());
        };
        TurbineEventLoop.on(`container.read.${this.name}`, this._onRead);

        for(const sensor of this.sensors ?? [])
        {
            const handler = async (gate: IOGateJSON) => {
                if(sensor.logic == "level-min" && gate.value == 0 && await this.isProductLoaded() == true)
                    this.unloadProduct();
            };
            this._sensorHandlers.push({ event: `io.updated.${sensor.io}`, handler });
            TurbineEventLoop.on(`io.updated.${sensor.io}`, handler);
        }
    }

    /**
     * Load product in 
     * @param productSeries 
     * @returns 
     */
    async loadProduct(productSeries: string): Promise<boolean>
    {
        if(this.supportedProductSeries === undefined)
        {
            TurbineEventLoop.emit('log', 'error', `Container: ${this.name} is not loadable.`);
            return false;
        }

        const container = await prisma.container.findUnique({ where: { name: this.name }});

        if(container === null)
        {
             TurbineEventLoop.emit('log', 'info', `Container: ${this.name} was not found in database.`);

            await prisma.container.create({
                data: {
                    name: this.name,
                    loadedProductType: productSeries,
                    loadDate: new Date().toISOString()
                }
            });

            this.socketData().then(data => {
                TurbineEventLoop.emit(`container.updated.${this.name}`, data);
                TurbineEventLoop.emit("ws.dirty", "containers");
            }).catch(err => {
                TurbineEventLoop.emit('log', 'error', `Container-${this.name}: socketData failed: ${(err as Error).message}`);
            });

            return true;
        }
        else
        {
            await prisma.container.update({
                where: { name: this.name },
                data: {
                    loadedProductType: productSeries,
                    loadDate: new Date().toISOString()
                }
            });

            this.socketData().then(data => {
                TurbineEventLoop.emit(`container.updated.${this.name}`, data);
                TurbineEventLoop.emit("ws.dirty", "containers");
            }).catch(err => {
                TurbineEventLoop.emit('log', 'error', `Container-${this.name}: socketData failed: ${(err as Error).message}`);
            });
            return true;
        }

    }

    async unloadProduct()
    {

        const container = await prisma.container.findUnique({ where: { name: this.name }});

        if(container)
        {
            try
            {
                await prisma.container.delete({ where: { name: this.name }});
            }
            catch(ex)
            {
                 TurbineEventLoop.emit('log', 'error', `Container: ${this.name} was not found in database and then not deleted.`);
            }
        }

        this.socketData().then(data => {
            TurbineEventLoop.emit(`container.updated.${this.name}`, data);
            TurbineEventLoop.emit("ws.dirty", "containers");
        }).catch(err => {
            TurbineEventLoop.emit('log', 'error', `Container-${this.name}: socketData failed: ${(err as Error).message}`);
        });

        return true;
    }
    
    async fetchSlotData()
    {
        const containerDocument = await prisma.container.findUnique({ where: { name: this.name }});

        if(containerDocument && this.isProductable)
        {
            const productLifeSpan = this.#products[containerDocument.loadedProductType]?.lifespan ?? -1;
            const limitTime = new Date(containerDocument.loadDate).getTime() + 1000 * 60 * 60 * 24 * productLifeSpan;

            let lifetimeRemaining = (limitTime) - Date.now();
            lifetimeRemaining = lifetimeRemaining < 0 ? 0 : lifetimeRemaining;

            this.productData = { 
                loadedProductType: containerDocument.loadedProductType, 
                loadDate: new Date(containerDocument.loadDate).toString(), 
                lifetimeRemaining: productLifeSpan !== -1 ? lifetimeRemaining : -1
            };
        }
        else
        {
            this.productData = undefined;
        }
    }

    async isProductLoaded(): Promise<boolean>
    {
        const container = await prisma.container.findUnique({ where: { name: this.name }});
        return container !== null;
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

    dispose(): void {
        TurbineEventLoop.removeListener(`container.unload.${this.name}`, this._onUnload);
        TurbineEventLoop.removeListener(`container.load.${this.name}`, this._onLoad);
        TurbineEventLoop.removeListener(`container.read.${this.name}`, this._onRead);

        for (const { event, handler } of this._sensorHandlers) {
            TurbineEventLoop.removeListener(event, handler);
        }
        this._sensorHandlers = [];

        for (const regulation of this.regulations ?? []) {
            regulation.dispose();
        }
    }
}