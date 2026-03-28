import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';

type Props = {
  visible: boolean;
  message: string;
  onClose: () => void;
  onOpenShop: () => void;
  onRestore: () => void;
};

export function QuotaGateModal({ visible, message, onClose, onOpenShop, onRestore }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Daily limit reached</Text>
          <Text style={styles.body}>
            {message || 'You have used today’s free likes. You can wait until tomorrow, use bonus likes if you have them, or see options to add more.'}
          </Text>
          <Text style={styles.hint}>
            We do not promise matches or outcomes—only fair limits and clear offers.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            onPress={onOpenShop}
            accessibilityRole="button"
            accessibilityLabel="Open shop"
          >
            <Text style={styles.primaryText}>See options</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            onPress={onRestore}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <Text style={styles.secondaryText}>Restore purchases</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.tertiary, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.tertiaryText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.scale[3],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[4],
    gap: spacing.scale[2],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    marginBottom: spacing.scale[2],
  },
  primary: {
    minHeight: 48,
    borderRadius: radius.primary,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 48,
    borderRadius: radius.primary,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiary: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: typography.bodyL.fontSize,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: typography.bodyL.fontSize,
  },
  tertiaryText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: typography.bodyM.fontSize,
  },
  pressed: {
    opacity: 0.9,
  },
});
