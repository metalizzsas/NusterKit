FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN JOBS=MAX npm install --unsafe-perm && npm cache verify

COPY ./ ./

ENV VITE_BUNDLED=true

ENV PORT=4079

RUN npm run build

FROM balenalib/raspberrypi4-64-node:16.17

WORKDIR /usr/src/app

COPY --from=builder usr/src/app/build /usr/src/app/build

EXPOSE 4079

CMD [ "node build/index.js" ]
