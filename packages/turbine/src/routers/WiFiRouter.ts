import { Router } from "./Router";

import { listWifiNetworks, connectToWifi, type WirelessNetwork } from "../dbus/wifi";

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
            res.json(await listWifiNetworks());
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