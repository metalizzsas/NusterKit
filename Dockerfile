FROM balenalib/raspberrypi4-64-node:18-buster as builder

WORKDIR /usr/src/app

RUN install_packages build-essential python3 git openssh-client
RUN yarn set version berry

COPY . ./

RUN yarn install
RUN yarn run build

FROM balenalib/raspberrypi4-64-node:18-buster

WORKDIR /usr/src/app

# Copying NusterTurbine built files and essential data
COPY --from=builder /usr/src/app/package.json /usr/src/app/package.json
COPY --from=builder /usr/src/app/yarn.lock /usr/src/app/yarn.lock
COPY --from=builder /usr/src/app/build /usr/src/app/build
COPY ./nuster-turbine-machines/ ./nuster-turbine-machines
COPY ./entrypoint.sh ./entrypoint.sh

ENV NODE_ENV=production

EXPOSE 4080 

CMD ["bash", "entrypoint.sh"]

RUN install_packages build-essential python3 git openssh-client

RUN yarn set version berry
RUN yarn install