# base image used by builder and production
FROM node:24-alpine@sha256:8510330d3eb72c804231a834b1a8ebb55cb3796c3e4431297a24d246b8add4d5 AS base

RUN apk add --no-cache openssl su-exec

# Corepack shared between root (which runs the migration) and the nodejs user
# (which runs the app):
#  - COREPACK_HOME in a common, world-readable location. Left at its default it
#    lands in root's home, the nodejs user never sees the activated version, and
#    corepack falls back to downloading "latest".
#  - DEFAULT_TO_LATEST=0: use the version prepared below, not whatever is newest.
#  - ENABLE_DOWNLOAD_PROMPT=0: never ask a question. A container has no TTY, so
#    the prompt hangs the process until the supervisor restarts it, forever.
ENV COREPACK_HOME=/usr/local/corepack
ENV COREPACK_DEFAULT_TO_LATEST=0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate
RUN chmod -R a+rX "$COREPACK_HOME"

WORKDIR /usr/src/app

COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma/ ./prisma

RUN pnpm install

# Builder image step
FROM base AS build

COPY tsconfig.json .
COPY tsconfig.build.json .
COPY src/ ./src

# Deliberately not `pnpm build`: that chain ends in `openapi:extract`, which
# imports the app — and the app hits Prisma at load time, so it needs
# DATABASE_URL and a migrated database, neither of which exists at image build
# time. It also needs scripts/, which this narrow context does not copy.
# openapi.json is committed and consumed by the UI; there is nothing to
# regenerate here.
RUN pnpm run build:prisma && pnpm run build:app && pnpm run build:schemas

# Production final image
FROM base AS production

# Run args
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/database.db
EXPOSE 4080

COPY entrypoint.sh ./entrypoint.sh

# Install dependencies
RUN pnpm install --no-optional
RUN pnpm build:prisma

RUN pnpm rebuild

COPY --from=build /usr/src/app/build/ ./build

# Non-root user (entrypoint runs as root to chmod /dev/piControl0 on RevPi,
# then drops to nodejs via su-exec before launching the node process)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4080/machine || exit 1

CMD ["/bin/sh", "entrypoint.sh"]
