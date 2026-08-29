#!/bin/sh
set -e

find /data/logs -name "*.log" -type f -mtime +30 -delete || true
pnpm exec prisma migrate deploy

# Le process tourne en root, délibérément.
#
# Il a tourné sous l'utilisateur `nodejs` d'avril à août 2026, et ça a cassé
# l'accès à NetworkManager sans qu'on le relie : la politique D-Bus de l'hôte
# laisse n'importe quel uid se connecter au bus système, puis ferme la connexion
# de tout autre que root dès qu'il s'adresse à `org.freedesktop.NetworkManager`.
# Mesuré sur machine : en root, `GetDevices` renvoie ses 15 interfaces ; sous
# `nodejs`, la même connexion, authentifiée avec succès, meurt en `write EPIPE`
# au premier message. `/settings/network` en est resté inutilisable.
#
# Le gain d'isolation était de toute façon nominal : le conteneur est
# `privileged: true`, avec `NET_ADMIN` et l'accès aux périphériques. Descendre
# d'uid derrière ça ne protégeait rien, et coûtait une fonction entière.
#
# Trois préparatifs ont disparu avec la bascule, chacun n'existant que pour
# elle : `chmod 0666 /dev/piControl0` (accès RevPi), `chown -R /data` — qui
# occupait le disque au démarrage, au moment précis où Prisma sature — et
# `chown -R /tmp/balena` pour le verrou d'update du superviseur.
#
# `pnpm run start` n'a jamais été autre chose que `node build/app.js` : passer
# par pnpm traînait corepack dans le chemin d'exécution.
exec node build/app.js
