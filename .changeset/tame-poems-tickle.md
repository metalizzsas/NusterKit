---
"@nuster/turbine": patch
---

fix(boot): stop a slow database at startup from crash-looping the machine

The machine was restarting every ~25 seconds: a `Socket timeout` on Prisma
killed the process, the supervisor restarted it, and it happened again.

Fastify runs plugin registration inside `listen()`, and `call_to_action_routes`
awaited a `deleteMany` housekeeping query there. When the database was slow at
boot that query timed out, `listen()` rejected — and the `uncaughtException` /
`unhandledRejection` handlers were installed sixty lines further down, so
nothing caught it. Node printed the raw error and exited.

Four things change, all of the same shape — a transient failure at startup must
not be fatal:

- the process error handlers are installed first, before anything can fail;
- the call-to-action cleanup logs and carries on instead of refusing to boot;
- the container sensor listener catches its own errors: it is an `async`
  listener nobody awaits, fired every 500ms per sensor by the IO scanner, so a
  rejection there went straight to `unhandledRejection`;
- a leftover `updates.lock` is reclaimed instead of failing with `EEXIST`
  forever. The lock is only released when the process exits, so a killed process
  left one behind and every later run silently lost the protection that keeps
  the supervisor from swapping the container mid-cycle.
