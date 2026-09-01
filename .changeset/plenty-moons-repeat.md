---
"@nuster/turbine": patch
---

fix(machine): stop /machine from breaking while an update downloads

`FastifyError: Response doesn't match the schema` on every `/machine` call
during an update: the supervisor only fills `dockerImageId` once an image is
present locally, and the schema demanded a string. Every image still
downloading failed validation, so the endpoint 500'd for the whole duration of
the update — exactly when the screen needs to show its progress.

`dockerImageId` is now nullish, like the `downloadProgress` beside it, which is
absent for the same kind of reason.
