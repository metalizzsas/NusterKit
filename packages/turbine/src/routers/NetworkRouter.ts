import { Router } from "./Router";

import type { NetworkDevice, AccessPoint } from "@metalizzsas/nuster-typings/build/hydrated/balena";
import type { BodyEntry } from "dbus-native";
import { computeSubnet, stringToArrayOfBytes } from "../dbus/network-utils";
import { dbusInvoker, getProperty } from "../dbus/dbus";
import { NetworkManagerTypes } from "../dbus/networkManagerTypes";
import { TurbineEventLoop } from "../events";

export class NetworkRouter extends Router
{
    private accessPoints: AccessPoint[] = [];
    private devices: NetworkDevice[] = [];

    constructor()
    {
        super();
        this.configureRouter();
        this.getDevices();
        this.listWifiNetworks();
    }

    async configureRouter()
    {
        this.router.get("/wifi/list", async (req, res) => {
            try
            {
                this.accessPoints = [];
                const list = await this.listWifiNetworks();
                res.json(list);
            }
            catch (ex)
            {
                res.status(500).json(ex);
            }
        });

        this.router.post("/wifi/connect", async (req, res) => {

            if(req.body.ssid === undefined || req.body.password === undefined)
            {
                res.status(400).end("settings.network.errors.wifi_missing_parameters");
                return;
            }

            try
            {
                const result = await this.connectToWifi(req.body.ssid, req.body.password);
                res.status(result ? 200 : 500).end();
            }
            catch(e)
            {
                if(e instanceof Array && e.at(0).contains('802-11-wireless-security.psk'))
                    res.status(400).end("settings.network.errors.wifi_invalid_password");
                else
                    res.status(500).json(e);
            }
        });

        this.router.get("/wifi/disconnect", async (req, res) => {
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

        this.router.get("/devices", async (req, res) => {
            try
            {
                const list = await this.getDevices();
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
     * @async
     * @returns Array of network devices
     */
    private async getDevices(): Promise<NetworkDevice[]>
    {
        const devicePaths: string[] = await dbusInvoker({
            destination: 'org.freedesktop.NetworkManager',
            path: '/org/freedesktop/NetworkManager',
            interface: 'org.freedesktop.NetworkManager',
            member: 'GetDevices'
        });
    
        const devices: NetworkDevice[] = [];
    
        for(const path of devicePaths)
        {
            const device: Partial<NetworkDevice> = {};

            const deviceIFace = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'Interface');
            
            if(!['wlan0', 'enp1s0u1'].includes(deviceIFace[1][0]))
                continue;

            device.iface = deviceIFace[1][0];
            device.path = path;

            const deviceState = await getProperty<[BodyEntry, [number]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'State');

            if(deviceState[1][0] === NetworkManagerTypes.DEVICE_STATE.ACTIVATED)
            {
                const IP4Config = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', path, 'org.freedesktop.NetworkManager.Device', 'Ip4Config');
                const addresses = await getProperty<[[BodyEntry], [Array<Array<Array<Array<Array<string | number | { type: string, child: []}>>>>>]]>('org.freedesktop.NetworkManager', IP4Config[1][0], 'org.freedesktop.NetworkManager.IP4Config', 'AddressData');
                const gateway = await getProperty<[[BodyEntry], [string]]>('org.freedesktop.NetworkManager', IP4Config[1][0], 'org.freedesktop.NetworkManager.IP4Config', 'Gateway');
            
                device.gateway = gateway[1][0];
                device.address = addresses[1][0][0][0][1][1][0] as string;
                device.subnet = computeSubnet(addresses[1][0][0][1][1][1][0] as number);
            }
            
            devices.push(device as NetworkDevice);
        }

        this.devices = devices;

        return devices;
    }

    /**
     * List the available wifi networks over `wlan0`interface
     * @async
     * @returns List of wifi networks
     */
    private async listWifiNetworks(): Promise<AccessPoint[]> {

        const devices = await this.getDevices();
        const accessPoints: AccessPoint[] = [];
    
        const wlan0 = devices.find(device => device.iface === "wlan0");
    
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
    
        const accessPointPaths: string[] = await dbusInvoker({
            destination: 'org.freedesktop.NetworkManager',
            path: wlan0.path,
            interface: 'org.freedesktop.NetworkManager.Device.Wireless',
            member: 'GetAllAccessPoints'
        });
    
        for(const accessPointPath of accessPointPaths)
        {
            const accessPointSsid = await getProperty<[[BodyEntry], [Buffer]]>('org.freedesktop.NetworkManager', accessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
            const accessPointStrengh = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', accessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
            const accessPointFrenquency = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', accessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');
            const accessPointEncryption = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', accessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Flags');
        
            accessPoints.push({
                ssid: accessPointSsid[1][0].toString(),
                strength: accessPointStrengh[1][0],
                frenquency: accessPointFrenquency[1][0],
                encryption: accessPointEncryption[1][0],
                active: accessPointPath === activeAccessPointPath,
                path: accessPointPath
            } satisfies AccessPoint);
        }

        this.accessPoints = accessPoints;
    
        return accessPoints;
    }

    /**
     * Connect to a wifi network
     * @param ssid SSID of the network to connect to
     * @param password Password of the network to connect to
     * @returns True if the connection was successful
     * @async
     */
    private async connectToWifi(ssid: string, password?: string | undefined): Promise<boolean> {
        try
        {
            const wlan0 = this.devices.find(device => device.iface === "wlan0");
        
            if(wlan0 === undefined)
                throw new Error("Main physical wifi device not found.");

            const ap = this.accessPoints.find(ap => ap.ssid === ssid);
            
            if(ap === undefined)
                throw new Error("Access point used not found.");
    
            const connectionParams = [
                ['connection', [
                    ['id', ['s', ssid]],
                    ['type', ['s', '802-11-wireless']]
                ]],
                ['802-11-wireless', [
                    ['ssid', ['ay', stringToArrayOfBytes(ssid)]],
                    ['mode', ['s', 'infrastructure']],
                ]],
                ['ipv4', [
                    ['method', ['s', 'auto']],
                ]],
                ['ipv6', [
                    ['method', ['s', 'auto']],
                ]]
            ] satisfies BodyEntry[];

            if(password !== undefined)
            {
                const keyMgmt: 'wep' | 'ieee8021x' |  'wpa-psk' | 'sae' | 'owe' | 'wpa-aep' | 'wpa-eap-suite-b-192' = 'wpa-psk';

                connectionParams.push(['802-11-wireless-security', [
                    ['key-mgmt', ['s', keyMgmt]],
                    ['psk', ['s', password]],
                ]]);
            }

            const connection = await dbusInvoker<string>({
                destination: 'org.freedesktop.NetworkManager',
                path: '/org/freedesktop/NetworkManager/Settings',
                interface: 'org.freedesktop.NetworkManager.Settings',
                member: 'AddConnection',
                signature: 'a{sa{sv}}',
                body: [connectionParams]
            });

            const result = await dbusInvoker<string>({
                destination: 'org.freedesktop.NetworkManager',
                path: '/org/freedesktop/NetworkManager',
                interface: 'org.freedesktop.NetworkManager',
                member: 'ActivateConnection',
                signature: 'ooo',
                body: [connection, wlan0.path, '/']
            });

            await this.getDevices();
            await this.listWifiNetworks();

            return result !== undefined;
        }
        catch (error)
        {
            TurbineEventLoop.emit('log', 'error', JSON.stringify(error));
            throw new Error(`Failed to connect to the wifi network (${error}).`);
        }
    }

    /**
     * Disconnect from the current wifi network
     * @throws
     */
    private async disconnectFromWifi(): Promise<void> {
        try {
            const wifiDevices = await this.getDevices();
            const wlan0 = wifiDevices.find(device => device.iface === "wlan0");
        
            if(wlan0 === undefined)
                throw new Error("Main physical wifi device not found.");

            TurbineEventLoop.emit('log', 'info', `Disconnecting from wifi network.`);

            await dbusInvoker({
                destination: 'org.freedesktop.NetworkManager',
                path: wlan0.path,
                interface: 'org.freedesktop.NetworkManager.Device',
                member: 'Disconnect'
            });
        }
        catch (error)
        {
            TurbineEventLoop.emit('log', 'error', JSON.stringify(error));
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