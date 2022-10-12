## Runner image from base with npm tools installed properly
FROM balenalib/raspberrypi4-64-node:18-buster

WORKDIR /usr/src/app

RUN install_packages build-essential python3 git openssh-client

# Copying Package & Package lock json
COPY package*.json ./
COPY .npmrc ./

COPY ./CHANGELOG.md ./CHANGELOG.md
COPY ./entrypoint.sh ./entrypoint.sh

COPY build/ /build/

# Install Prod npm packages
RUN pnpm install

# Remove npmrc file
RUN rm .npmrc

# Run args
CMD ["bash", "entrypoint.sh"]
ENV NODE_ENV=production
EXPOSE 4080 