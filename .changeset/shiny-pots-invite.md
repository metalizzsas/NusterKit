---
"@nuster/turbine": patch
---

fix(docker): give the nodejs user ownership of /data

Turbine crashed on startup with
`EACCES: permission denied, open '/data/logs/log-….log'`, restarting forever.
The app moved to a non-root user, but nothing handed it the /data volume, which
belongs to root — it predates the change, and `prisma migrate deploy` still runs
as root just before. The entrypoint now chowns /data before dropping privileges.
