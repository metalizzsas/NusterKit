# base image used by builder and production
FROM node:22-alpine@sha256:4d64b49e6c891c8fc821007cb1cdc6c0db7773110ac2c34bf2e6960adef62ed3 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.13.0 --activate

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Builder image step
FROM base AS build

COPY svelte.config.js .
COPY vite.config.ts .
COPY tsconfig.json .
COPY static/ ./static
COPY src/ ./src

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

# Production final image
FROM base AS production

# Run args
ENV NODE_ENV=production
ENV PORT=4081
EXPOSE 4081

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4081/ || exit 1

CMD [ "node", "build" ]
