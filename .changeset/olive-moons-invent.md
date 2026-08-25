---
"@nuster/turbine": minor
---

feat(addons): add "remove" mode to strip entries from machine specs

Addons can now delete array items (by equality, partial object match, or nested-array
prefix) and object keys, in addition to `merge` and `set`. Required by the
`manual-pressure-regulators` option on metalfog machines.
