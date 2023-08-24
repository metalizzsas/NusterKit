import { Router } from "./Router";

import type { NetworkDevice, AccessPoint } from "@metalizzsas/nuster-typings/build/hydrated/balena";
import type { BodyEntry } from "dbus-native";
import { computeSubnet, stringToArrayOfBytes } from "../dbus/network-utils";
import { dbusInvoker, getProperty } from "../dbus/dbus";
import { NetworkManagerTypes } from "../dbus/networkManagerTypes";

export class NetworkRouter extends Router
{
    private accessPoints: AccessPoint[] = [];
    private devices: NetworkDevice[] = [];

    constructor()
    {
        super();
        this.configureRouter();
    }

    async configureRouter()
    {
        this.router.get("/wifi/list", async (req, res) => {
            try
            {
                const list = await this.listWifiNetworks();
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });

        this.router.post("/wifi/connect", async (req, res) => {

            try
            {
                const result = await this.connectToWifi(req.body.ssid, req.body.password)
                res.status(result ? 200 : 500).end();
            }
            catch(e)
            {
                res.status(500).json(e);
            }
        });

        this.router.post("/wifi/disconnect", async (req, res) => {
            try
            {
                await this.disconnectFromWifi()
                res.status(200).end();
            }
            catch(e)
            {
                res.status(500).json(e);
            }
        });

        this.router.get("/devices/:type?", async (req, res) => {
            try
            {
                const list = await this.getDevices(req.params.type !== undefined ? parseInt(req.params.type) : undefined);
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });
    }

    /**
     * Fetch network devices from the Dbus
     * @param type Network type of this device (Wireless / Wired...)
     * @async
     * @returns Array of network devices
     */
    private async getDevices(type?: number): Promise<NetworkDevice[]>
    {
        const devicePaths: string[] = await dbusInvoker({
            destination: 'org.freedesktop.NetworkManager',
            path: '/org/freedesktop/NetworkManager',
            interface: 'org.freedesktop.NetworkManager',
            member: 'GetDevices'
        });
    
        const devicesPathsFiltered: NetworkDevice[] = [];
    
        for(const path of devicePaths)
        {
            const device: Partial<NetworkDevice> = {};

            const deviceType = await getProperty<[BodyEntry, [number]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'DeviceType');

            // if type is specified but the device type is not the one asked, skip this device
            if(type !== undefined && deviceType[1][0] !== type)
                continue;

            const deviceIFace = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'Interface');
            
            device.iface = deviceIFace[1][0];
            device.path = path;

            const deviceState = await getProperty<[BodyEntry, [number]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'State');

            if(deviceState[1][0] === NetworkManagerTypes.DEVICE_STATE.ACTIVATED)
            {
                const IP4Config = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'Ip4Config');
                const addresses = await getProperty<[[BodyEntry], [Array<Array<Array<Array<string | number | { type: string, child: []}>>>>]]>('org.freedesktop.NetworkManager', IP4Config[1][0], 'org.freedesktop.NetworkManager.IP4Config', 'AddressData');
                const gateway = await getProperty<[[BodyEntry], [string]]>('org.freedesktop.NetworkManager', IP4Config[1][0], 'org.freedesktop.NetworkManager.IP4Config', 'Gateway');
            
                device.gateway = gateway[1][0];
                device.address = addresses[1][0][0][0][1][1] as string;
                device.subnet = computeSubnet(addresses[1][0][0][1][1][1] as number);
            }
            
            devicesPathsFiltered.push(device as NetworkDevice);
        }
        return devicesPathsFiltered;
    }

    /**
     * List the available wifi networks over `wlan0`interface
     * @returns List of wifi networks
     */
    private async listWifiNetworks(): Promise<AccessPoint[]> {

        const wifiDevices = await this.getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);
        const accessPointsResult: AccessPoint[] = [];
    
        const wlan0 = wifiDevices.find(device => device.iface === "wlan0");
    
        if(wlan0 === undefined)
            throw new Error("Main physical wifi device not found.");
    
        //Request a scan of the networks using dbus
        await dbusInvoker({
            destination: 'org.freedesktop.NetworkManager',
            path: wlan0.path,
            interface: 'org.freedesktop.NetworkManager.Device.Wireless',
            member: 'RequestScan',
            signature: 'a{sv}',
            body: [{ "ssids": [] }]
        });

