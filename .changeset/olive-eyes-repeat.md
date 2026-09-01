---
"@nuster/turbine": patch
---

fix(containers): read the container table in one query instead of one per container

The `Socket timeout` on `prisma.container.findUnique()` was still happening at
boot on `metalfog-m-2`, two of them about seven seconds in. Caching the row per
container removed the queries from steady state, but not the burst that starts
it: the first full status hydrated all five containers at once, which is five
queries serialised on SQLite's single connection at the exact moment the disk is
still busy. The last ones in the queue hit the timeout before being served.

All containers now share a single `findMany()`. The batch is released once it
settles, so a failure is simply retried by the next broadcast — as one query,
not five.
