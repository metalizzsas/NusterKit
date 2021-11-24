import { Router } from "express";

export class Controller{

    _router = Router();

    constructor()
    {
        
    }

    get router()
    {
        return this._router;
    }

}