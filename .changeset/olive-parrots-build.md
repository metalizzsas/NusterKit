---
"@nuster/turbine": patch
---

fix(docker): stop running openapi:extract inside the turbine image

`pnpm build` ends in `openapi:extract`, which the Dockerfile never followed after
the Fastify migration: the step needs scripts/, which the narrow build context
does not copy, and it imports the app, which hits Prisma at load time and so
needs a migrated database. openapi.json is committed and consumed by the UI, so
the image builds prisma, app and schemas only.
