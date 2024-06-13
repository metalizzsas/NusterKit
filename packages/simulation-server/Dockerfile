# Base image used by both steps
FROM node:18-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY ./package.json .

FROM base as prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Build the app
FROM base as build

COPY tsconfig.json .
COPY src/ ./src

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

# Final image
FROM base as production

ENV NODE_ENV=production
ENV PORT=4082
EXPOSE 4082
CMD ["pnpm", "run", "start"]

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

