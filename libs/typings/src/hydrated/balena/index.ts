/** BalenaOS Hypervisor Container data from `GET:/v2/state/status` api endpoint */
interface HypervisorData {
    status: string;
    appState: string;
    overallDownloadProgress?: number;
    containers: {
        status: string;
        serviceName: string;
        appId: number;
        imageId: number;
        serviceId: number;
        containerId: string;
        createdAt: string;
    }[];
    images: {
        name: string;
        appId: number;
        serviceName: string;
        imageId: number;
        dockerImageId: string;
        status: string;
        downloadProgress?: number;
    }[];
    release: string;
}

/** BalenaOS Hypervisor given VPN Data from `GET:/v2/device/vpn` endpoint data */
interface VPNData {
    status: string;
    vpn: {
        enabled: boolean;
        connected: boolean;
    }
}

/** Device data given by balenaOS Hypervisor at `GET:/v1/device` api endpoint */
interface DeviceData {
    api_port: number;
    ip_address: string;
    mac_address: string;
    commit: string;
    status: string;
    download_progress: number;
    os_version: string;
    supervisor_version: string;
    update_pending: boolean;
    update_downloaded: boolean;
    update_failed: boolean;
}

export { VPNData, HypervisorData, DeviceData };
export { AccessPoint, NetworkDevice } from './dbus';