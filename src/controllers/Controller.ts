import { Router } from "express";

export class Controller {

    _router = Router();

    constructor()
    {
        return;
    }

    get router()
    {
        return this._router;
    }
}