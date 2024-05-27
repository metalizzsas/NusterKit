# base image used by builder and production
FROM node:20-alpine as base

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install --frozen-lockfile

# Builder image step
FROM base as build

COPY tsconfig.json .
COPY prisma/ ./prisma
COPY src/ ./src

RUN pnpm build

# Production final image
FROM base as production

# Run args
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/database.db
EXPOSE 4080
CMD ["/bin/sh", "entrypoint.sh"]

COPY entrypoint.sh ./entrypoint.sh
COPY prisma/ ./prisma
COPY --from=build /usr/src/app/build/ ./build

# Install dependencies
RUN pnpm install --no-optional
RUN pnpm build:prisma