## Informations réseau

Pour permettre la télémaintenance de votre machine, il suffit de la connecter à votre réseau via le port RJ45, situé sous le coffret électrique.

Cette connexion réseau nécessite l'accès aux ports sortants suivants :

| Port | Description |
| --- | --- |
| 443 TCP | Permet la connexion VPN Balena-Cloud |
| 123 UDP | Pour la synchronisation de la date et l'heure |
| 53 UDP | Pour la résolution DNS |

Elle nécessite aussi l'accès au domaine suivant:

- *.balena-cloud.com

Aucune connexion directe entre la machine et nos services n'est possible. Toutes les connexions sont sécurisées via un VPN.
