# base image used by builder and production
FROM node:20-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

FROM base as prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Builder image step
FROM base as build

COPY svelte.config.js .
COPY vite.config.ts .
COPY tsconfig.json .
COPY static/ ./static
COPY src/ ./src

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

# Production final image
FROM base as production

# Run args
ENV NODE_ENV=production
ENV PORT=4084
EXPOSE 4084
CMD [ "node", "build" ]

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build