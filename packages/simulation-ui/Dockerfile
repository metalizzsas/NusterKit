# base image used by builder and production
# NOTE: standardized to Node 18 to match all other packages (was Node 20)
FROM node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e AS base

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
ENV PORT=4084
EXPOSE 4084

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4084/ || exit 1

CMD [ "node", "build" ]
