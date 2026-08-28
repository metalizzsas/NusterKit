---
"@nuster/turbine": patch
---

fix(containers): stop re-reading product data from the database on every broadcast

Building the machine status issued one `prisma.container.findUnique()` per
container, and it was rebuilt on every `ws.dirty` signal and on every client
connection. On SQLite a single connection serialises all of it, so at boot —
while migrations and the `/data` ownership pass still hold the disk — the kiosk
and the UI connecting together were enough to pile the queries up until Prisma
gave up with `Socket timeout`.

What is read there (`loadedProductType`, `loadDate`) only changes when a
container is loaded or emptied. It is now held in memory, written through on
load and unload, and hydrated once — concurrent callers share that single read.
The remaining time is still computed at each call, so it keeps decreasing.

This also removes the query that the `level-min` sensor handler issued on every
IO scan while a container read empty.
