import { Router } from "./Router";

import { listWifiNetworks, connectToWifi, type WirelessNetwork, getWiredIps, connectedWifiNetwork } from "../dbus/wifi";

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

        this.router.get("/eth", async (req, res) => {
            try
            {
                const list = await getWiredIps();
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
                const result = await connectToWifi({ iface: "wlan0", ssid: req.body.ssid, password: req.body.password }  satisfies WirelessNetwork)
                res.status(result ? 200 : 500).end();
            }
            catch(e)
            {
                res.status(500).json(e);
            }
        });
    }
}