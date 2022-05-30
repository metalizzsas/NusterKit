FROM balenalib/raspberrypi4-64-node:18-buster as builder

RUN install_packages build-essential python3 git openssh-client
WORKDIR /usr/src/app

COPY package.json ./
RUN JOBS=MAX npm install --save-dev --unsafe-perm && npm cache verify && rm -rf /tmp/*

COPY . ./
RUN npm run build

FROM balenalib/raspberrypi4-64-node:18-buster

RUN install_packages build-essential python3 git openssh-client
WORKDIR /usr/src/app

COPY package.json ./
RUN JOBS=MAX npm install --production --unsafe-perm && npm cache verify && rm -rf /tmp/*

# Copying NusterTurbine built files and essential data
COPY --from=builder /usr/src/app/build ./build
COPY ./nuster-turbine-machines/ ./nuster-turbine-machines
COPY ./entrypoint.sh ./entrypoint.sh

ENV NODE_ENV=production
EXPOSE 80

CMD ["bash", "entrypoint.sh"]