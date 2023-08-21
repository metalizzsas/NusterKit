import { type ConnectionSettingsManager, NetworkManager, type WifiDevice } from "networkmanager-dbus";
import { Router } from "./Router";
import { TurbineEventLoop } from "../events";

export class WiFiRouter extends Router
{
    wifiDevice: WifiDevice | undefined;
    connecttionSettingsManager: ConnectionSettingsManager | undefined;

    constructor()
    {
        super();
        this.configureRouter();
    }

    async configureRouter()
    {
        try
        {
            const networkmanager = await NetworkManager.init();
            this.wifiDevice = await networkmanager.wifiDevice();
            this.connecttionSettingsManager = await networkmanager.connectionSettingsManager();
        }
        catch(ex)
        {
            TurbineEventLoop.emit("log", "error", "WifiRouter: Failed to instanciate NetworkManger dbus bridge. The wifi endpoints are disabled.");
            return;
        }

        this.router.get("/list", async (req, res) => {
            await this.wifiDevice?.requestScan();
            res.json(this.wifiDevice?.accessPoints);
        });

        this.router.post("/connect", async (req, res) => {

            if(this.connecttionSettingsManager && this.wifiDevice)
            {
                const { ssid, password, hidden } = req.body;
                const connectionPath = await this.connecttionSettingsManager.addWifiWpaConnection(ssid, hidden, password);
                await this.wifiDevice.activateConnection(connectionPath);

                if(this.connectedNetwork?.Ssid === ssid)
                    res.status(200).end();
                else
                    res.status(500).end();
            }
            else
            {
                res.status(500).end();
            }
        });
    }

    /** Get current connected access point */
    get connectedNetwork()
    {
        const properties = this.wifiDevice?.properties;
        return this.wifiDevice?.accessPoints[properties.ActiveAccessPoint];
    }

    get socketData()
    {
        return {
            connectedNetwork: this.connectedNetwork,
            accessPoints: this.wifiDevice?.accessPoints
        }
    }
}