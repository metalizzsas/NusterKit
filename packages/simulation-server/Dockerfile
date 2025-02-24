# Base image used by both steps
FROM node:18-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.13.0 --activate

WORKDIR /app

COPY ./package.json .

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
CMD ["pnpm", "run", "start"]

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

