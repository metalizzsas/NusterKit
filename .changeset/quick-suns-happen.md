---
"@nuster/ui": patch
---

fix(network): show the wifi card again, which duplicate SSIDs were erasing

`/settings/network` only rendered the wired interface. Turbine was returning
everything correctly — both interfaces, and the access points in 0.12s — the
whole wifi block was simply being dropped by the client.

A wifi scan returns one access point per radio, not per network: a router in
2.4 and 5 GHz appears twice under the same SSID, and hidden networks each come
back with an empty one. The list was keyed by SSID, so those duplicates raised
Svelte's `each_key_duplicate`, a fatal error that removed the entire wifi card
from the render with nothing on screen to explain it.

Access points are now grouped by SSID, keeping the strongest signal — which is
what an operator wants anyway, since connecting is done by SSID and two
identical rows behave the same. Hidden networks are dropped: there is no SSID to
connect with. The list also no longer sorts the store's own array in place.

The dev fixture now mirrors what a real machine returns — a duplicated SSID and
empty ones — so this class of defect can show up before a machine does.
