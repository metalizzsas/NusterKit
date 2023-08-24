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