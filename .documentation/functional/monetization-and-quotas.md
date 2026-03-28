# Monétisation et quotas

## Objectif

Appliquer des **limites de swipes** quotidiennes, proposer des **achats in-app** (packs de likes, boost d’alignement, pass lieu) avec **validation serveur** des reçus (stub en dev, intégration stores en prod), et permettre le **restore** des achats.

## Fonctionnalités clés

- **Quota** : comptage serveur des likes / super-likes sur la journée UTC ; bonus likes consommables.
- **Produits** : IDs produits configurables ; durées boost / pass lieu stockées sur l’utilisateur.
- **Transactions** : idempotence par identifiant de transaction store.
- **UX** : copy non « mystique », chemins shop / restore clairs.

## Où c’est dans le code

- **API** : `BillingService`, `BillingProperties`, `billing_transactions`, endpoints `/api/v1/billing/*`.
- **Mobile** : `BillingSheet`, flux restore, appels API billing.

## Contrat API

Tag **Billing** dans `openapi.yaml`.
