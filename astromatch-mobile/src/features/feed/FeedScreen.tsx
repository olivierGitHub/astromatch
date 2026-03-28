import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { SwipeActionDock } from './SwipeActionDock';

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

  const current = candidates[0];

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

  const onSwipe = async (action: SwipeAction) => {
    if (!current) return;
    setBusy(true);
    try {
      const result = await postFeedSwipe(current.userId, action);
      setCandidates((prev) => prev.filter((c) => c.userId !== current.userId));
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
      if (result.match) {
        setPendingMatch(result.match);
      }
    } catch (e) {
      if (e instanceof RegistrationApiError) {
        const err = e.envelope.error;
        if (!err) {
          Alert.alert('Something went wrong', 'Try again.');
          return;
        }
        const { code, message, traceId } = err;
        const detail = traceId ? `${message}\nTrace: ${traceId}` : message;
        if (code === 'QUOTA_EXCEEDED') {
          setQuotaGateMessage(message);
          setQuotaGateOpen(true);
        } else if (code === 'RATE_LIMITED') {
          Alert.alert('Slow down', detail);
        } else {
          Alert.alert('Something went wrong', detail);
        }
      } else {
        Alert.alert('Something went wrong', 'Try again.');
      }
    } finally {
      setBusy(false);
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
        <Text style={styles.errorTitle}>We couldn’t refresh your feed</Text>
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
        <Text style={styles.emptyTitle}>You’re all caught up</Text>
        <Text style={styles.emptyBody}>
          New people will appear here as the community grows. Take a breath—what you’re seeking is also seeking
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

  const likeDisabled =
    quota != null && quota.remainingLikesToday <= 0 && quota.bonusLikeCredits <= 0;
  const superDisabled = quota != null && quota.remainingSupersToday <= 0;

  return (
    <>
      <View style={styles.root}>
        {quota ? (
          <Text style={styles.quotaLine} accessibilityLabel="Swipe allowance summary">
            Free likes: {quota.remainingLikesToday}/{quota.dailyLikeCap} · Supers: {quota.remainingSupersToday}/
            {quota.dailySuperLikeCap}
            {quota.bonusLikeCredits > 0 ? ` · Bonus likes: ${quota.bonusLikeCredits}` : ''}
          </Text>
        ) : null}
        <SessionCard card={current} />
        <Pressable
          style={({ pressed }) => [styles.safetyLink, pressed && styles.safetyLinkPressed]}
          onPress={openSafetyMenu}
          accessibilityRole="button"
          accessibilityLabel="Report or block this profile"
        >
          <Text style={styles.safetyLinkText}>Report or block</Text>
        </Pressable>
        <SwipeActionDock
          busy={busy}
          onAction={onSwipe}
          onMismatch={() => setMismatchOpen(true)}
          likeDisabled={likeDisabled}
          superDisabled={superDisabled}
        />
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
              'We’ll send this when you’re back online. You can keep exploring.',
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
  quotaLine: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.scale[2],
  },
  safetyLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.scale[1],
    marginBottom: spacing.scale[1],
  },
  safetyLinkPressed: {
    opacity: 0.85,
  },
  safetyLinkText: {
    color: colors.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
