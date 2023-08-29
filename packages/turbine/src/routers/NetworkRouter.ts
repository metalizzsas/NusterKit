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

            if(req.body.ssid === undefined)
            {
                res.status(400).end("settings.network.errors.wifi_missing_parameters");
                return;
            }

            const ap = this.accessPoints.find(ap => ap.ssid === req.body.ssid);

            if(ap === undefined)
            {
                //Should not happen
                res.status(400).end("settings.network.errors.wifi_invalid_ssid");
                return;
            }

            if(ap.encryption > 0 && req.body.password === undefined)
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
            const accessPointEncryption = await getProperty<[[BodyEntry], [number]]>('org.freedesktop.NetworkManager', accessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'RsnFlags');
        
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

        let createdConnection: string | undefined = undefined;

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
                    ['type', ['s', '802-11-wireless']],
                    ['autoconnect', ['b', true]],
                    ['autoconnect-priority', ['i', 10]],
                    ['interface-name', ['s', wlan0.iface]]
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

            if(password !== undefined && ap.encryption > 0)
            {
                let keyMgmt: 'wep' | 'ieee8021x' |  'wpa-psk' | 'sae' | 'owe' | 'wpa-aep' | 'wpa-eap-suite-b-192' = 'wpa-psk';

                switch (ap.encryption)
                {
                    case NetworkManagerTypes.AP_802_11_SEC.PAIR_WEP104:
                    case NetworkManagerTypes.AP_802_11_SEC.PAIR_WEP40:
                    case NetworkManagerTypes.AP_802_11_SEC.GROUP_WEP40:
                    case NetworkManagerTypes.AP_802_11_SEC.GROUP_WEP104:
                        keyMgmt = 'wep'; break;
                    default:
                        keyMgmt = 'wpa-psk'; break;
                }

                connectionParams.push(['802-11-wireless-security', [
                    ['key-mgmt', ['s', keyMgmt]],
                    ['psk', ['s', password]],
                ]]);
            }

            createdConnection = await dbusInvoker<string>({
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
                body: [createdConnection, wlan0.path, '/']
            });

            await this.getDevices();
            await this.listWifiNetworks();

            return result !== undefined;
        }
        catch (error)
        {
            if(createdConnection)
            {
                TurbineEventLoop.emit('log', 'info', `Network: Deleting wrong connection ${createdConnection}.`);
                await dbusInvoker({
                    destination: 'org.freedesktop.NetworkManager',
                    path: '/org/freedesktop/NetworkManager/Settings',
                    interface: 'org.freedesktop.NetworkManager.Settings.Connection',
                    member: 'Delete',
                    signature: 'o',
                    body: [createdConnection]
                });
            }

            TurbineEventLoop.emit('log', 'error', JSON.stringify(error));
            return false;
        }
    }

    /**
     * Disconnect from the current wifi network
     * @throws
     */
    private async disconnectFromWifi(): Promise<void> {
        try
        {
            const wifiDevices = await this.getDevices();
            const wlan0 = wifiDevices.find(device => device.iface === "wlan0");
        
            if(wlan0 === undefined)
                throw new Error("Main physical wifi device not found.");

            TurbineEventLoop.emit('log', 'info', `Network: Disconnecting from wifi network.`);

            const [, [appliedConnection]] = await getProperty<[[BodyEntry], [string]]>("org.freedesktop.NetworkManager", wlan0.path, "org.freedesktop.NetworkManager.Device", "ActiveConnection"); 

            if(appliedConnection !== undefined)
            {
                const [, [rootConnection]] = await getProperty<[BodyEntry, [string]]>('org.freedesktop.NetworkManager', appliedConnection, 'org.freedesktop.NetworkManager.Connection.Active', 'Connection');

                if(rootConnection !== undefined)
                {
                    TurbineEventLoop.emit('log', 'info', `Network: Deleting connection ${appliedConnection}.`);
                    await dbusInvoker({
                        destination: 'org.freedesktop.NetworkManager',
                        path: rootConnection,
                        interface: 'org.freedesktop.NetworkManager.Settings.Connection',
                        member: 'Delete'
                    });
                }
            }
            
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