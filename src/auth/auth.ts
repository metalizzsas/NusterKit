import { randomUUID } from "crypto";
import { Request, Response, NextFunction, Router } from "express";
import { model, Schema } from "mongoose";
import argon2 from "argon2";

export class AuthManager
{
    private _router: Router;

    private safeEndPoints: string[] = [
        "/v1/auth/login",
        "/v1/auth/register",
        "/v1/auth/logout",
    ];

    private permissionRegistry: { [key: string]: string[] } = {};

    constructor()
    {
        this._router = Router();

        //tools to manage users
        this._router.post('/register', this.register);
        this._router.post('/login', this.login);
        this._router.post('/logout', this.logout);

        //Tools to edit / delete accounts
        this._router.post('/edit', this.edit);
        this._router.delete('/delete', this.delete);
        
        console.log("Initialized AuthManager");
    }

    private async login(req: Request, res: Response)
    {
        const doc = await AuthModel.findOne({ username: req.body.username });

        if(doc)
        {
            if(await argon2.verify(doc.password, req.body.password))
            {
                const sessionID = randomUUID();

                doc.sessionID = sessionID;

                await doc.save();

                res.cookie("sessionID", sessionID, {
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                    httpOnly: true
                });

                res.status(200).end("auth ok");
            }
            else
                res.status(401).end("password incorrect");
        }
        res.status(401).end("username incorrect");
    }

    private async register(req: Request, res: Response)
    {
        const doc = await AuthModel.findOne({ username: req.body.username });

        if(!doc)
        {
            const newUser = new AuthModel({
                username: req.body.username,
                password: await argon2.hash(req.body.password)
            });

            await newUser.save();

            res.status(200).end("user created");
        }
        else
            res.status(401).end("username already taken");
    }

    private async logout(req: Request, res: Response)
    {
        const doc = await AuthModel.findOne({ sessionID: req.cookies.sessionID });

        if(doc)
        {
            delete doc.sessionID;

            await doc.save();

            res.clearCookie("sessionID");

            res.status(200).end("logout ok");
        }
        else
            res.status(401).end("no session");
    }

    private async edit(req: Request, res: Response)
    {
        if(await this.checkAdmin(req.cookies.sessionID))
        {
            const doc = await AuthModel.findOne({ username: req.body.username });

            if(doc)
            {
                //only redefine the password if the new one is not empty
                if(req.body.password)
                    doc.password = await argon2.hash(req.body.password);

                //main admin account permissions and isAdmin tag cant be modified
                if(req.body.username != "admin")
                {
                    doc.isAdmin = req.body.isAdmin;
                    doc.permissions = req.body.permissions;
                }

                doc.save();

                res.status(200).end("user edited");
            }
            else
                res.status(404).end("user not found");
        }
        else
            res.status(403).end("only an admin can perform this action");
    }

    private async delete(req: Request, res: Response)
    {
        if(await this.checkAdmin(req.cookies.sessionID))
        {
            const doc = await AuthModel.findOne({ username: req.body.username });

            if(doc)
            {

                if(doc.username != "admin")
                {
                    await doc.remove();

                    res.status(200).end("user deleted");
                }
                else
                {
                    res.status(403).end("cant delete admin account");
                }
            }
            else
                res.status(404).end("user not found");
        }
        else
            res.status(403).end("only an admin can perform this action");
    }

    private async checkAdmin(sessionID: string): Promise<boolean>
    {
        const doc = await AuthModel.findOne({ sessionID: sessionID });
        return (doc) ? doc.isAdmin : false;
    }

    private async checkLogin(sessionID: string): Promise<boolean>
    {
        const doc = await AuthModel.findOne({ sessionID: sessionID });
        return (doc) ? true : false;
    }

    private async checkPermissionForEndpoint(sessionID: string, endpoint: string): Promise<boolean>
    {
        //ignore safe endpoints
        if(this.safeEndPoints.includes(endpoint))
            return true;
        
        for(const p of this.permissionRegistry.entries)
        {
            const ep = this.permissionRegistry[p].find(e => e == endpoint);

            if(ep)
            {
                const doc = await AuthModel.findOne({ sessionID: sessionID });
                return (doc) ? doc.permissions.includes(ep) : false;
            }
            else
            {
                return false;
            }
        }

        return false;
    }

    public async middleware(req: Request, res: Response, next: NextFunction)
    {
        if(req.cookies.sessionID)
        {
            if(await this.checkLogin(req.cookies.sessionID))
            {
                if(await this.checkPermissionForEndpoint(req.cookies.sessionID, req.path))
                {
                    next();
                }
                else
                    res.status(403).end("no permission");
            }
            else
                res.status(401).end("no session");
        }
        else
        {
            if(this.safeEndPoints.includes(req.path))
            {
                next();
            }
            else
                res.status(403).end("endpoint not accessible to unauthed users");
        }
    }

    public get router(){
        return this._router;
    }

    /**
     * Adds an endpoint to the permission registry
     * @param permission permission to add endpoint to 
     * @param endpoint enpoint to add to permission
     */
    public registerEndpointPermission(permission: string, endpoint: string)
    {
        if(!this.permissionRegistry[endpoint])
        {
            this.permissionRegistry[endpoint].push(permission);
        }
    }
}

interface IAuth
{
    username: string;
    password: string;

    sessionID?: string;

    permissions: string[];

    isAdmin: boolean;
}

const AuthSchema = new Schema<IAuth>({
    username: {type: String, required: true},
    password: {type: String, required: true},
    sessionID: {type: String, required: false},
    permissions: {type: [String], required: true},
    isAdmin: {type: Boolean, required: true, default: false}
});

const AuthModel = model("Auth", AuthSchema);