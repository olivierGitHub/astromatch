import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BillingSheet } from '../billing/BillingSheet';
import { FeedScreen } from '../feed/FeedScreen';
import { HelpScreen } from '../help/HelpScreen';
import { MatchesScreen } from '../matches/MatchesScreen';
import { ChatThreadScreen } from '../matches/ChatThreadScreen';
import { ProfileScreen } from '../profile/ProfileScreen';
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

type HomePanel = 'discover' | 'matches' | 'profile';

const NAV_ITEMS: { panel: HomePanel; label: string; icon: string; iconActive: string }[] = [
  { panel: 'discover', label: 'Discover', icon: 'compass-outline', iconActive: 'compass' },
  { panel: 'matches',  label: 'Matches',  icon: 'heart-outline',   iconActive: 'heart' },
  { panel: 'profile',  label: 'Profil',   icon: 'person-outline',  iconActive: 'person' },
];

export function HomeScreen({ email, onSignOut }: Props) {
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [panel, setPanel] = useState<HomePanel>('discover');
  const [chatThread, setChatThread] = useState<{ matchId: string; otherUserId: string } | null>(null);
  const [accountSub, setAccountSub] = useState<'main' | 'help'>('main');
  const [profileTab, setProfileTab] = useState<'edit' | 'account'>('edit');
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
    if (panel !== 'profile') {
      setAccountSub('main');
    }
  }, [panel]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (chatThread) {
        setChatThread(null);
        return true;
      }
      if (accountSub === 'help') {
        setAccountSub('main');
        return true;
      }
      if (profileTab === 'account') {
        setProfileTab('edit');
        return true;
      }
      if (panel !== 'discover') {
        setPanel('discover');
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [chatThread, accountSub, profileTab, panel]);

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
      <SafeAreaView style={styles.container}>
        <ChatThreadScreen
          matchId={chatThread.matchId}
          otherUserId={chatThread.otherUserId}
          onBack={() => setChatThread(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BillingSheet
        visible={billingOpen}
        onClose={() => setBillingOpen(false)}
        onPurchased={() => {
          setBillingRefresh((n) => n + 1);
          setBillingOpen(false);
        }}
      />

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
        {panel === 'profile' ? (
          accountSub === 'help' ? (
            <HelpScreen onBack={() => setAccountSub('main')} />
          ) : (
            <ProfileScreen
              tab={profileTab}
              onTabChange={setProfileTab}
              accountContent={
                <ScrollView style={styles.accountPanel} contentContainerStyle={{ gap: spacing.scale[2], paddingBottom: spacing.scale[4] }}>
                  <Text style={styles.bodyText}>
                    Connecté en tant que <Text style={styles.emailText}>{verifiedEmail ?? email}</Text>
                    {verifiedEmail ? <Text style={styles.subtle}> (vérifié)</Text> : null}
                  </Text>
                  <Pressable
                    style={({ pressed }) => [styles.shopLink, pressed && styles.buttonPressed]}
                    onPress={() => setAccountSub('help')}
                    accessibilityRole="button"
                  >
                    <Text style={styles.shopLinkText}>Aide & support</Text>
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
                      <Text style={styles.buttonText}>Se déconnecter</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.shopLink, pressed && styles.buttonPressed]}
                    onPress={() => setBillingOpen(true)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.shopLinkText}>Achats & limites</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.danger, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
                    onPress={deleteAccount}
                    disabled={loading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.dangerText}>Supprimer le compte</Text>
                  </Pressable>
                </ScrollView>
              }
            />
          )
        ) : null}
      </View>

      <View style={styles.navBar}>
        {NAV_ITEMS.map(({ panel: p, label, icon, iconActive }) => {
          const active = panel === p;
          return (
            <Pressable
              key={p}
              onPress={() => setPanel(p)}
              style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <Ionicons
                name={(active ? iconActive : icon) as any}
                size={26}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
  },
  body: {
    flex: 1,
  },
  accountPanel: {
    flex: 1,
    paddingHorizontal: spacing.scale[3],
    paddingTop: spacing.scale[3],
    gap: spacing.scale[2],
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.textMuted + '22',
    paddingTop: spacing.scale[2],
    paddingBottom: spacing.scale[2],
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.scale[1],
  },
  navItemPressed: {
    opacity: 0.7,
  },
  navLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: typography.bodyL.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginBottom: spacing.scale[4],
  },
  emailText: {
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