        const [, [activeAccessPointPath]] = await getProperty<[[BodyEntry], [string]]>('org.freedesktop.NetworkManager', wlan0.path, 'org.freedesktop.NetworkManager.Device.Wireless', 'ActiveAccessPoint');
    
        const accessPoints: string[] = await dbusInvoker({
            destination: 'org.freedesktop.NetworkManager',
            path: wlan0.path,
            interface: 'org.freedesktop.NetworkManager.Device.Wireless',
            member: 'GetAllAccessPoints'
        });
    
        for(const apPath of accessPoints)
        {
            const accessPointSsid = await getProperty<[[BodyEntry], [Buffer]]>('org.freedesktop.NetworkManager', apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
            const accessPointStrengh = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
            const accessPointFrenquency = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');
        
            accessPointsResult.push({
                ssid: accessPointSsid[1][0].toString(),
                strength: accessPointStrengh[1][0],
                frenquency: accessPointFrenquency[1][0],
                active: apPath === activeAccessPointPath
            } satisfies AccessPoint);
        }
    
        return accessPointsResult;
    }

    /**
     * Connect to a wifi network
     * @param ssid SSID of the network to connect to
     * @param password Password of the network to connect to
     * @returns True if the connection was successful
     * @async
     */
    private async connectToWifi(ssid: string, password: string): Promise<boolean> {
        try {

            const wifiDevices = await this.getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);
            const wlan0 = wifiDevices.find(device => device.iface === "wlan0");
        
            if(wlan0 === undefined)
                throw new Error("Main physical wifi device not found.");
    
            const connectionParams = [
                ['connection', [
                    ['id', ['s', ssid]],
                    ['type', ['s', '802-11-wireless']],
                ]],
                ['802-11-wireless', [
                    ['ssid', ['ay', stringToArrayOfBytes(ssid)]],
                    ['mode', ['s', 'infrastructure']],
                ]],
                ['802-11-wireless-security', [
                    ['key-mgmt', ['s', 'wpa-psk']],
                    ['psk', ['s', password]],
                ]],
                ['ipv4', [
                    ['method', ['s', 'auto']],
                ]],
                ['ipv6', [
                    ['method', ['s', 'auto']],
                ]],
            ] satisfies BodyEntry[];

            const connection = await dbusInvoker<string>({
                destination: 'org.freedesktop.NetworkManager',
                path: '/org/freedesktop/NetworkManager',
                interface: 'org.freedesktop.NetworkManager',
                member: 'ActivateConnection',
                signature: 'ooo',
                body: [connectionParams, wlan0.path, '/']
            });

            const result = await dbusInvoker({
                destination: 'org.freedesktop.NetworkManager',
                path: '/org/freedesktop/NetworkManager',
                interface: 'org.freedesktop.NetworkManager',
                member: 'ActivateConnection',
                signature: 'ooo',
                body: [connection, wlan0.path, '/']
            });
                
            return result !== undefined;
        }
        catch (error)
        {
            throw new Error(`Failed to connect to the wifi network (${error}).`);
        }
    }

    /**
     * Disconnect from the current wifi network
     */
    private async disconnectFromWifi(): Promise<void> {
        try {
            const wifiDevices = await this.getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);
            const wlan0 = wifiDevices.find(device => device.iface === "wlan0");
        
            if(wlan0 === undefined)
                throw new Error("Main physical wifi device not found.");

            const wlanActiveConnection = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', wlan0.path, 'org.freedesktop.NetworkManager.Device.Wireless', 'ActiveConnection');

            if(wlanActiveConnection === undefined)
                return;

            await dbusInvoker({
                destination: 'org.freedesktop.NetworkManager',
                path: '/org/freedesktop/NetworkManager',
                interface: 'org.freedesktop.NetworkManager',
                member: 'DeactivateConnection',
                signature: 'o',
                body: [wlanActiveConnection]
            });
        }
        catch (error)
        {
            throw new Error(`Failed to disconnect from the wifi network (${error}).`);
        }
    }

    get socketData()
    {
        return {
            accessPoints: this.accessPoints,
            devices: this.devices
        }
    }
}