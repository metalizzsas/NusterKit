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