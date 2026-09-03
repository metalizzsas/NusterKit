---
"@nuster/turbine": patch
---

fix(profiles): seed premade profiles in one transaction instead of eighty-four

This is what was holding the database busy at boot, behind the `Socket timeout`
on `prisma.container.findMany()`.

The seeding wrote one row per profile and then one row per value, each awaited
in turn — 84 separate transactions on `metalfog-m-2`. Prisma serialises
everything on SQLite's single connection, and the database runs in rollback
journalling, so each transaction forces its own fsync on the device's eMMC. The
seeding therefore held the connection for several seconds at startup, and
whatever queued behind it — including the container read for the first full
status — hit the socket timeout before being served.

The database was never slow: it is 86 KB on a disk that is 10% full. It was
busy. Values are now written nested with their profile, and the whole seed runs
as a single transaction: one fsync instead of eighty-four.
