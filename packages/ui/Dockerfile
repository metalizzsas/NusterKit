FROM node:20-alpine

RUN corepack enable

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY packages/desktop/package*.json ./
COPY packages/desktop/CHANGELOG.md ./CHANGELOG.md
COPY packages/desktop/build/ ./build

# Install Prod npm packages
RUN pnpm install --no-optional

# Run args
CMD [ "node", "build" ]
EXPOSE 4081
ENV PORT=4081