FROM balenalib/raspberrypi4-64-node:18-buster as builder

RUN install_packages build-essential python3 git openssh-client
WORKDIR /usr/src/app

COPY package.json ./
RUN JOBS=MAX yarn install --production=false

COPY . ./
RUN yarn run build

FROM balenalib/raspberrypi4-64-node:18-buster

RUN install_packages build-essential python3 git openssh-client

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./

RUN JOBS=MAX yarn install --production=true

# Copying NusterTurbine built files and essential data
COPY --from=builder /usr/src/app/build ./build
COPY ./nuster-turbine-machines/ ./nuster-turbine-machines
COPY ./entrypoint.sh ./entrypoint.sh

ENV NODE_ENV=production
EXPOSE 4080 

CMD ["bash", "entrypoint.sh"]