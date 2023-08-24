/**
 * Code from github.com/balena-labs-projects/wifi-repeater
 * source file: src/nm.ts
 */

import { type BodyEntry } from 'dbus-native';
import { dbusInvoker } from './dbus';

export type AccessPoint = {
    ssid: string;
    strength: number;
    frenquency: number;
    active: boolean;
}

export type NetworkDevice = {
    iface: string;
    path: string;
    address?: string;
    gateway?: string;
    subnet?: string;
}

const nm = 'org.freedesktop.NetworkManager';

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

export function stringToArrayOfBytes(str: string) {
    return str.split('').map(c => c.charCodeAt(0));
}

export function computeSubnet(prefixLength: number): string
{
    if (prefixLength < 0 || prefixLength > 32)
    {
        throw new Error('Prefix length must be between 0 and 32.');
    }

    const subnetMask = new Array(4).fill(0);

    for (let i = 0; i < prefixLength; i++) {
        subnetMask[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
    }

    return subnetMask.join('.');
}