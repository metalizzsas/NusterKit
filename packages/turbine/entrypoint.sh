#!/bin/sh
set -e

# Grant the non-root node process access to the RevolutionPi process image
# when running on a RevPi host. No-op on other deployments.
if [ -e /dev/piControl0 ]; then
    chmod 0666 /dev/piControl0 || true
fi

find /data/logs -name "*.log" -type f -mtime +30 -delete || true
pnpm exec prisma migrate deploy

# /data belongs to root: the volume predates this image, and `migrate deploy`
# just ran as root too. The app runs as nodejs and has to write the database and
# create /data/logs there, so hand the volume over before dropping privileges.
# Without this the logger dies on EACCES the moment it opens its first file, and
# the container restarts forever.
chown -R nodejs:nodejs /data

# `pnpm run start` is only ever `node build/app.js`. Going through pnpm here
# dragged corepack into the runtime path, under a user that could not read the
# activated version — which is what put this container in a restart loop.
exec su-exec nodejs node build/app.js
