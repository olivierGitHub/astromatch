import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import type { SwipeAction } from '../../services/api-client/feed';

type Props = {
  busy: boolean;
  onAction: (action: SwipeAction) => void;
  disabled?: boolean;
  onMismatch?: () => void;
  likeDisabled?: boolean;
  superDisabled?: boolean;
};

export function SwipeActionDock({
  busy,
  onAction,
  disabled,
  onMismatch,
  likeDisabled,
  superDisabled,
}: Props) {
  return (
    <View>
      {busy ? (
        <ActivityIndicator color={colors.secondary} style={styles.spinner} accessibilityLabel="Sending" />
      ) : null}
      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.pass, pressed && styles.pressed, disabled && styles.dim]}
          onPress={() => onAction('PASS')}
          disabled={busy || disabled}
          accessibilityRole="button"
          accessibilityLabel="Pass"
        >
          <Text style={styles.passText}>Pass</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.like,
            pressed && styles.pressed,
            (disabled || likeDisabled) && styles.dim,
          ]}
          onPress={() => onAction('LIKE')}
          disabled={busy || disabled || likeDisabled}
          accessibilityRole="button"
          accessibilityLabel="Like"
        >
          <Text style={styles.likeText}>Like</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.super,
            pressed && styles.pressed,
            (disabled || superDisabled) && styles.dim,
          ]}
          onPress={() => onAction('SUPER_LIKE')}
          disabled={busy || disabled || superDisabled}
          accessibilityRole="button"
          accessibilityLabel="Super like"
        >
          <Text style={styles.superText}>Super</Text>
        </Pressable>
      </View>
      {onMismatch ? (
        <Pressable
          style={({ pressed }) => [styles.mismatchBtn, pressed && styles.pressed]}
          onPress={onMismatch}
          disabled={busy || disabled}
          accessibilityRole="button"
          accessibilityLabel="Does not match me"
        >
          <Text style={styles.mismatchText}>Doesn’t match me</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.scale[2],
    justifyContent: 'center',
    paddingVertical: spacing.scale[2],
  },
  btn: {
    minHeight: 52,
    minWidth: 96,
    paddingHorizontal: spacing.scale[3],
    borderRadius: radius.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
  dim: {
    opacity: 0.45,
  },
  pass: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  passText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.bodyM.fontSize,
  },
  like: {
    backgroundColor: colors.secondary,
  },
  likeText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: typography.bodyM.fontSize,
  },
  super: {
    backgroundColor: colors.primary,
  },
  superText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.bodyM.fontSize,
  },
  mismatchBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.scale[2],
    paddingHorizontal: spacing.scale[3],
    marginTop: spacing.scale[1],
  },
  mismatchText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
