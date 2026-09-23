# Mise en production - TalentiQues Store FR

## Étape 1 - Supabase

Exécuter `supabase/store_orders.sql` dans SQL Editor.

Ajouter dans Vercel :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

La service role ne doit jamais être préfixée par `NEXT_PUBLIC_`.

## Étape 2 - PayPal Live

Dans le projet Vercel de `talentiques.com`, ajouter :
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV=live`
- `NEXT_PUBLIC_APP_URL=https://talentiques.com`

Le fait que ces variables existent déjà dans le projet Vercel d'Alternance ne les rend pas automatiquement disponibles dans le projet principal : il faut les renseigner dans le projet Vercel de `talentiques.com`.

Le `CLIENT_ID` et le `CLIENT_SECRET` peuvent provenir de la même application PayPal Live que le projet Alternance si c'est bien l'application que vous souhaitez utiliser. En revanche, ne recopiez pas aveuglément le `PAYPAL_WEBHOOK_ID` d'Alternance : il doit correspondre au webhook enregistré pour l'URL du nouveau projet principal.

Créer / configurer un webhook PayPal Live vers :
`https://talentiques.com/api/store/paypal/webhook`

Événement indispensable :
- `PAYMENT.CAPTURE.COMPLETED`

## Étape 3 - Resend

Ajouter :
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Exemple :
`TalentiQues <noreply@talentiques.com>`

Le domaine expéditeur doit être vérifié chez Resend.

## Étape 4 - Packages

Uploader les deux ZIPs payants dans un emplacement final fiable, puis renseigner :
- `STORE_TRACKER_PACKAGE_FR_URL`
- `STORE_ATS_PACKAGE_FR_URL`

Le Bundle utilise automatiquement les deux.

## Étape 5 - Timer

Optionnel :
`NEXT_PUBLIC_STORE_LAUNCH_END_AT=2026-10-01T23:59:59+02:00`

Toujours utiliser une vraie date de fin si ce message est affiché publiquement.

## Étape 6 - Analytics

Optionnels :
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_GA4_ID`

## Étape 7 - Test obligatoire avant Ads

Tester les trois produits au minimum en sandbox, puis effectuer au moins un achat réel Live :
1. arrivée sur `/outils` ;
2. CTA ;
3. checkout ;
4. paiement PayPal ;
5. ligne `store_orders` = `paid` ;
6. e-mail Resend reçu ;
7. page `/outils/acces` ouverte ;
8. liens de téléchargement fonctionnels ;
9. événement Purchase visible dans les outils analytics configurés.


## Étape 8 - Vérification juridique / commerciale avant trafic payant

Le checkout enregistre désormais la demande expresse d'accès immédiat au contenu numérique et envoie une confirmation par e-mail.

Avant la mise en production, faire relire / mettre à jour les pages actuelles :
- `/conditions-generales` ;
- `/politique-de-confidentialite` ;
- `/mentions-legales`.

Les Conditions générales présentes dans le ZIP d'origine sont encore principalement rédigées pour des prestations / séances et ne décrivent pas suffisamment la nouvelle vente de produits numériques. Vérifier également les obligations fiscales applicables (TVA / taxes selon le statut de l'entreprise et les pays vendus).

Ce point est volontairement laissé à validation juridique/comptable : le code technique ne doit pas inventer le statut légal ou fiscal de TalentiQues.
