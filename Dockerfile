FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN JOBS=MAX npm install --unsafe-perm && npm cache verify
COPY ./ ./

RUN npm run build

FROM nginx:latest

COPY --from=builder usr/src/app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

