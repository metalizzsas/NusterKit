# base image used by builder and production
FROM node:20-alpine as base

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Builder image step
FROM base as build

COPY svelte.config.js ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.cjs ./
COPY static/ ./static
COPY src/ ./src

RUN pnpm build

# Production final image
FROM base as production

# Run args
ENV NODE_ENV=production
ENV PORT=4081
EXPOSE 4081
CMD [ "node", "build" ]

COPY --from=build build/ ./build

# Install Prod npm packages
RUN pnpm install --no-optional