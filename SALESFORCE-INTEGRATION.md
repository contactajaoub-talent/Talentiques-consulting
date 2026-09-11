# Talentiques — intégration Salesforce

## Inclus
- Header desktop rééquilibré et responsive.
- Offre 60 € : formulaire → Salesforce → PayPal.
- Offre 30 € : formulaire → Salesforce → PayPal.
- Accompagnement : formulaire complet → Salesforce.
- Contact : formulaire → Salesforce.
- Diagnostic CV : formulaire → Salesforce.
- UTM Source / Medium / Campaign + page d'origine.
- CV : stockage privé Vercel Blob + lien signé envoyé dans Salesforce.

## Salesforce
Organisation Web-to-Lead : `00Dd3000009hT3B`.
Le code utilise les IDs personnalisés générés le 11/09/2026.

## Vercel Blob requis pour les CV
Créer dans le projet Vercel un Blob Store en mode **Private**.
Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN` au projet.

Les formulaires sans CV fonctionnent sans Blob. Les formulaires où le CV est obligatoire
(optimisation et diagnostic) nécessitent cette configuration.

## Limite CV
4 Mo maximum. Formats : PDF, DOC, DOCX.
