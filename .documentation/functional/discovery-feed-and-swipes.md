# Découverte : feed et swipes

## Objectif

Présenter une **liste ordonnée de profils** (ordre **opaque**, sans score numérique visible), des **cartes session** (contexte cosmique + dynamique suggérée, photos, localité secondaire), et permettre **pass / like / super-like** avec **quotas** et **limites de rafale** côté serveur.

## Fonctionnalités clés

- **Feed** : uniquement des profils ayant terminé l’onboarding ; exclusion des personnes déjà swipées et des **blocages** (Epic 6).
- **Swipe** : persistance des événements pour analytics et sécurité ; création de match en cas de réciproque (Epic 3).
- **Quotas** : likes / super-likes journaliers + crédits bonus (Epic 5) ; messages d’erreur actionnables.
- **Médias feed** : accès aux photos d’un candidat tant que le viewer n’a pas encore swipé ce profil (règles serveur).
- **États UI** : chargement, vide, momentum (copy rassurante).

## Où c’est dans le code

- **API** : `FeedService`, `FeedController`, `SwipeEventRepository`, `FeedProperties`.
- **Mobile** : `features/feed/` (SessionCard, SwipeActionDock, QuotaGateModal, etc.).

## Contrat API

Tag **Feed** ; chemins `/api/v1/feed/candidates`, `/api/v1/feed/swipe`, `/api/v1/feed/quota`, `/api/v1/feed/mismatch`, médias sous `/api/v1/feed/profiles/...`.
