FROM node:20-alpine

RUN corepack enable

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copying Package & Package lock json
COPY packages/turbine/package*.json ./

COPY packages/turbine/CHANGELOG.md ./CHANGELOG.md
COPY packages/turbine/entrypoint.sh ./entrypoint.sh

COPY packages/turbine/build/ ./build
COPY packages/turbine/prisma/ ./prisma

# Install Prod npm packages
RUN pnpm install --no-optional

# Run args
CMD ["/bin/sh", "entrypoint.sh"]
EXPOSE 4080 