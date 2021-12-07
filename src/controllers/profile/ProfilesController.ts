import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";
import { IProfile, ProfileModel } from "./Profile";

export class ProfileController extends Controller{

    private machine: Machine;

    private defaultProfile?: IProfile;

    constructor(machine: Machine)
    {
        super();

        this.machine = machine;

        this._configure();
        this._configureRouter();
    }

    private _configure()
    {
        this.defaultProfile = {
            identifier: "default",
            name: "profile-default-name",
            modificationDate: Date.now(),
            fieldGroups: this.machine.specs.profile
        };

        return true;
    }
    private _configureRouter()
    {
        /**
         * Route to List profiles
         */
        this._router.get('/', async (req: Request, res: Response) => {
            let profiles = await ProfileModel.find();
            res.json(profiles);
        });

        /**
         * Route to delete a profile with its given ID
         */
        this._router.delete('/:id', async (req: Request, res: Response) => {
            if(req.params.id != null)
            {
                let profile = await ProfileModel.findById(req.params.id);

                if(profile != undefined)
                {
                    await ProfileModel.findByIdAndDelete(req.params.id);
                    res.status(200).end();
                }
                else
                {
                    res.status(404).end();
                    return;
                }
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        /**
         * Route to copy a profile
         */
        this._router.put('/', async (req: Request, res: Response) => {

            if(req.body.id == "copied")
            {
                delete req.body.id;
                let profile = req.body as IProfile;

                await ProfileModel.create(profile);
                
                res.status(200).end();
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        /**
         * Route to create a default profile with the given JSON Structure
         */
        this._router.post('/', async (req: Request, res: Response) => {
            res.json(await ProfileModel.create(this.defaultProfile!))
        });
    }
}