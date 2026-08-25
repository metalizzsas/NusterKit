---
"@nuster/turbine": patch
---

fix(docker): stop the container restart loop caused by corepack

The image prepared pnpm as root but started the app as the nodejs user, which
could not read root's COREPACK_HOME and so never saw the activated version.
With no `packageManager` field to fall back on, corepack tried to download the
latest pnpm and asked for confirmation — in a container with no TTY. The
process hung until the supervisor killed it, restarted, and hung again.

COREPACK_HOME now lives somewhere both users can read, the prepared version is
pinned, and the download prompt is disabled. The entrypoint also starts the app
with `node build/app.js` directly, since `pnpm run start` was never anything
else, keeping corepack out of the runtime path entirely.
