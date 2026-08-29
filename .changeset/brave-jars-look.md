---
"@nuster/turbine": patch
---

fix(docker): run the process as root again, so NetworkManager answers

Turbine ran as the `nodejs` user from April to August 2026, and that is what
broke `/settings/network`. The host's D-Bus policy lets any uid connect to the
system bus, then closes the connection of anyone but root the moment they
address `org.freedesktop.NetworkManager`. Measured on the machine: as root,
`GetDevices` returns its 15 interfaces; as `nodejs`, the same successfully
authenticated connection dies with `write EPIPE` on the first message. The
symptom was a `[DBusClient] D-Bus connection error (ignored): write EPIPE` at
every boot that nobody had connected to the unusable network page.

The isolation was nominal anyway: the container is `privileged: true`, with
`NET_ADMIN` and device access. Dropping uid behind that protected nothing and
cost a whole feature.

Three preparation steps go with it, each of which existed only to support the
drop: `chmod 0666 /dev/piControl0` for RevPi access, `chown -R /data` — which
held the disk busy at startup, exactly when Prisma was already contending for it
— and `chown -R /tmp/balena` for the supervisor's update lock.
