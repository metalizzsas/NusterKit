FROM balenalib/%%BALENA_MACHINE_NAME%%-node:16 as build

RUN install_packages build-essential python3 git openssh-client

WORKDIR /usr/src/build

RUN git clone https://github.com/Kworz/NusterDesktop.git

COPY package*.json ./

RUN JOBS=MAX npm install --verbose --unsafe-perm && npm cache verify && rm -rf /tmp/*

#Build build svelte project to html
RUN npm run build:svelte

# NGINX SERVER
FROM nginx:latest

# Copy svelte files built buy stage 1
COPY --from=build ./build /usr/share/nginx/html
