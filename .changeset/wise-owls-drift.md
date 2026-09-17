---
"@nuster/turbine": patch
---

fix(io): a hung Modbus request no longer freezes the WAGO — and a finished cycle stops its timers

Behind a `stepOvertime` on the metalization step: its last ending block,
`regulators#power ← 0`, was handed to the fieldbus and never came back. The
step sat there for five minutes until the watchdog ended the cycle.

`wago.ts` set no timeout on the Modbus client, and modbus-serial then waits
forever. On a half-open TCP connection — a network drop without a FIN, a
controller restarting — one write held the IO mutex indefinitely and every
WAGO read and write queued behind it. The keepalive saw nothing: `isOpen` stays
true on a half-open socket. That single hang also explains IO run conditions
that stopped following the sensors, and a motor direction that read as `1`
forever — its writes were piling up, never applied.

Requests now time out after 2s. A failed request drops the connection so the
keepalive reconnects, and the gate keeps its last value rather than being
handed a fabricated reading.

Separately: timers started by steps were only cleared in `dispose()`, which runs
when the cycle is closed on screen — not in `end()`. Between the two, a step's
timer kept commanding outputs. The motor was driven every 5s for minutes after
the cycle had ended. `end()` now clears them.
