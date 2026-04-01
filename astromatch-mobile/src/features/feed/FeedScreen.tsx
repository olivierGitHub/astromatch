import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../../design-system';
import {
  type FeedCandidateCard,
  type FeedQuota,
  type MatchCreated,
  fetchFeedCandidates,
  fetchFeedQuota,
  postFeedMismatch,
  postFeedSwipe,
  type MismatchFocus,
  type SwipeAction,
} from '../../services/api-client/feed';
import { restorePurchases } from '../../services/api-client/billing';
import { RegistrationApiError } from '../../services/api-client/types';
import { blockUser, submitSafetyReport } from '../../services/api-client/safety';
import { enqueueMismatch, flushMismatchQueue } from '../../services/offline/mismatch-queue';
import { MatchCelebrationModal } from './MatchCelebrationModal';
import { MismatchSheet } from './MismatchSheet';
import { QuotaGateModal } from './QuotaGateModal';
import { SessionCard } from './SessionCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

type FeedProps = {
  onOpenChat: (matchId: string, otherUserId: string) => void;
  onOpenBilling: () => void;
  billingRefreshToken?: number;
};

function FeedSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading profiles">
      <View style={styles.skBlock} />
      <View style={styles.skLine} />
      <View style={styles.skLineShort} />
    </View>
  );
}

