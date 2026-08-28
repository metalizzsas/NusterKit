---
"@nuster/turbine": patch
---

fix(docker): let the app take the balena update lock

`Lock: Updates locking failed. Error: EACCES: permission denied, open
'/tmp/balena/updates.lock'`. The supervisor provides that directory as root, and
the app now runs as nodejs, so it could no longer create the lock file.

The lock is held for as long as the process lives and released when it exits —
it is what keeps the supervisor from swapping the container in the middle of a
cycle. The failure only logged, so the machine kept running with that protection
silently gone. The entrypoint now hands the directory to nodejs before dropping
privileges, as it already does for /data.
