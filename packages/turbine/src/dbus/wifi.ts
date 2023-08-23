/**
 * Code from github.com/balena-labs-projects/wifi-repeater
 * source file: src/nm.ts
 */

import type { BodyEntry } from 'dbus-native';
import { NetworkManagerTypes } from './networkManagerTypes';
import { dbusInvoker, getProperty } from './dbus';
import { TurbineEventLoop } from '../events';

type AccessPoint = {
    ssid: string;
    strength: number;
    frenquency: number;
}

type NetworkDevice = {
    iface: string;
    path: string;
}

type NetworkDeviceData = NetworkDevice & {
    addresses: Array<Record<string, string | number>>;
    gateway: string;
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
        const accessPointSsid = await getProperty<[[unknown], [Buffer]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
        const accessPointStrengh = await getProperty<[[unknown], [number]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
        const accessPointFrenquency = await getProperty<[[unknown], [number]]>(nm, apPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');

        TurbineEventLoop.emit("log", "info", `Wifi-Dbus: Access point ssid: ${JSON.stringify(accessPointSsid)} ${JSON.stringify(accessPointStrengh)}, ${JSON.stringify(accessPointFrenquency)}.`);

        accessPointsResult.push({
            ssid: accessPointSsid[1][0].toString(),
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

    const accessPointSsid = await getProperty<[[unknown], [Buffer]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Ssid');
    const accessPointStrengh = await getProperty<[[unknown], [number]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Strength');
    const accessPointFrenquency = await getProperty<[[unknown], [number]]>(nm, activeAccessPointPath, 'org.freedesktop.NetworkManager.AccessPoint', 'Frequency');

    return {
        ssid: accessPointSsid[1][0].toString(),
        strength: accessPointStrengh[1][0],
        frenquency: accessPointFrenquency[1][0]
    } satisfies AccessPoint;
}

export const getDevicesData = async (type?: number): Promise<Array<NetworkDeviceData>> => {

    const wiredDevices = await getDevices(type);

    const ips: Array<NetworkDeviceData> = [];

    for (const device of wiredDevices.filter(d => !(['eth0', 'resin-dns', 'resin-vpn', 'lo', 'balena0'].includes(d.iface))))
    {
        const config: [[unknown], [string]] = await getProperty(nm, device.path, 'org.freedesktop.NetworkManager.Device', 'Ip4Config');
        const configPath = config[1][0];

        const addesses = await getProperty<[[unknown], [Array<Record<string, string | number>>]]>(nm, configPath, 'org.freeDesktop.NetworkManager.IP4Config', 'AddressData');
        const gateway = await getProperty<[[unknown], [string]]>(nm, configPath, 'org.freedesktop.NetworkManager.IP4Config', 'Gateway');

        ips.push({ ...device, addresses: addesses[1][0], gateway: gateway[1][0] });
    }

    return ips;
}

export const getDevices = async (type?: number): Promise<NetworkDevice[]> => {

    const devicePaths: string[] = await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDevices'
    });

    const devicesPathsFiltered: NetworkDevice[] = [];

    for(const path of devicePaths)
    {
        const deviceType = await getProperty<[unknown, [number]]>(nm, path, 'org.freedesktop.NetworkManager.Device', 'DeviceType');
        const deviceIFace = await getProperty<[unknown, [string]]>(nm, path, 'org.freedesktop.NetworkManager.Device', 'Interface');

        if(type !== undefined && deviceType[1][0] === type)        
        {
            devicesPathsFiltered.push({
                iface: deviceIFace[1][0],
                path: path
            });
        }
    }

    return devicesPathsFiltered;
}

export const connectToWifi = async (ssid: string, password: string): Promise<boolean> => {
    try {

        const wifiDevices = await getDevices(NetworkManagerTypes.DEVICE_TYPE.WIFI);
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

        const connection = await addConnection(connectionParams);
        const result = await activateConnection(connection, wlan0.path);
        
        return result !== undefined;
    }
    catch (error)
    {
        TurbineEventLoop.emit("log", "error", `Wifi-Dbus: Failed to connect to the wifi network ${error}.`);
        throw new Error(`Failed to connect to the wifi network (${error}).`);
    }
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
    return str.split('').map(c => c.charCodeAt(0));
}