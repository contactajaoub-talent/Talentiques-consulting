# TalentiQues Store FR - analyse d'intégration

## 1. Ce qui existe réellement dans les deux ZIP fournis

### Projet `TalentiQues-Kit-Alternance-officiel-main`
- Next.js 15.
- Supabase pour les leads, achats et accès membre.
- PayPal Checkout API : création de commande, capture et webhook.
- Meta Pixel et Microsoft Clarity.
- Le paiement du Kit est fixé côté serveur à 34 EUR.
- La livraison se fait via invitation Supabase Auth vers l'espace membre.
- Le ZIP fourni ne contient pas d'intégration Resend ni Salesforce/WhatsApp.

### Projet `Talentiques-consulting-main`
- Next.js 16 + Tailwind CSS 3.
- Site principal `talentiques.com`.
- Salesforce Web-to-Lead + Vercel Blob pour les formulaires existants.
- Liens PayPal statiques pour les anciennes prestations.
- WhatsApp présent sur certaines pages / formulaires.
- Le ZIP fourni ne contient pas de PayPal Checkout API, Supabase, Resend, Meta Pixel, Clarity ou GA4 globaux.

## 2. Décision d'architecture

Le projet Alternance reste séparé et inchangé.

La nouvelle Store est intégrée dans le projet principal avec :
- `/outils` : landing Store FR.
- `/outils/checkout` : checkout PayPal par produit.
- `/outils/acces` : accès post-paiement sécurisé par token non devinable.
- `/api/store/paypal/create-order` : prix fixé côté serveur.
- `/api/store/paypal/capture-order` : validation du produit, devise et montant avant fulfillment.
- `/api/store/paypal/webhook` : filet de sécurité si le navigateur se ferme après paiement.
- Supabase REST côté serveur uniquement pour journaliser les commandes et rendre le fulfillment idempotent.
- Enregistrement du consentement à la fourniture immédiate du contenu numérique avant création de la commande PayPal.
- Confirmation de ce consentement dans l'e-mail de livraison.
- Resend via API REST, sans ajouter de dépendance npm.

Salesforce et WhatsApp existants restent intacts et ne sont pas ajoutés au checkout Store afin de réduire la friction.

## 3. Sécurité du pricing

Le navigateur ne choisit jamais le montant. Il envoie seulement `productId` et `market`.

Le serveur résout ensuite :
- Tracker FR : 7.90 EUR.
- CV ATS FR : 9.90 EUR.
- Bundle FR : 14.90 EUR.

Avant de considérer une commande payée, la capture PayPal est contrôlée contre le catalogue serveur : devise + montant + référence interne.

## 4. Livraison

Pour limiter le nombre de liens et simplifier l'expérience client, la livraison utilise deux packages :
- `STORE_TRACKER_PACKAGE_FR_URL` : package Produit 1 avec FR + EN.
- `STORE_ATS_PACKAGE_FR_URL` : package Produit 2 avec FR + EN.

Un acheteur Bundle reçoit les deux packages.

La future Store anglaise pourra utiliser deux packages EN-only séparés.

## 5. Timer

Le timer n'est pas un compte à rebours artificiel qui redémarre à chaque visite.
Il dépend de `NEXT_PUBLIC_STORE_LAUNCH_END_AT`.
Une fois la date atteinte, le composant l'indique au lieu de recommencer automatiquement.

## 6. Tracking

Le layout `/outils` supporte, uniquement si les variables Vercel sont renseignées :
- Meta Pixel.
- Microsoft Clarity.
- GA4.

Les CTA conservent également les paramètres UTM, `fbclid` et `gclid` jusqu'au checkout.
Les commandes Supabase gardent ces paramètres afin de relier achat et campagne.

## 7. Ce qui reste à fournir avant mise en production

1. Les deux URLs finales des packages FR.
2. Les variables PayPal Live du projet principal Vercel.
3. L'URL + service role Supabase choisi pour la Store.
4. La clé Resend + un domaine expéditeur vérifié.
5. Le PayPal webhook Live vers :
   `https://talentiques.com/api/store/paypal/webhook` et son **nouvel ID de webhook correspondant à cette URL**.
6. Une vraie date de fin pour le tarif de lancement si le timer est utilisé.
7. Les IDs Meta / Clarity / GA4 à utiliser pour cette Store.

Ne pas lancer de trafic payant avant un achat réel complet en production : page -> PayPal -> capture -> Supabase -> e-mail -> page d'accès -> téléchargement.


## 8. Points volontairement non automatisés

- Salesforce et WhatsApp ne sont pas ajoutés au checkout micro-produit : ils restent disponibles ailleurs sur le site mais ne doivent pas ajouter de friction à l'achat.
- Les anciennes Conditions générales sont orientées prestations. Elles doivent être adaptées aux produits numériques avant lancement public.
- Les obligations fiscales / TVA ne sont pas déduites du code existant ; elles doivent être validées selon le statut réel de l'entreprise et les marchés servis.
