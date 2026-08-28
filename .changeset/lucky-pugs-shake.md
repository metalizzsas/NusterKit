---
"@nuster/turbine": patch
---

fix(network): stop a dead D-Bus connection from hanging /settings/network

The page never loaded and eventually returned a 500. `dbusInvoker` had no
timeout, and dbus-native buffers every message in an array until its handshake
emits `connect` — so when authentication fails, nothing is ever sent, no
callback ever runs, and the promise never settles. The request hung until the
client gave up.

Calls now time out after 10s, and a connection that errors, ends or times out is
dropped so the next call opens a fresh one — before, one failure disabled the
network features for the lifetime of the process. The scans fired from the
NetworkRouter constructor swallow their errors, since a rejection there would
now take the process down at boot.

The connection error is also logged properly: dbus-native hands back the
daemon's raw refusal line rather than an `Error`, which is why the cause was
hidden behind a `write EPIPE` — the symptom of the already-closed socket.
