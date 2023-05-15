## Informations réseau

Pour permettre la télé-maintenance de votre machine, il suffit de la connecter à votre réseau via le port RJ45, situé sous le coffret électrique.

Cette connexion réseau nécéssite l'accès au ports sortants suivants:

| Port | Description |
| --- | --- |
| 443 TCP | Permet la connexion VPN Balena-Cloud |
| 123 UDP | Pour la synchronisation de la date et l'heure |
| 53 UDP | Pour la résolution DNS |

Elle necessite aussi l'acces au domaine suivant:

- *.balena-cloud.com

Aucune connexion directe entre votre machine et nos services n'est possible. Toutes les connexions sont sécurisées a l'aide d'un VPN.