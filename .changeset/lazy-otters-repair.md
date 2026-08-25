---
"@nuster/ui": patch
---

fix(configure): repair the broken state initializer, and fix the second screen too

beta.2 shipped a self-referencing initializer — `structuredClone(configuration)`
inside the declaration of `configuration` — which threw
`ReferenceError: Cannot access 'configuration' before initialization` while
rendering the configuration page, taking the whole UI container down on every
request.

The same non-reactive binding also affected the configuration editor reachable
from the settings screen, which was left untouched by the previous fix. Both
pages now bind to a local `$state` copy.
