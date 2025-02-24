# base image used by builder and production
FROM node:18-alpine AS base

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
COPY tailwind.config.cjs .
COPY postcss.config.cjs .
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
CMD [ "node", "build" ]

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build