route del -net 192.168.1.0 netmask 255.255.255.0 eth0 || true
find /data/logs -name "*.log" -type f -mtime +30 -delete || true
pnpm run start