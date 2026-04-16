# Base image used by both steps
FROM node:24-alpine@sha256:8510330d3eb72c804231a834b1a8ebb55cb3796c3e4431297a24d246b8add4d5 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY ./package.json .
COPY ./pnpm-lock.yaml .

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Build the app
FROM base AS build

COPY tsconfig.json .
COPY src/ ./src

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

# Final image
FROM base AS production

ENV NODE_ENV=production
ENV PORT=4082
EXPOSE 4082

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4082/ || exit 1

CMD ["pnpm", "run", "start"]
