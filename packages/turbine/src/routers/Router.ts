import { Router as ExpressRouter } from "express";

export class Router {

    router: ExpressRouter;

    constructor()
    {
        this.router = ExpressRouter();
        return;
    }
}