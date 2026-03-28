# Calibration : « ne correspond pas »

## Objectif

Permettre à l’utilisateur de signaler qu’un profil **ne lui correspond pas**, avec une raison **dynamique affichée vs profil en général**, sans exposer les règles du moteur ; le serveur **persiste** l’événement et **réordonne** le feed de façon opaque.

## Fonctionnalités clés

- **Saisie** : feuille (sheet) dédiée, focus DYNAMIC / PROFILE / UNSPECIFIED.
- **Offline** : file d’attente côté mobile pour renvoi ultérieur (hors finalisation d’achat).
- **Serveur** : pas de champ « score » ou explication publique du classement.

## Où c’est dans le code

- **API** : `MismatchFeedback*`, endpoint `/api/v1/feed/mismatch`, intégration dans `FeedService` pour l’ordre des candidats.
- **Mobile** : `MismatchSheet`, `services/offline/mismatch-queue`.

## Contrat API

Décrit sous le tag **Feed** pour `/api/v1/feed/mismatch`.
