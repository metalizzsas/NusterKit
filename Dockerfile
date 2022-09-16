FROM balenalib/raspberrypi4-64-node:18-buster as base

WORKDIR /usr/src/app

RUN install_packages build-essential python3 git openssh-client

# Builder image from base image with npm tools installed properly
FROM base as builder

# Copy package.json
COPY package.json ./

# Install Npm packages
RUN npm install --save-dev

COPY . ./

# Build project with thr Typescript compiler
RUN npm run build

## Runner image from base with npm tools installed properly
FROM base as runner

# Copying Package & Package lock json
COPY --from=builder /usr/src/app/package*.json ./

# Install Prod npm packages
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/build /usr/src/app/build

COPY ./release.md ./release.md
COPY ./nuster-turbine-machines/ ./nuster-turbine-machines
COPY ./entrypoint.sh ./entrypoint.sh

# Run args
CMD ["bash", "entrypoint.sh"]
ENV NODE_ENV=production
EXPOSE 4080 
