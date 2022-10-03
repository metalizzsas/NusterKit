/**
 * Device data given by balenaOS Hypervisor at /v1/device api endpoint
 */
export interface IDeviceData {
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