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

const nm = 'org.freedesktop.NetworkManager';

export const listWifiNetworks = async (iface: string): Promise<WirelessNetwork[]> => {

    const paths: string[] = await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDevices'
    });

    const networks: WirelessNetwork[] = [];

    for await (const path of paths) {
        const deviceType: number = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'DeviceType');

        if (deviceType === NetworkManagerTypes.DEVICE_TYPE.WIFI) {
            const ifaceName: string = await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Interface');

            if (ifaceName === iface) {
                const accessPoints: string[] = await dbusInvoker({
                    destination: nm,
                    path,
                    interface: 'org.freedesktop.NetworkManager.Device.Wireless',
                    member: 'GetAccessPoints'
                });

                for await (const apPath of accessPoints) {
                    const [ssid] = await dbusInvoker({
                        destination: nm,
                        path: apPath,
                        interface: 'org.freedesktop.NetworkManager.AccessPoint',
                        member: 'Get',
                        signature: 's',
                        body: ['Ssid']
                    });

                    const ssidString = ssid.toString();

                    const network: WirelessNetwork = {
                        iface,
                        ssid: ssidString,
                        password: '',
                    };

                    networks.push(network);
                }
            }
        }
    }

    return networks;
};

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
        const apCapable = !!(await getProperty(nm, device.path, 'org.freedesktop.NetworkManager.Device.Wireless', 'WirelessCapabilities') & NetworkManagerTypes.WIFI_DEVICE_CAP.AP);
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
    });
};

export const getPathByIface = async (iface: string): Promise<string> => {
    return await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'GetDeviceByIpIface',
        signature: 's',
        body: [iface]
    });
};

export const checkDeviceConnectivity = async (iface: string): Promise<any> => {
    const path: string = await getPathByIface(iface)
    return await getProperty(nm, path, 'org.freedesktop.NetworkManager.Device', 'Ip4Connectivity')
};

export const checkNMConnectivity = async (): Promise<any> => {
    const nmConnectivityState = await dbusInvoker({
        destination: nm,
        path: '/org/freedesktop/NetworkManager',
        interface: 'org.freedesktop.NetworkManager',
        member: 'CheckConnectivity'
    });

    return nmConnectivityState === NetworkManagerTypes.CONNECTIVITY.FULL
};

export const addConnection = async (params: BodyEntry[]): Promise<any> => {
    return await dbusInvoker({
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