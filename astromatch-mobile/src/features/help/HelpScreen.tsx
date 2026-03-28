import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { fetchHelpChannels, type HelpChannel } from '../../services/api-client/safety';

type Props = {
  onBack: () => void;
};

export function HelpScreen({ onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [accountRows, setAccountRows] = useState<HelpChannel[]>([]);
  const [billingRows, setBillingRows] = useState<HelpChannel[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await fetchHelpChannels();
      setAccountRows(data.accountAndData);
      setBillingRows(data.billingAndPurchases);
    } catch {
      setErr('Could not load help channels.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openHint = (hint: string) => {
    if (hint.startsWith('mailto:')) {
      Linking.openURL(hint).catch(() => {});
    }
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to account">
        <Text style={styles.back}>← Account</Text>
      </Pressable>
      <Text style={styles.title}>Help & support</Text>
      <Text style={styles.lead}>
        Placeholder contact paths. Replace with your support URLs and in-app forms when ready.
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} style={styles.center} />
      ) : null}
      {err ? <Text style={styles.err}>{err}</Text> : null}
      {!loading && !err ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.section}>Account & data</Text>
          {accountRows.map((c) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => openHint(c.contactHint)}
              accessibilityRole="button"
            >
              <Text style={styles.cardTitle}>{c.label}</Text>
              <Text style={styles.cardBody}>{c.description}</Text>
              <Text style={styles.cardHint}>{c.contactHint}</Text>
            </Pressable>
          ))}
          <Text style={styles.section}>Billing & purchases</Text>
          {billingRows.map((c) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => openHint(c.contactHint)}
              accessibilityRole="button"
            >
              <Text style={styles.cardTitle}>{c.label}</Text>
              <Text style={styles.cardBody}>{c.description}</Text>
              <Text style={styles.cardHint}>{c.contactHint}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: spacing.scale[2],
  },
  back: {
    color: colors.secondary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
    marginBottom: spacing.scale[2],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '600',
    marginBottom: spacing.scale[1],
  },
  lead: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginBottom: spacing.scale[3],
  },
  center: {
    marginTop: spacing.scale[4],
  },
  err: {
    color: colors.accent,
    marginBottom: spacing.scale[2],
  },
  scroll: {
    paddingBottom: spacing.scale[6],
    gap: spacing.scale[2],
  },
  section: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.scale[2],
    marginBottom: spacing.scale[1],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: typography.bodyL.fontSize,
    marginBottom: spacing.scale[1],
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginBottom: spacing.scale[1],
  },
  cardHint: {
    color: colors.secondary,
    fontSize: typography.caption.fontSize,
  },
});
