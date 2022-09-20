/**
 * BalenaOS Hypervisor given VPN Data from /v2/device/vpn endpoint data
 */
export interface IVPNData {
  status: string;
  vpn: Vpn;
}

interface Vpn {
  enabled: boolean;
  connected: boolean;
}