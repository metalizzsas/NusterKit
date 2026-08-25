---
"@nuster/ui": patch
---

fix(configure): edits to the machine configuration were discarded

Every field on the configuration screen bound straight to `data.configuration`,
which comes from `$props()` and is not deeply reactive under Svelte 5. Changing
the model select notified nothing: the derived specs never recomputed, so the
addon list and machine variables kept describing the previous model, and the raw
JSON preview never moved. The hidden form field carried
`JSON.stringify(data.configuration)` evaluated once, so saving wrote back the
configuration as originally loaded — edits were silently dropped rather than
rejected.

The form now binds to a local `$state` copy.