export function FeedScreen({ onOpenChat, onOpenBilling, billingRefreshToken = 0 }: FeedProps) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<FeedCandidateCard[]>([]);
  const [quota, setQuota] = useState<FeedQuota | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingMatch, setPendingMatch] = useState<MatchCreated | null>(null);
  const [mismatchOpen, setMismatchOpen] = useState(false);
  const [quotaGateOpen, setQuotaGateOpen] = useState(false);
  const [quotaGateMessage, setQuotaGateMessage] = useState('');

  // Swipe animation
  const cardX = useRef(new Animated.Value(0)).current;
  const swipingRef = useRef(false);
  const busyRef = useRef(false);
  // Always points to the current candidate — updated every render, readable in static PanResponder
  const currentRef = useRef<FeedCandidateCard | null>(null);
  const fireSwipeRef = useRef<((userId: string, action: SwipeAction) => void) | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !swipingRef.current &&
        Math.abs(g.dx) > 10 &&
        Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        !swipingRef.current &&
        Math.abs(g.dx) > 10 &&
        Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderMove: (_, g) => {
        cardX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (swipingRef.current) return;

        const goRight = g.dx > SWIPE_THRESHOLD || (g.dx > 20 && g.vx > 0.8);
        const goLeft = g.dx < -SWIPE_THRESHOLD || (g.dx < -20 && g.vx < -0.8);

        if (goRight) {
          // Capture userId synchronously before the 250ms animation
          const uid = currentRef.current?.userId;
          if (!uid) return;
          swipingRef.current = true;
          Animated.timing(cardX, {
            toValue: SCREEN_WIDTH * 1.5,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            swipingRef.current = false;
            fireSwipeRef.current?.(uid, 'LIKE');
          });
        } else if (goLeft) {
          const uid = currentRef.current?.userId;
          if (!uid) return;
          swipingRef.current = true;
          Animated.timing(cardX, {
            toValue: -SCREEN_WIDTH * 1.5,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            swipingRef.current = false;
            fireSwipeRef.current?.(uid, 'PASS');
          });
        } else {
          Animated.spring(cardX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      await flushMismatchQueue();
      const [list, q] = await Promise.all([fetchFeedCandidates(), fetchFeedQuota()]);
      setCandidates(list);
      setQuota(q);
    } catch (e) {
      const msg =
        e instanceof RegistrationApiError
          ? e.envelope.error?.message || 'Could not load feed'
          : 'Could not load feed';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [billingRefreshToken]);

  useEffect(() => {
    load();
  }, [load]);

  const current = candidates[0] ?? null;
  // Keep currentRef in sync on every render so PanResponder can read it
  currentRef.current = current;

  const currentUserId = current?.userId;
  useEffect(() => {
    cardX.setValue(0);
    swipingRef.current = false;
  }, [currentUserId, cardX]);

  const openSafetyMenu = () => {
    if (!current) return;
    const uid = current.userId;
    Alert.alert('Safety', 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        onPress: () => {
          Alert.alert('Report', 'Select a reason', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Harassment',
              onPress: async () => {
                try {
                  await submitSafetyReport(uid, 'FEED', 'HARASSMENT');
                  Alert.alert('Thanks', 'We received your report.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not send report', msg);
                }
              },
            },
            {
              text: 'Spam or fake',
              onPress: async () => {
                try {
                  await submitSafetyReport(uid, 'FEED', 'SPAM');
                  Alert.alert('Thanks', 'We received your report.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not send report', msg);
                }
              },
            },
          ]);
        },
      },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Block this person?', 'You will not see each other in discovery or messaging.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: async () => {
                try {
                  await blockUser(uid);
                  setCandidates((prev) => prev.filter((c) => c.userId !== uid));
                  Alert.alert('Blocked', 'You can manage blocks from account settings when available.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not block', msg);
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  // Optimistic swipe: removes the card immediately, fires API in background.
  // Used by gesture swipes. userId captured synchronously at gesture release time.
  const fireSwipe = useCallback((userId: string, action: SwipeAction) => {
    setCandidates((prev) => prev.filter((c) => c.userId !== userId));
    postFeedSwipe(userId, action)
      .then((result) => {
        setQuota((prev) =>
          prev
            ? {
                ...prev,
                remainingLikesToday: result.remainingLikesToday,
                remainingSupersToday: result.remainingSupersToday,
                bonusLikeCredits: result.bonusLikeCreditsRemaining,
              }
            : prev,
        );
        if (result.match) setPendingMatch(result.match);
      })
      .catch((e) => {
        if (e instanceof RegistrationApiError) {
          const err = e.envelope.error;
          if (err?.code === 'QUOTA_EXCEEDED') {
            setQuotaGateMessage(err.message);
            setQuotaGateOpen(true);
          } else if (err?.code === 'RATE_LIMITED') {
            Alert.alert('Slow down', err.message);
          } else {
            Alert.alert('Something went wrong', err?.message ?? 'Try again.');
          }
        } else {
          Alert.alert('Something went wrong', 'Try again.');
        }
      });
  }, []);
  fireSwipeRef.current = fireSwipe;

  // Used by the SUPER_LIKE button (keeps busy state to disable the button)
  const onSwipe = async (action: SwipeAction) => {
    const uid = currentRef.current?.userId;
    if (!uid || busy) return;
    setBusy(true);
    busyRef.current = true;
    try {
      fireSwipe(uid, action);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <FeedSkeleton />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn't refresh your feed</Text>
        <Text style={styles.errorBody}>{err}</Text>
        <Pressable
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
          onPress={load}
          accessibilityRole="button"
          accessibilityLabel="Retry loading feed"
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>You're all caught up</Text>
        <Text style={styles.emptyBody}>
          New people will appear here as the community grows. Take a breath—what you're seeking is also seeking
          connection.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
          onPress={load}
          accessibilityRole="button"
          accessibilityLabel="Refresh feed"
        >
          <Text style={styles.retryText}>Refresh</Text>
        </Pressable>
      </View>
    );
  }

  const superDisabled = quota != null && quota.remainingSupersToday <= 0;

  const cardRotation = cardX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const likeOpacity = cardX.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = cardX.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: cardX }, { rotate: cardRotation }] },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[styles.swipeLabel, styles.swipeLabelLike, { opacity: likeOpacity }]}
            pointerEvents="none"
          >
            <Text style={[styles.swipeLabelText, styles.swipeLabelLikeText]}>LIKE</Text>
          </Animated.View>
          <Animated.View
            style={[styles.swipeLabel, styles.swipeLabelPass, { opacity: passOpacity }]}
            pointerEvents="none"
          >
            <Text style={[styles.swipeLabelText, styles.swipeLabelPassText]}>PASS</Text>
          </Animated.View>
          <SessionCard
            card={current}
            onSafetyMenu={openSafetyMenu}
            onMismatch={() => setMismatchOpen(true)}
          />
          <View style={styles.superBtnContainer} pointerEvents="box-none">
            <Pressable
              style={({ pressed }) => [styles.superBtn, pressed && styles.superBtnPressed, (busy || superDisabled) && styles.superBtnDim]}
              onPress={() => onSwipe('SUPER_LIKE')}
              disabled={busy || superDisabled}
              accessibilityRole="button"
              accessibilityLabel="Super like"
            >
              <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
      <QuotaGateModal
        visible={quotaGateOpen}
        message={quotaGateMessage}
        onClose={() => setQuotaGateOpen(false)}
        onOpenShop={() => {
          setQuotaGateOpen(false);
          onOpenBilling();
        }}
        onRestore={async () => {
          try {
            await restorePurchases([
              {
                platform: Platform.OS === 'ios' ? 'ios' : 'android',
                productId: 'com.astromatch.swipe_pack',
                receiptData: 'restore-quota-gate-12345678',
                transactionId: `restore-qg-${Date.now()}`,
              },
            ]);
            await load();
            setQuotaGateOpen(false);
            Alert.alert('Restore', 'If you had purchases, they were synced.');
          } catch {
            Alert.alert('Restore failed', 'Try again from Purchases in Account.');
          }
        }}
      />
      <MismatchSheet
        visible={mismatchOpen}
        onClose={() => setMismatchOpen(false)}
        onSubmit={async (focus: MismatchFocus) => {
          if (!current) return;
          try {
            await postFeedMismatch(current.userId, focus);
          } catch {
            await enqueueMismatch({ targetUserId: current.userId, focus });
            Alert.alert(
              'Saved offline',
              "We'll send this when you're back online. You can keep exploring.",
            );
          }
          setCandidates((prev) => prev.filter((c) => c.userId !== current.userId));
          setMismatchOpen(false);
        }}
      />
      <MatchCelebrationModal
        visible={pendingMatch != null}
        match={pendingMatch}
        onContinue={() => setPendingMatch(null)}
        onChat={() => {
          const m = pendingMatch;
          setPendingMatch(null);
          if (m) onOpenChat(m.matchId, m.otherUserId);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
  },
  superBtnContainer: {
    position: 'absolute',
    bottom: spacing.scale[4],
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  superBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  superBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  superBtnDim: {
    opacity: 0.4,
  },
  swipeLabel: {
    position: 'absolute',
    top: spacing.scale[3],
    zIndex: 10,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[1],
    borderRadius: radius.secondary,
    borderWidth: 3,
  },
  swipeLabelLike: {
    left: spacing.scale[3],
    borderColor: colors.secondary,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  swipeLabelPass: {
    right: spacing.scale[3],
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  swipeLabelText: {
    fontSize: typography.h3.fontSize,
    fontWeight: '800',
    letterSpacing: 1,
  },
  swipeLabelLikeText: {
    color: colors.secondary,
  },
  swipeLabelPassText: {
    color: '#EF4444',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.scale[3],
  },
  skeleton: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: spacing.scale[2],
  },
  skBlock: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.primary,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  skLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: colors.surface,
    opacity: 0.5,
    width: '90%',
  },
  skLineShort: {
    height: 14,
    borderRadius: 6,
    backgroundColor: colors.surface,
    opacity: 0.4,
    width: '55%',
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '600',
    marginBottom: spacing.scale[2],
  },
  errorBody: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    marginBottom: spacing.scale[3],
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '600',
    marginBottom: spacing.scale[2],
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.scale[4],
  },
  retry: {
    minHeight: 48,
    backgroundColor: colors.secondary,
    borderRadius: radius.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.scale[4],
    alignSelf: 'center',
  },
  retryPressed: {
    opacity: 0.9,
  },
  retryText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: typography.bodyL.fontSize,
  },
});
