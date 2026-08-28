---
"@nuster/turbine": patch
---

fix(io): stop one failed ping from disabling a controller until restart

A single failed ping latched `unreachable` on the WAGO and EX260Sx handlers, and
nothing ever cleared it: `connect()` refused every later attempt, the reconnect
loop stopped scheduling, and reads answered 0 (WAGO) or threw (EX260Sx) for the
lifetime of the process. Every IO-based run condition then showed red on a
machine whose sensors were fine, and only a restart recovered it — which is
exactly how it presented: red one day, green the next after a reboot.

A ping failure is now treated as transient: it is recorded, retried with the
existing backoff, and cleared as soon as a connection succeeds.
