/**
 * BalenaOS Hypervisor given VPN Data from /v2/device/vpn endpoint data
 */
export interface IVPNData {
  status: string;
  vpn: {
    enabled: boolean;
    connected: boolean;
  }
}