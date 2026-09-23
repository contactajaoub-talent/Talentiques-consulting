# Store FR Premium — mise à jour

Cette version conserve l'architecture actuelle de la Store et ajoute :

- les 4 visuels premium validés dans `public/store/premium/` ;
- un hero plus premium avec le nouveau visuel principal ;
- un compteur de session de 10 minutes persistant pendant la navigation dans le même onglet ;
- des pages détail dédiées avant checkout :
  - `/outils/opportunity-tracker`
  - `/outils/cv-ats`
  - `/outils/bundle`
- les détails de livraison après paiement ;
- un upsell permanent vers le Bundle sur les deux pages produits séparés ;
- un CTA mobile sticky ;
- le correctif TypeScript de la page `/outils/acces`.

## Important concernant le compteur

Le compteur est un compteur de session. Il ne prétend pas qu'un prix change automatiquement à zéro et ne redémarre pas silencieusement pendant la même session de navigateur.

## Version anglaise

Le catalogue contient déjà les prix USD (`$7.99`, `$9.99`, `$14.99`). La prochaine étape est de créer `/en/tools` et les pages détails anglaises avec des visuels EN dédiés, afin de ne pas montrer des textes français au marché anglophone.
