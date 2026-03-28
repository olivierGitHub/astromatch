import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { BillingSheet } from '../billing/BillingSheet';
import { FeedScreen } from '../feed/FeedScreen';
import { HelpScreen } from '../help/HelpScreen';
import { MatchesScreen } from '../matches/MatchesScreen';
import { ChatThreadScreen } from '../matches/ChatThreadScreen';
import { clearSession } from '../../services/auth/session';
import { fetchMe } from '../../services/api-client/me';
import { logoutRemote } from '../../services/api-client/logout';
import { deleteAccountRemote } from '../../services/api-client/profile-onboarding';
import { registerPushTokenWithServer } from '../../services/push';
import { colors, radius, spacing, typography } from '../../design-system';

type Props = {
  email: string;
  onSignOut: () => void;
};

type HomePanel = 'discover' | 'matches' | 'account';

export function HomeScreen({ email, onSignOut }: Props) {
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [panel, setPanel] = useState<HomePanel>('discover');
  const [chatThread, setChatThread] = useState<{ matchId: string; otherUserId: string } | null>(null);
  const [accountSub, setAccountSub] = useState<'main' | 'help'>('main');
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingRefresh, setBillingRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setVerifiedEmail(me.email);
      } catch {
        if (!cancelled) setVerifiedEmail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    registerPushTokenWithServer();
  }, []);

  useEffect(() => {
    if (panel !== 'account') {
      setAccountSub('main');
    }
  }, [panel]);

  const signOut = async () => {
    setLoading(true);
    try {
      await logoutRemote();
    } finally {
      await clearSession();
      setLoading(false);
      onSignOut();
    }
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently removes your account and profile data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccountRemote();
            } catch {
              Alert.alert('Could not delete account', 'Try again or sign out.');
            } finally {
              await clearSession();
              setLoading(false);
              onSignOut();
            }
          },
        },
      ],
    );
  };

  if (chatThread) {
    return (
      <View style={styles.container}>
        <ChatThreadScreen
          matchId={chatThread.matchId}
          otherUserId={chatThread.otherUserId}
          onBack={() => setChatThread(null)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BillingSheet
        visible={billingOpen}
        onClose={() => setBillingOpen(false)}
        onPurchased={() => {
          setBillingRefresh((n) => n + 1);
          setBillingOpen(false);
        }}
      />
      <View style={styles.tabRow}>
        {(['discover', 'matches', 'account'] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPanel(p)}
            style={({ pressed }) => [
              styles.tab,
              panel === p && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: panel === p }}
            accessibilityLabel={p === 'discover' ? 'Discover' : p === 'matches' ? 'Matches' : 'Account'}
          >
            <Text style={[styles.tabText, panel === p && styles.tabTextActive]}>
              {p === 'discover' ? 'Discover' : p === 'matches' ? 'Matches' : 'Account'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.body}>
        {panel === 'discover' ? (
          <FeedScreen
            billingRefreshToken={billingRefresh}
            onOpenChat={(matchId, otherUserId) => {
              setChatThread({ matchId, otherUserId });
            }}
            onOpenBilling={() => setBillingOpen(true)}
          />
        ) : null}
        {panel === 'matches' ? (
          <MatchesScreen
            onOpenChat={(matchId, otherUserId) => {
              setChatThread({ matchId, otherUserId });
            }}
          />
        ) : null}
        {panel === 'account' ? (
          accountSub === 'help' ? (
            <HelpScreen onBack={() => setAccountSub('main')} />
          ) : (
            <View style={styles.accountPanel}>
              <Text style={styles.bodyText}>
                Logged in as <Text style={styles.email}>{verifiedEmail ?? email}</Text>
                {verifiedEmail ? <Text style={styles.subtle}> (verified)</Text> : null}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.shopLink, pressed && styles.buttonPressed]}
                onPress={() => setAccountSub('help')}
                accessibilityRole="button"
                accessibilityLabel="Help and support"
              >
                <Text style={styles.shopLinkText}>Help & support</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
                onPress={signOut}
                disabled={loading}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Sign out</Text>
                )}
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.danger, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
                onPress={deleteAccount}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Delete account permanently"
              >
                <Text style={styles.dangerText}>Delete account</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.shopLink, pressed && styles.buttonPressed]}
                onPress={() => setBillingOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Purchases and subscriptions"
              >
                <Text style={styles.shopLinkText}>Purchases & limits</Text>
              </Pressable>
            </View>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.scale[3],
    paddingTop: spacing.scale[4],
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.scale[2],
    marginBottom: spacing.scale[2],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.scale[2],
    paddingHorizontal: spacing.scale[2],
    borderRadius: radius.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.secondary,
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: typography.bodyM.fontSize,
  },
  tabTextActive: {
    color: colors.background,
  },
  body: {
    flex: 1,
  },
  accountPanel: {
    flex: 1,
    paddingTop: spacing.scale[3],
    gap: spacing.scale[2],
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: typography.bodyL.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginBottom: spacing.scale[4],
  },
  email: {
    color: colors.secondary,
    fontWeight: '600',
  },
  subtle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '400',
  },
  button: {
    minHeight: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.scale[4],
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '600',
  },
  danger: {
    minHeight: 48,
    marginTop: spacing.scale[3],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.scale[2],
  },
  dangerText: {
    color: colors.accent,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  shopLink: {
    minHeight: 44,
    marginTop: spacing.scale[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopLinkText: {
    color: colors.secondary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
