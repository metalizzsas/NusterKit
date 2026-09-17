---
"@nuster/turbine": patch
---

fix(pbr): run conditions that were sometimes reactive, sometimes not

Three defects behind it, all in how a run condition gets its first value.

A product condition read its container once, asynchronously, and then only
reacted to `container.updated` — which fires on load and unload and on nothing
else. If that first read failed (a busy database at startup, for instance) the
container stayed unknown, the condition stayed red, and nothing ever retried:
it remained red until someone touched that container. The read now retries with
backoff until it succeeds.

An IO condition was born `"error"` and only subscribed to the gate, so it stayed
red until the scanner's next tick — and for good if a read failed in between.
"Not yet evaluated" was indistinguishable from "violated". It now starts from
the gate's current value.

And the product block registered a `container.updated` listener it never
removed, so every cycle created left one more behind. Status blocks now dispose,
and the run condition disposes them.
