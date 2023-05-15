## Onglet — Cycle

### Description générale - Onglet Cycle 

Cette section permet de gérer les cycles machines. Dans la liste de gauche vous trouverez différents éléments :

- Cycles utilisateurs : marqués par un pictogramme bleu   `utilisateur`,
- Cycles constructeur principaux : marqués par un pictogramme  bleu  `constructeur`,
- Cycles constructeur secondaires : marqués par un pictogramme  rose  `constructeur`.

![Liste cycles](component_cycles.png)

Lorsque vous sélectionnez un cycle, la partie principale affiche les informations de ce cycle.

- Le nom du cycle utilisé, ici    `Cycle de base metalfog`
- Le nom du profil utilisé, ici    `Utility Silver Layer — USL`
- Le temps estimé, ici    `12m 11s`
- Le bouton pour démarrer le cycle
- Les conditions de sécurité pour démarrer le cycle

#### Conditions de sécurité

Les conditions de sécurité ont 3 états possibles :

- **Vert** : OK pour lancer,
- **Orange** : Avertissement (Le cycle peut être lancé mais son résultat n'est pas garanti),
- **Rouge** : Impossible de lancer (Action requise).

Si les états des conditions de sécurité le permettent alors le bouton   `Démarrer le cycle`   passe au vert.

### Cycle en cours

Lorsqu'un cycle est en cours, son déroulement s'affiche dans la partie principale.

![Liste cycles](cycles_running.png)

#### Informations du cycle

Dans la partie haute, vous trouverez :

- Le nom du cycle,
- Le nom du profil utilisé,
- Le temps estimé,
- Le temps restant,
- Un bouton   `Arrêter le cycle`.

#### Étapes du cycle

Dans la partie   `Étapes du cycle` , chaque étape est représentée par :

- Son nom,
- Sa description,
- Sa progression, si elle est en cours,
- Son statut :
        - Croix rouge : Pas encore executée,
        - 2 Flèches tournantes : Étape en cours,
        - Coche verte : Étape terminée.

#### Informations additionnelles

Pour certaines machines, une rubrique   `Informations addtionnelles`, peut être présente au dessus des étapes du cycle, elle peuvent donner par exemple   `la température du bac` pour un USCleaner thermorégulé.

### Cycle terminé

Une fois le cycle terminé, la partie principale affiche le message :
"Le cycle est terminé. Terminé avec succès".

![Fin du cycle](cycles_end.png)

Cette page permet de savoir si le cycle s'est terminé correctement et connaitre sa durée totale.

Si cette page affiche tout autre message que   `Terminé avec succès`, alors le message qui apparait précise la raison d’arrêt du cycle. 

Validez la fin du cycle avec le bouton   `Terminer le cycle`.

> Vous venez de réaliser votre premier cycle à l'aide de Nuster, félicitations !
