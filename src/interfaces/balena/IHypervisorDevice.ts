export interface IHypervisorData {
    status: string;
    appState: string;
    overallDownloadProgress?: number;
    containers: Container[];
    images: Image[];
    release: string;
}

interface Image {
    name: string;
    appId: number;
    serviceName: string;
    imageId: number;
    dockerImageId: string;
    status: string;
    downloadProgress?: number;
}

interface Container {
    status: string;
    serviceName: string;
    appId: number;
    imageId: number;
    serviceId: number;
    containerId: string;
    createdAt: string;
}