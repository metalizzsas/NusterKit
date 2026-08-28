---
"@nuster/turbine": patch
---

fix(dev): stop an unreachable simulation server from killing turbine

The configuration POST to `SIMULATION_URL` had no rejection handler, so the
unhandled rejection took the whole process down. Not running the simulation
server — or running it without the portless proxy listening on 443 — meant
turbine would not boot at all. It is a dev convenience; it now logs a warning
and carries on.
