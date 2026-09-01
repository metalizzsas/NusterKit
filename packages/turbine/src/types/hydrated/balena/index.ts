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
		/** Absent tant que l'image n'est pas téléchargée */
		dockerImageId?: string | null;
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
	};
}

export { AccessPoint, NetworkDevice } from "./dbus";
export type { HypervisorData, VPNData };
