/** BalenaOS Hypervisor Container data from /v2/state/status api endpoint */
export interface IHypervisorData {
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