export interface IHypervisorDevice {
    api_port: number;
    ip_address: string;
    os_version: string;
    mac_address: string;
    supervisor_version: string;
    update_pending: boolean;
    update_failed: boolean;
    update_downloaded: boolean;
    commit: string;
    status: string;
}