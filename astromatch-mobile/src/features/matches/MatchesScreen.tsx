import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { colors, radius, spacing, typography } from '../../design-system';
import { type MatchSummary, fetchMatches, matchProfilePhotoUrl } from '../../services/api-client/matches';
import { type FeedCandidateCard, type PendingLike, fetchPendingLikes, fetchFeedProfile, feedProfilePhotoUrl } from '../../services/api-client/feed';
import { getAccessToken } from '../../services/auth/session';
import { RegistrationApiError } from '../../services/api-client/types';
import { SessionCard } from '../feed/SessionCard';

const LIKE_THUMB = 80;

type Props = {
  onOpenChat: (matchId: string, otherUserId: string) => void;
};

export function MatchesScreen({ onOpenChat }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [likes, setLikes] = useState<PendingLike[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [profileCard, setProfileCard] = useState<FeedCandidateCard | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAccessToken().then((t) => { if (!cancelled) setToken(t); });
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [m, l] = await Promise.all([fetchMatches(), fetchPendingLikes()]);
      setMatches(m);
      setLikes(l);
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? 'Could not load matches'
          : 'Could not load matches',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{err}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const headers = token
    ? { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
    : undefined;

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.matchId}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          {/* Section likes */}
          {likes.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mes likes</Text>
                <Text style={styles.sectionCount}>{likes.length}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {likes.map((like) => (
                  <Pressable
                    key={like.userId}
                    style={({ pressed }) => [styles.likeThumb, pressed && { opacity: 0.75 }]}
                    onPress={async () => {
                      setProfileLoading(true);
                      setProfileCard(null);
                      try {
                        const card = await fetchFeedProfile(like.userId);
                        setProfileCard(card);
                      } catch {
                        // silently ignore
                      } finally {
                        setProfileLoading(false);
                      }
                    }}
                  >
                    {like.firstPhotoId && headers ? (
                      <Image
                        source={{ uri: feedProfilePhotoUrl(like.userId, like.firstPhotoId), headers }}
                        style={styles.likeImg}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.likeImgPlaceholder}>
                        <Text style={styles.likeInitial}>
                          {(like.firstName ?? '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {like.firstName ? (
                      <Text style={styles.likeName} numberOfLines={1}>{like.firstName}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Section matchs header */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mes matchs</Text>
              {matches.length > 0 ? (
                <Text style={styles.sectionCount}>{matches.length}</Text>
              ) : null}
            </View>
            {matches.length === 0 ? (
              <Text style={styles.empty}>
                Pas encore de match. Quand vous vous likez mutuellement, ça apparaît ici.
              </Text>
            ) : null}
          </View>
        </>
      }
      ListFooterComponent={
        <>
          {/* Profile modal for likes */}
          <Modal
            visible={profileLoading || profileCard != null}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setProfileCard(null)}
          >
            <View style={styles.profileModal}>
              <Pressable style={styles.profileClose} onPress={() => setProfileCard(null)}>
                <Text style={styles.profileCloseText}>✕ Fermer</Text>
              </Pressable>
              {profileLoading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color={colors.secondary} />
                </View>
              ) : profileCard ? (
                <ScrollView contentContainerStyle={styles.profileScroll}>
                  <SessionCard card={profileCard} onSafetyMenu={() => {}} onMismatch={() => {}} />
                </ScrollView>
              ) : null}
            </View>
          </Modal>
        </>
      }
      renderItem={({ item }) => {
        const name = item.firstName || item.otherEmail;
        return (
          <Pressable
            style={({ pressed }) => [styles.matchRow, pressed && styles.pressed]}
            onPress={() => onOpenChat(item.matchId, item.otherUserId)}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir la conversation avec ${name}`}
          >
            {item.firstPhotoId && headers ? (
              <Image
                source={{ uri: matchProfilePhotoUrl(item.otherUserId, item.firstPhotoId), headers }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{name}</Text>
              {item.lastMessageBody ? (
                <Text style={styles.matchHint} numberOfLines={1}>
                  {item.lastMessageSenderId !== item.otherUserId ? 'Vous : ' : ''}
                  {item.lastMessageBody}
                </Text>
              ) : (
                <Text style={styles.matchHint}>Appuyer pour chatter</Text>
              )}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.scale[3],
  },
  err: {
    color: colors.textMuted,
    marginBottom: spacing.scale[2],
    textAlign: 'center',
  },
  retryBtn: { padding: spacing.scale[2] },
  retryText: { color: colors.secondary, fontWeight: '700' },
  list: {
    paddingBottom: spacing.scale[5],
  },
  // Sections
  section: {
    paddingHorizontal: spacing.scale[3],
    paddingTop: spacing.scale[3],
    marginBottom: spacing.scale[1],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
    marginBottom: spacing.scale[2],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  sectionCount: {
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
  },
  // Likes carousel
  carousel: {
    gap: spacing.scale[2],
    paddingBottom: spacing.scale[1],
  },
  likeThumb: {
    alignItems: 'center',
    gap: 4,
  },
  likeImg: {
    width: LIKE_THUMB,
    height: LIKE_THUMB,
    borderRadius: 20,
  },
  likeImgPlaceholder: {
    width: LIKE_THUMB,
    height: LIKE_THUMB,
    borderRadius: 20,
    backgroundColor: colors.primary + '66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeInitial: {
    color: colors.primary,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  likeName: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    maxWidth: LIKE_THUMB,
    textAlign: 'center',
  },
  // Profile modal
  profileModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileClose: {
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
    alignSelf: 'flex-start',
  },
  profileCloseText: {
    color: colors.primary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  profileScroll: {
    paddingBottom: spacing.scale[5],
  },
  // Match rows
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[2],
    marginHorizontal: spacing.scale[3],
    marginBottom: spacing.scale[2],
    gap: spacing.scale[3],
  },
  pressed: { opacity: 0.88 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  matchInfo: {
    flex: 1,
    gap: 4,
  },
  matchName: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '600',
  },
  matchHint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
});
