import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import type { MismatchFocus } from '../../services/api-client/feed';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (focus: MismatchFocus) => Promise<void>;
};

const OPTIONS: { focus: MismatchFocus; label: string; hint: string }[] = [
  {
    focus: 'DYNAMIC',
    label: 'The suggested dynamic',
    hint: 'What showed up as the main vibe didn’t fit.',
  },
  {
    focus: 'PROFILE',
    label: 'The profile overall',
    hint: 'Photos, bio, or context felt off.',
  },
  {
    focus: 'UNSPECIFIED',
    label: 'Prefer not to say',
    hint: 'Still helps us tune what you see—without the details.',
  },
];

export function MismatchSheet({ visible, onClose, onSubmit }: Props) {
  const [focus, setFocus] = useState<MismatchFocus>('UNSPECIFIED');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    if (submitting) return;
    setErr(null);
    onClose();
  };

  const submit = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      await onSubmit(focus);
    } catch {
      setErr('Could not send. Check your connection or try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={close}
      accessibilityViewIsModal
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss" />
        <View style={styles.sheet} accessibilityRole="none">
        <Text style={styles.title}>This doesn’t match me</Text>
        <Text style={styles.lead}>
          Help us tune your feed—there’s no wrong answer, and nothing here changes how others see you.
        </Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        <ScrollView style={styles.options} keyboardShouldPersistTaps="handled">
          {OPTIONS.map((o) => {
            const selected = focus === o.focus;
            return (
              <Pressable
                key={o.focus}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => setFocus(o.focus)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={styles.optionLabel}>{o.label}</Text>
                <Text style={styles.optionHint}>{o.hint}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && styles.btnPressed]}
            onPress={close}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.btnPressed, submitting && styles.primaryDim]}
            onPress={submit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit feedback"
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryText}>Submit</Text>
            )}
          </Pressable>
        </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '88%',
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
    marginBottom: spacing.scale[2],
  },
  lead: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    marginBottom: spacing.scale[3],
  },
  err: {
    color: colors.accent,
    fontSize: typography.bodyM.fontSize,
    marginBottom: spacing.scale[2],
  },
  options: {
    maxHeight: 280,
    marginBottom: spacing.scale[3],
  },
  option: {
    borderRadius: radius.primary,
    borderWidth: 1,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
    padding: spacing.scale[3],
    marginBottom: spacing.scale[2],
  },
  optionSelected: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: typography.bodyL.fontSize,
  },
  optionHint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.scale[1],
    lineHeight: typography.bodyM.lineHeight,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.scale[2],
  },
  secondary: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.primary,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: typography.bodyL.fontSize,
  },
  primary: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.primary,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDim: {
    opacity: 0.7,
  },
  primaryText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: typography.bodyL.fontSize,
  },
  btnPressed: {
    opacity: 0.88,
  },
});
