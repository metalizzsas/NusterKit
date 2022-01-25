import os from "os";

export function getIPAddress() {

    const interfaces = os.networkInterfaces();

    for (const devName in interfaces)
    {
        const iface = interfaces[devName];

        if(iface)
        {
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && alias.address !== '192.168.1.1')
                    return alias.address;
            }
        }
        else
            return "0.0.0.0";
    }
    return '0.0.0.0';
}