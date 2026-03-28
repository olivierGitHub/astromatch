# Confiance, sécurité communautaire et support

## Objectif

Réduire les abus et donner des **leviers utilisateur** (signalement, blocage), des **outils opérateur** minimaux (file de signalements, actions warn/suspend/ban avec audit), des **limites** sur les actions sensibles, et des **canaux d’aide** (compte / données / facturation).

## Fonctionnalités clés

- **Signalement** : contexte FEED / CHAT / MATCH, code raison + détail optionnel ; limite horaire par utilisateur.
- **Blocage** : relation stockée ; **non-interaction** appliquée au feed, aux matchs listés, à la messagerie et aux médias feed.
- **Modération** : API opérateur protégée par clé (`X-Operator-Key`) ; mise à jour du statut compte ; journal d’audit.
- **Compte restreint** : comptes suspendus / bannis reçoivent une erreur dédiée sur les requêtes authentifiées.
- **Aide** : endpoint public listant des canaux placeholder (mailto) ; écran mobile « Help & support ».

## Où c’est dans le code

- **API** : packages `safety`, `help`, `AccountStatusFilter`, migrations Flyway associées.
- **Mobile** : `services/api-client/safety.ts`, `HelpScreen`, actions depuis feed et chat.

## Contrat API

Tags **Safety**, **Help**, **Operator** dans `openapi.yaml`.
