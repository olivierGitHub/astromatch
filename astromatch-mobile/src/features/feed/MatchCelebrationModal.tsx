import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import type { MatchCreated } from '../../services/api-client/feed';

type Props = {
  visible: boolean;
  match: MatchCreated | null;
  onContinue: () => void;
  onChat: () => void;
};

export function MatchCelebrationModal({ visible, match, onContinue, onChat }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>It’s a match</Text>
          <Text style={styles.sub}>
            {match
              ? 'You both chose each other. What feels right next?'
              : 'Something wonderful lined up.'}
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Keep exploring"
            >
              <Text style={styles.secondaryText}>Keep exploring</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={onChat}
              accessibilityRole="button"
              accessibilityLabel="Open chat"
            >
              <Text style={styles.primaryText}>Say hello</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.scale[3],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[4],
    gap: spacing.scale[3],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.scale[2],
    marginTop: spacing.scale[2],
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
  pressed: {
    opacity: 0.9,
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
});
