import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { restorePurchases, validatePurchase } from '../../services/api-client/billing';
import { RegistrationApiError } from '../../services/api-client/types';

const PRODUCT_SWIPE_PACK = 'com.astromatch.swipe_pack';
const PRODUCT_BOOST = 'com.astromatch.alignment_boost';
const PRODUCT_LOCATION = 'com.astromatch.location_pass';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPurchased: () => void;
};

export function BillingSheet({ visible, onClose, onPurchased }: Props) {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [locationDest, setLocationDest] = useState('');

  const buy = async (productId: string, destinationLabel?: string) => {
    setBusy(productId);
    setErr(null);
    const tx = `sim-${productId}-${Date.now()}`;
    const receipt = `simulated-receipt-${productId}-${Date.now()}-12345678`;
    try {
      await validatePurchase({
        platform,
        productId,
        receiptData: receipt,
        transactionId: tx,
        destinationLabel,
      });
      onPurchased();
      onClose();
    } catch (e) {
      const msg =
        e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Purchase failed' : 'Purchase failed';
      setErr(msg);
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    setBusy('restore');
    setErr(null);
    try {
      await restorePurchases([
        {
          platform,
          productId: PRODUCT_SWIPE_PACK,
          receiptData: 'restore-stub-12345678',
          transactionId: `restore-${Date.now()}`,
        },
      ]);
      onPurchased();
    } catch (e) {
      const msg =
        e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Restore failed' : 'Restore failed';
      setErr(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Purchases</Text>
          <Text style={styles.lead}>
            Honest offers—no mystical guarantees. Final pricing is shown in your app store at checkout.
          </Text>
          {err ? <Text style={styles.err}>{err}</Text> : null}
          <ScrollView style={styles.scroll}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Swipe pack</Text>
              <Text style={styles.cardBody}>
                Adds bonus likes you can use after your daily free likes run out. Does not change who you match with.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.buy, pressed && styles.pressed, busy && styles.dim]}
                disabled={!!busy}
                onPress={() => buy(PRODUCT_SWIPE_PACK)}
                accessibilityRole="button"
              >
                {busy === PRODUCT_SWIPE_PACK ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.buyText}>Buy (simulated)</Text>
                )}
              </Pressable>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alignment boost</Text>
              <Text style={styles.cardBody}>
                Temporarily changes how profiles are ordered for you. This is not a match guarantee and does not
                reveal ranking rules.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.buy, pressed && styles.pressed, busy && styles.dim]}
                disabled={!!busy}
                onPress={() => buy(PRODUCT_BOOST)}
                accessibilityRole="button"
              >
                {busy === PRODUCT_BOOST ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.buyText}>Buy boost (simulated)</Text>
                )}
              </Pressable>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location pass</Text>
              <Text style={styles.cardBody}>
                Lets you explore with a different location label for a limited time. Feed behavior follows server
                rules; this is not a travel product.
              </Text>
              <TextInput
                style={styles.input}
                value={locationDest}
                onChangeText={setLocationDest}
                placeholder="Destination label (e.g. Berlin)"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Location destination"
              />
              <Pressable
                style={({ pressed }) => [styles.buy, pressed && styles.pressed, busy && styles.dim]}
                disabled={!!busy}
                onPress={() => {
                  const d = locationDest.trim();
                  if (!d) {
                    setErr('Enter a destination for the location pass.');
                    return;
                  }
                  buy(PRODUCT_LOCATION, d);
                }}
                accessibilityRole="button"
              >
                {busy === PRODUCT_LOCATION ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={styles.buyText}>Buy location pass (simulated)</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
          <Pressable
            style={({ pressed }) => [styles.restore, pressed && styles.pressed]}
            onPress={restore}
            disabled={!!busy}
            accessibilityRole="button"
          >
            {busy === 'restore' ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>
          <Pressable style={({ pressed }) => [styles.close, pressed && styles.pressed]} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.primary,
    borderTopRightRadius: radius.primary,
    paddingHorizontal: spacing.scale[3],
    paddingTop: spacing.scale[4],
    paddingBottom: spacing.scale[4],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
  },
  lead: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginTop: spacing.scale[2],
    marginBottom: spacing.scale[2],
  },
  err: {
    color: colors.accent,
    marginBottom: spacing.scale[2],
  },
  scroll: {
    maxHeight: 420,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
    marginBottom: spacing.scale[2],
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.bodyL.fontSize,
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginTop: spacing.scale[1],
    marginBottom: spacing.scale[2],
  },
  input: {
    borderRadius: radius.primary,
    borderWidth: 1,
    borderColor: colors.textMuted,
    padding: spacing.scale[2],
    color: colors.textPrimary,
    marginBottom: spacing.scale[2],
  },
  buy: {
    minHeight: 44,
    borderRadius: radius.primary,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    color: colors.background,
    fontWeight: '700',
  },
  restore: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.scale[2],
  },
  restoreText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  close: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
  dim: {
    opacity: 0.6,
  },
});
