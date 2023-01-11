## Composant — Réservoirs

### Description du composant

Ce composant permet la gestion des réactifs et des réservoirs des machines. Ce composant permet de gérer, l'affectation des produits dans la machine, la régulation de températurs de certaisn réservoirs et la consultation des différents capteurs de réservoir.

### Liste des réservoirs

La liste des réservoirs est accéssible directement sur la page d'accueil.

![Containers list](assets/containers-list.png)

Chaque réservoir se voit attribué, des capteurs et pour certains des produits. Cliquez sur réservoir pour ouvrir les détails de ce dernier.

### Informations d'un réservoir

![Container modal](assets/container-modal.png)

Chaque réservoir possède des configuration différentes, nous prendrons en exemple ici un reservoir complet avec :

- Gestion du produit
- Gestion d'une regulation de température

#### Gestion du produit

##### Chargement du produit

Lorsque vous cliquez sur **Charger un produit**, la machine charge soit automatiquement le produit auquel elle est assignée ou si plusieurs produit il y as, vous demande quel produit doit etre chargé.

![Container modal Load](assets/container-modal-load.png)

Il est aussi possible que la machine vous demande de quel manières souhaitez vous charger ce produit dans le réservoir. Référez vous au manuel d'utilisation de votre machine pour savoir quel sont les variantes.

![Container modal load method](assets/container-modal-load-method.png)

Cliquez sur **charger le produit** pour charger le produit dans le réservoir.

##### Déchargement du produit

Lorsque vous cliquez sur **Décharger un produit**, la machine peux lancer d'elle meme un cycle de vidange du conteneur. ou alors le déchargement du produit est uniquement a titre indicatif lorsque vous avez vidangé manuellement votre machine.

#### Gestion des regulations

Certains réservoirs sont régulables en température. 

![Container regulation](assets/container-regulation.png)

Vous pouvez modifier la consigne en modifiant la **valeur recherchée** et activer la régulation en changeant l'**État de la régulation**. Vous pouvez aussi consulter le **graphique** pour voir l'évolution de la régulation dans le temps.

> ⚠️ La régulation de température peux activer certains modes manuels pour fonctionner de manières optimale. Ces derniers seronts vérouillés tant que la régulation est active.