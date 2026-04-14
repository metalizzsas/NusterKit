# base image used by builder and production
FROM node:22-alpine@sha256:4d64b49e6c891c8fc821007cb1cdc6c0db7773110ac2c34bf2e6960adef62ed3 AS base

RUN apk add openssl

RUN corepack enable
RUN corepack prepare pnpm@9.13.0 --activate

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

RUN pnpm build

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

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4080/machine || exit 1

CMD ["/bin/sh", "entrypoint.sh"]
