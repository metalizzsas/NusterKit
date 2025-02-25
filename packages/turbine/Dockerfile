# base image used by builder and production
FROM node:18-alpine AS base

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
CMD ["/bin/sh", "entrypoint.sh"]

COPY entrypoint.sh ./entrypoint.sh

# Install dependencies
RUN pnpm install --no-optional
RUN pnpm build:prisma

RUN pnpm rebuild

COPY --from=build /usr/src/app/build/ ./build