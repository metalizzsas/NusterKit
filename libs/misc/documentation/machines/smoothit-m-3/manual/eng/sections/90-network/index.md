## Network information

To enable remote maintenance of your machine, connect it to your network via the RJ45 port, located under the electrical box.

This network connection requires access to the following outgoing ports:

| Port | Description |
| --- | --- |
| 443 TCP | Enables Balena-Cloud VPN connection |
| 123 UDP | For date and time synchronization |
| 53 UDP | For DNS resolution |

It also requires access to the following domain:

- *.balena-cloud.com

No direct connection between the machine and our services is possible. All connections are secured via VPN.