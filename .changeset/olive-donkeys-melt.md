---
"@nuster/ui": patch
---

feat(settings): confirm install, restart and shutdown, and show what follows

The three buttons acted on the first tap, with no way back and, for restart and
shutdown, no feedback at all — the screen went on looking exactly as before
while the machine was already stopping. On a touchscreen next to an operator,
that is one mis-tap away from cutting a machine.

Each now opens a confirmation dialog naming what will happen and how long the
machine stays unavailable. Once confirmed, a panel reports the operation in
progress: a real download percentage for an install, taken from the supervisor
and refreshed while it runs, and the live connection state so the screen shows
the machine actually going away and coming back.

The three buttons are disabled while an operation is running, as they already
were during a cycle. Reuses the `settings.power.modal.*` strings, which
described these states and were unused.
