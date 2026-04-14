import type { ContainerHydrated } from "../types/hydrated/containers";
import type { Container as ContainerConfig, ContainerProduct } from "../types/spec/containers";
import { Container } from "../containers/Containers";
import { Router } from "./Router";
import type { ServiceRegistry } from "../services/interfaces";

export class ContainersRouter extends Router
{
    containers: Container[] = [];
    public services?: ServiceRegistry;

    constructor(containers: ContainerConfig[], products: Record<string, ContainerProduct>)
    {
        super();
        this.containers = containers.map(c => new Container(c, products));
    }

    async socketData(): Promise<ContainerHydrated[]>
    {
        return await Promise.all(this.containers.map(async k => await k.socketData()));
    }
}