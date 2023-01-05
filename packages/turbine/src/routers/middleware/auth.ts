import { randomUUID } from "crypto";
import type { Request, Response, NextFunction} from "express";
import { Router } from "express";
import { model, Schema } from "mongoose";
import argon2 from "argon2";
import { LoggerInstance } from "../../app";

//add a toJSON method to RegExp
Object.defineProperty(RegExp.prototype, "toJSON", {
    value: RegExp.prototype.toString
});

/** Endpoint for Auth permission */
export interface IEndPoint
{
    /** URL Endpoint */
    endpoint: string | RegExp;
    /** HTTP Method */
    method: "get" | "post" | "put" | "delete" | "patch";
}

/** Endpoint Permission definition */
export interface IEndpointPermission extends IEndPoint {
    /** Associated permission for this endpoint */
    permission: string;
}

export class AuthManager
{
    private router: Router;

    private safeEndPoints: string[] = [
        "/ws",
        "/status",
        "/v1/auth/permissions",
        "/v1/auth/login",
        "/v1/auth/register",
        "/v1/auth/logout"
    ];

    private permissionRegistry: IEndpointPermission[] = [];

    private static _instance: AuthManager;

    private constructor()
    {
        this.router = Router();

        //tools to manage users
        this.router.get('/', this.list.bind(this));
        this.router.get('/permissions', (req: Request, res: Response) => {
            res.json(this.permissionRegistry);
        });
        this.router.post('/register', this.register.bind(this));
        this.router.post('/login', this.login.bind(this));
        this.router.get('/logout', this.logout.bind(this));

        //Tools to edit / delete accounts
        this.router.post('/edit', this.edit.bind(this));
        this.router.delete('/delete', this.delete.bind(this));
        
        LoggerInstance.info("Auth: Initialized");

        LoggerInstance.trace("Auth: Checking for existing admin account...");

        AuthModel.exists({ username: "admin" }).then(async (exists) => {
            if(!exists)
            {
                LoggerInstance.info("Auth: No admin account found, creating one...");

                const admin = new AuthModel({
                    username: "admin",
                    password: await argon2.hash("signal"),
                    permissions: ["admin"],
                    isAdmin: true
                });

                admin.save();
            }
            else
                LoggerInstance.trace("Auth: Admin account found");
        });
    }

    /** Gets the instance of the Auth manager */
    static getInstance()
    {
        if(!this._instance)
            this._instance = new AuthManager();
        
        return this._instance;
    }

    private async list(req: Request, res: Response)
    {
        if(req.cookies && req.cookies.sessionID)
        {
            if(await this.checkAdmin(req.cookies.sessionID))
            {
                const users = await AuthModel.find({});

                interface IUser{
                    id?: string;
                    username: string;
                    permissions: string[];
                    isAdmin: boolean;
                }

                const returned: IUser[] = [];

                for(const user of users)
                {
                    returned.push({
                        id: user.id,
                        username: user.username,
                        permissions: user.permissions,
                        isAdmin: user.isAdmin
                    });
                }

                res.json(returned);
            }
            else
            {
                res.status(403).send("Forbidden");
            }
        }
        else
        {
            res.status(401).send("Unauthorized");
        }
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
                    maxAge: 1000 * 60 * 60 * 24 * 7
                });

                res.status(200).end("auth ok");
                return;
            }
            else
                res.status(401).end("password incorrect"); return;
        }
        res.status(401).end("username not found");
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
            doc.sessionID = undefined;

            await doc.save();

            res.clearCookie("sessionID");

            res.status(200).end("logout ok");
        }
        else
            res.status(401).end("no session to logout");
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

    private async checkPermissionForEndpoint(sessionID: string, endpoint: string, method = "get"): Promise<boolean>
    {
        //avoid any misconception of method casing
        method = method.toLowerCase();

        //if the user is an admin any route should be allowed for him
        if(await this.checkAdmin(sessionID))
        {
            LoggerInstance.trace(`sID: ${sessionID} is admin, allowing access to ${endpoint}`);
            return true;
        }

        //test if the path is a static path
        if(new RegExp(/assets/g).test(endpoint))
        {
            LoggerInstance.trace(`sID: ${sessionID} is accessing assets folder, allowing access to ${endpoint}`);
            return true;
        }

        //ignore safe endpoints
        if(this.safeEndPoints.includes(endpoint))
        {
            LoggerInstance.trace(`sID: ${sessionID} is accessing a safe endpoint, allowing access to ${endpoint}`);
            return true;
        }

        const z = this.permissionRegistry.find(p => {

            if(typeof p.endpoint === "string")
                return p.endpoint == endpoint && p.method == method;
            else
                return p.endpoint.test(endpoint) && p.method == method;
        });

        if(z)
        {
            const doc = await AuthModel.findOne({ sessionID: sessionID });

            if(doc)
            {
                if(doc.permissions.includes(z.permission))
                {
                    LoggerInstance.trace(`sID: ${sessionID} has permission ${z.permission} for ${endpoint}`);
                    return true;
                }
                else
                {
                    LoggerInstance.trace(`sID: ${sessionID} has no permission ${z.permission} for ${endpoint}`);
                    return false;
                }
            }
            else
            {
                LoggerInstance.trace(`sID: ${sessionID} is not logged in, denying access to ${endpoint}`);
                return false;
            }
        }
        
        LoggerInstance.trace(`sID: ${sessionID} has not permission for ${endpoint}`);
        return false;
    }

    public async middleware(req: Request, res: Response, next: NextFunction)
    {
        //check if the route is considered as a safe endpoint
        if(this.safeEndPoints.includes(req.path))
        {
            next();
            return;
        }
        
        if(req.cookies && req.cookies.sessionID)
        {
            if(await this.checkLogin(req.cookies.sessionID))
            {
                if(await this.checkPermissionForEndpoint(req.cookies.sessionID, req.path, req.method))
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
            if(await this.checkPermissionForEndpoint("", req.path, req.method))
            {
                next();
            }
            else
                res.status(403).end("endpoint not accessible to unauthed users");
        }
    }

    /**
     * Adds an endpoint to the permission registry
     * @param permission permission to add endpoint to 
     * @param endpoint enpoint to add to permission
     */
    public registerEndpointPermission(permission: string, endpoint: IEndPoint)
    {
        const t  = {
            permission: permission,
            endpoint: endpoint.endpoint,
            method: endpoint.method
        };
        
        this.permissionRegistry.push(t);
    }
}

/** Auth account interface in database */
interface IAuth
{
    /** Username */
    username: string;
    /** Password */
    password: string;

    /** Is this user admin */
    isAdmin: boolean;

    /** Permissions associated with this user */
    permissions: string[];

    /** SessionID registered with this user */
    sessionID?: string;
}

const AuthSchema = new Schema<IAuth>({
    username: {type: String, required: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, required: true, default: false},
    permissions: {type: [String], required: true},
    sessionID: {type: String, required: false}
});

const AuthModel = model("Auth", AuthSchema);