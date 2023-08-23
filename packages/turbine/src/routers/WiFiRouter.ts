import { Router } from "./Router";

import { listWifiNetworks, connectToWifi, getDevicesData, connectedWifiNetwork } from "../dbus/wifi";

export class WiFiRouter extends Router
{
    constructor()
    {
        super();
        this.configureRouter();
    }

    async configureRouter()
    {
        this.router.get("/list", async (req, res) => {
            try
            {
                const list = await listWifiNetworks();
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });

        this.router.get("/active", async (req, res) => {
            try
            {
                const list = await connectedWifiNetwork();
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });

        this.router.get("/devices/:type?", async (req, res) => {
            try
            {
                const list = await getDevicesData(req.params.type !== undefined ? parseInt(req.params.type) : undefined);
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });

        this.router.post("/connect", async (req, res) => {

            try
            {
                const result = await connectToWifi(req.body.ssid, req.body.password)
                res.status(result ? 200 : 500).end();
            }
            catch(e)
            {
                res.status(500).json(e);
            }
        });
    }
}