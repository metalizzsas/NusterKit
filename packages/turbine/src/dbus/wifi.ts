/**
 * Code from github.com/balena-labs-projects/wifi-repeater
 * source file: src/nm.ts
 */

import type { BodyEntry } from 'dbus-native';
import { NetworkManagerTypes } from './networkManagerTypes';
import { dbusInvoker, getProperty } from './dbus';
import { TurbineEventLoop } from '../events';

export interface NetworkDevice {
    iface: string; // IP interface name
    path: string; // DBus object path
    type: string;
    driver: string;
    connected: boolean;
}

export interface WirelessDevice extends NetworkDevice {
    apCapable: boolean;
}

export interface WirelessNetwork {
    iface: string;
    ssid: string;
    password?: string;
}

type AccessPoint = {
    ssid: string;
    strength: number;
    frenquency: number;
}

const nm = 'org.freedesktop.NetworkManager';

export const listWifiNetworks = async (): Promise<AccessPoint[]> => {

    const wifiDevices = await getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);
    const accessPointsResult: AccessPoint[] = [];

    const wlan0 = wifiDevices.find(device => device.iface === "wlan0");

    if(wlan0 === undefined)
        throw new Error("Main physical wifi device not found.");

    //Request a scan of the networks using dbus
    await dbusInvoker({
        destination: nm,
        path: wlan0.path,
        interface: 'org.freedesktop.NetworkManager.Device.Wireless',
        member: 'RequestScan',
        signature: 'a{sv}',
        body: [{ "ssids": [] }]
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const accessPoints: string[] = await dbusInvoker({
        destination: nm,
        path: wlan0.path,
        interface: 'org.freedesktop.NetworkManager.Device.Wireless',
        member: 'GetAllAccessPoints'
    });

    for(const apPath of accessPoints)
    {
        const accessPointSsid = await getProperty<[[unknown], [{ type: "Buffer", data: Array<number>}]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
        const accessPointStrengh = await getProperty<[[unknown], [number]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
        const accessPointFrenquency = await getProperty<[[unknown], [number]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');

        TurbineEventLoop.emit("log", "info", `Wifi-Dbus: Access point ssid: ${JSON.stringify(accessPointSsid)} ${JSON.stringify(accessPointStrengh)}, ${JSON.stringify(accessPointFrenquency)}.`);

        accessPointsResult.push({
            ssid: String.fromCharCode.apply(null, accessPointSsid[1][0].data),
            strength: accessPointStrengh[1][0],
            frenquency: accessPointFrenquency[1][0]
        } satisfies AccessPoint);
    }

    return accessPointsResult;
};

export const connectedWifiNetwork = async (): Promise<AccessPoint | undefined> => {

    const wifiDevices = await getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);

    const wlan0 = wifiDevices.find(device => device.iface === "wlan0");

    if(wlan0 === undefined)
        throw new Error("Main physical wifi device not found.");

    const [, [activeAccessPointPath]] = await getProperty<[[unknown], [string]]>(nm, wlan0.path, 'org.freedesktop.NetworkManager.Device.Wireless', 'ActiveAccessPoint');

    const accessPointSsid = await getProperty<[[unknown], [{ type: "Buffer", data: Array<number>}]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
    const accessPointStrengh = await getProperty<[[unknown], [number]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
    const accessPointFrenquency = await getProperty<[[unknown], [number]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');

    return {
        ssid: String.fromCharCode.apply(null, accessPointSsid[1][0].data),
        strength: accessPointStrengh[1][0],
        frenquency: accessPointFrenquency[1][0]
    } satisfies AccessPoint;
}

export const getWiredIps = async (): Promise<Array<{ iface: string, addresses: unknown, gateway: unknown }>> => {
    const wiredDevices = await getDevices(NetworkManagerTypes.DEVICE_TYPE.ETHERNET);

    const ips: Array<{ iface: string, addresses: unknown, gateway: unknown }> = [];

    for (const device of wiredDevices.filter(d => d.iface === "enp1s0u1"))
    {
        const config: [[unknown], [string]] = await getProperty(nm, device.path, 'org.freedesktop.NetworkManager.Device', 'Ip4Config');
        const configPath = config[1][0];

        const addesses = await getProperty<[[unknown], [Array<Record<string, string | number>>]]>(nm, configPath, 'org.freeDesktop.NetworkManager.IP4Config', 'AddressData');
        const gateway = await getProperty<[[unknown], [string]]>(nm, configPath, 'org.freeDesktop.NetworkManager.IP4Config', 'Gateway');

        ips.push({ iface: device.iface, addresses: addesses[1][0], gateway: gateway[1][0] });
    }

    return ips;
}

type NetworkDevice2 = {
    iface: string;
    path: string;
}

export const getDevices = async (type?: number): Promise<NetworkDevice2[]> => {

    const devicePaths: string[] = await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDevices'
    });

    const devicesPathsFiltered: NetworkDevice2[] = [];

    for(const path of devicePaths)
    {
        const deviceType = await getProperty<[unknown, [number]]>(nm, path, 'org.freedesktop.NetworkManager.Device', 'DeviceType');
        const deviceIFace = await getProperty<[unknown, [string]]>(nm, path, 'org.freedesktop.NetworkManager.Device', 'Interface');

        if(deviceType[1][0] === type)
        {
            devicesPathsFiltered.push({
                iface: deviceIFace[1][0],
                path: path
            });
        }
    }

    return devicesPathsFiltered;
}

export const connectToWifi = async (network: WirelessNetwork): Promise<boolean> => {
    try {
        const connectionParams = [
            ['connection', [
                ['id', ['s', network.ssid]],
                ['type', ['s', '802-11-wireless']],
            ]],
            ['802-11-wireless', [
                ['ssid', ['ay', stringToArrayOfBytes(network.ssid)]],
                ['mode', ['s', 'infrastructure']],
            ]],
            ['802-11-wireless-security', [
                ['key-mgmt', ['s', 'wpa-psk']],
                ['psk', ['s', network.password ?? '']],
            ]],
            ['ipv4', [
                ['method', ['s', 'auto']],
            ]],
            ['ipv6', [
                ['method', ['s', 'auto']],
            ]],
        ] satisfies BodyEntry[];

        const device = await getPathByIface(network.iface);
        const connection = await addConnection(connectionParams);
        const result = await activateConnection(connection, device);
        
        return result !== undefined;
    }
    catch (error)
    {
        TurbineEventLoop.emit("log", "error", `Wifi-Dbus: Failed to connect to the wifi network ${error}.`);
        throw new Error(`Failed to connect to the wifi network (${error}).`);
    }
};

// NetworkManager
export const getWiFiDevices = async (): Promise<WirelessDevice[]> =>
{
    const devices: NetworkDevice[] = await getDevicesByType(NetworkManagerTypes.DEVICE_TYPE.WIFI)
    const wifiDevices: WirelessDevice[] = []

    for await (const device of devices)
    {
        const apCapable = !!(await getProperty<number>(nm, device.path, 'org.freedesktop.NetworkManager.Device.Wireless', 'WirelessCapabilities') & NetworkManagerTypes.WIFI_DEVICE_CAP.AP);
        wifiDevices.push({ ...device, apCapable });
    }

    return wifiDevices;
};

export const getDevicesByType = async (type: number): Promise<NetworkDevice[]> => {
    const paths: string[] = await getDevicesPath();
    const devices: NetworkDevice[] = [];

    for await (const path of paths) {
        const deviceType: number = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'DeviceType');

        if (deviceType === type) {
            const iface: string = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Interface');
            const connected: boolean = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Ip4Connectivity') === NetworkManagerTypes.CONNECTIVITY.FULL;
            const driver: string = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Driver');

            type NetworkManagerTypesDevicesTypes = keyof typeof NetworkManagerTypes.DEVICE_TYPE;
            const typeName: string = Object.keys(NetworkManagerTypes.DEVICE_TYPE).find(key => NetworkManagerTypes.DEVICE_TYPE[key as NetworkManagerTypesDevicesTypes] === type) || "UNKNOWN";
            
            devices.push({ path, iface, connected, driver, type: typeName });
        }
    }

    return devices
};

export const getDevicesPath = async (): Promise<string[]> => {
    return await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDevices'
    }) as Array<string>;
};

export const getPathByIface = async (iface: string): Promise<string> => {
    return await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDeviceByIpIface',
        signature: 's',
        body: [iface]
    }) as string;
};

export const checkDeviceConnectivity = async (iface: string): Promise<BodyEntry> => {
    const path: string = await getPathByIface(iface)
    return await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Ip4Connectivity')
};

export const checkNMConnectivity = async (): Promise<boolean> => {
    const nmConnectivityState = await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'CheckConnectivity'
    }) as number;

    return nmConnectivityState === NetworkManagerTypes.CONNECTIVITY.FULL
};

export const addConnection = async (params: BodyEntry[]): Promise<string> => {
    return await dbusInvoker<string>({
        destination: nm,
        path: '/org/freedesktop/NetworkManager/Settings',
        interface: 'org.freedesktop.NetworkManager.Settings',
        member: 'AddConnection',
        signature: 'a{sa{sv}}',
        body: [params]
    });
};

export const activateConnection = async (connection: string, path: string) => {
    return await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'ActivateConnection',
        signature: 'ooo',
        body: [connection, path, '/']
    });
};

function stringToArrayOfBytes(str: string) {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }

    return bytes;
}