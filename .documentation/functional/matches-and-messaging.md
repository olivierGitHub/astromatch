# Matchs et messagerie

## Objectif

Lorsque deux utilisateurs se sont **likés mutuellement**, créer un **match**, permettre la **messagerie texte** dans l’app pour ce match, et notifier par **push** les nouveaux matchs et messages (si token enregistré).

## Fonctionnalités clés

- **Match** : création idempotente ; identifiant de match partagé entre les deux parties.
- **Messages** : liste chronologique, envoi avec limite de taille ; refus si **blocage** entre participants (Epic 6).
- **Push** : enregistrement du token Expo côté serveur ; envoi best-effort (configurable).

## Où c’est dans le code

- **API** : `MatchService`, `MatchMessagingService`, `MatchController`, `PushNotificationService` (ou équivalent).
- **Mobile** : `features/matches/`, services push, écran chat avec options sécurité.

## Contrat API

Tag **Matches** ; `/api/v1/matches`, `/api/v1/matches/{id}/messages`. Token push sous `/api/v1/me/device/push-token` (Identity / profil).
