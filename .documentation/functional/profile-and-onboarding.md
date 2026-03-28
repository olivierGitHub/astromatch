# Profil et onboarding

## Objectif

Après inscription, l’utilisateur complète un **profil intentionnel** : contexte de naissance (date, heure ou « inconnu », lieu avec fuseau), **localisation actuelle**, **dynamiques relationnelles** (jusqu’à deux libellés), **photos** et **bio**, puis **finalise l’onboarding** pour accéder au feed.

## Fonctionnalités clés

- **Consentements** : privacy obligatoire, options notifications / analytics.
- **Naissance** : lieu recherchable (MVP : stub ou intégration remplaçable), timezone pour le contexte astro sans exposer de moteur brut.
- **Localisation** : manuelle ou via appareil selon permissions.
- **Dynamiques** : catalogue fixe (huit libellés MVP), max deux sélectionnés.
- **Médias** : upload photos avec limites de taille ; ordre d’affichage.
- **Onboarding** : passage à l’état « complété » côté serveur, requis pour apparaître dans le feed des autres.

## Où c’est dans le code

- **API** : `profile`, `legal`, endpoints `/api/v1/me/profile/*`, `/api/v1/me/onboarding/complete`, `/api/v1/me/consents`.
- **Mobile** : `features/onboarding/`, clients `api-client` profil / consents.

## Contrat API

Tags **Profile**, **Legal**, **Places** dans `openapi.yaml`.
