## Composant — Cycle

### Description du composant

Les cycles sont gérés via ce composant, il est accessible soit via les Bouton cycle soit via les cycles Quickstart pour les USCleaner.
 | **Metalfog & Smoothit** | **USCleaner** |
 | - | - |
 | ![Classique](assets/classic.png) |  ![Quickstart](assets/quickstart.png) |

### Cycle Quickstart

Pour lancer un cycle quickstart il suffit de changer les **réglages du cycle** en fonction de ce que vous souhaitez.

Cliquez ensuite sur le Bouton **Préparer le cycle** pour préparer le cycle sur la machine.
Pour la suite rendez vous a [Conditions de sécurités](#conditions-de-sécurité)

#### Sauvegarder des réglages

Vous pouvez enregistrer vos cycles favoris en cliquant sur le bouton:
![Quickstart Save](assets/quickstart-save.png)
Entrez ensuite le nom du profil souhaité dans la boite de dialogue.
![Quickstart Save Modal](assets/quickstart-save-modal.png)
Puis validez en cliquant sur Ok.

#### Supprimer des réglages
Vous pouvez supprimer les réglages en cliquant sur:
![Quickstart Delete](assets/quickstart-delete.png)

### Cycle classique

Pour les Metalfog et les Smoothit cliquez sur le boutton **Cycle**. Vous vous trouverez ensuite sur la page suivante: 
![Cycle Classique](assets/cycle-classic.png)

Vous trouverez 2 catégories:

- Les profils constructeur prédéfinis
- Les profils utilisateurs

Choissisez le profil que vous souhaitez utiliser pour lancer le cycle.

### Conditions de sécurité

Vous arrivez sur cet ecran:
![Cycle security check](assets/cycle-security.png)

Chaque élément dans le bloc gris représente une conditions de sécurité.
![Cycle security Element](assets/cycle-security-element.png)

Ces conditions peuvent avoir 3 états:

- **Vert**: OK pour lancer
- **Orange**: Attention requise, le cycle peux etre lancé mais son comportement n'est pas garanti.
- **Rouge**: Non OK pour lancer

Apres avoir vérifié toutes les conditions nous pouvons lancer le cycle en cliquant sur le bouton vert **Lancer le cycle**.

### Cycle lancé

Apparaitras ensuite cet écran, Il décrit le déroulé du cycle.

![Cycle Running](assets/cycle-running.png)

Sur la partie gauche, chaque bloc gris représente une étape du cycle, est est décrite avec:

- son nom
- sa description
- son pourcentage d'éxécution
- son statut

Sur la partie droite vous trouverez des informations généralistes concernant le cycle en cours:

- Le temps restant estimé
- Le temps total estimé
- Bouton d'arret du cycle

### Cycle terminé

Une fois le cycle terminé, l'ecran suivant s'affiche automatiquement.
Selon si le cycle c'est terminé correctement ou non l'ecran de fin change.

| Fin correcte | Fin Incorrecte |
| ---- | ---- |
| ![Cycle End Crash](assets/cycle-end-crash.png) | ![Cycle End Success](assets/cycle-end-success.png)|

Vous pouvez noter la qualité des pièces en sortie de machine a l'aide des 5 etoiles sur la droite. Cela nous permet lors des visites de maintenance de mieux comprendre votre utilisation de notre machine et d'y apporter des améliorations.

Validez la fin du cycle avec le boutton **Terminer le cycle**. Cela vous redirigeras vers la page d'acceuil de Nuster.

> Vous venez de réaliser votre premier cycle à l'aide de Nuster !