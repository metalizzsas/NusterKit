#!/bin/sh
set -e

# Grant the non-root node process access to the RevolutionPi process image
# when running on a RevPi host. No-op on other deployments.
if [ -e /dev/piControl0 ]; then
    chmod 0666 /dev/piControl0 || true
fi

find /data/logs -name "*.log" -type f -mtime +30 -delete || true
pnpm exec prisma migrate deploy
exec su-exec nodejs pnpm run start
