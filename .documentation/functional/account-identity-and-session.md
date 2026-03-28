# Compte, identité et session

## Objectif

Permettre à un utilisateur de **créer un compte**, **se connecter**, **récupérer l’accès** en cas de mot de passe oublié, et **supprimer son compte**, avec des règles serveur sur l’**âge minimum** et la **sécurité des sessions**.

## Fonctionnalités clés

- **Inscription** : email + mot de passe + date de naissance ; refus si en dessous de l’âge légal configuré côté API.
- **Session** : JWT **access** (court) + **refresh** (long) ; déconnexion et rotation des refresh tokens.
- **Récupération** : demande de reset par email, token de réinitialisation (durée limitée).
- **Suppression de compte** : suppression des données associées selon la politique produit.
- **Limitation de débit** : protection des endpoints sensibles (login, register, recovery) par IP / fenêtre glissante.

## Où c’est dans le code

- **API** : package `com.astromatch.api.identity`, filtres de sécurité JWT, `application.properties` (`astromatch.identity.*`, `astromatch.jwt.*`, `astromatch.rate-limit.*`).
- **Mobile** : écrans auth sous `astromatch-mobile/src/features/auth/`, client `services/api-client/`, `services/auth/session`.

## Contrat API

Endpoints sous `/api/v1/auth/*`, `/api/v1/me/*` liés au compte ; détails dans `api-contract/openapi.yaml` (tag **Identity**).
