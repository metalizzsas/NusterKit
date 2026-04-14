# base image used by builder and production
FROM node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e AS base

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
