export type AccessPoint = {
    ssid: string;
    strength: number;
    frenquency: number;
    encryption: number;
    active: boolean;
    path: string;
}

export type NetworkDevice = {
    iface: string;
    path: string;
    address?: string;
    gateway?: string;
    subnet?: string;
}