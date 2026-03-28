import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { requestPasswordReset } from '../../services/api-client/forgot-password';
import { RegistrationApiError } from '../../services/api-client/types';

type Props = {
  initialEmail?: string;
  onBack: () => void;
  /** After server accepts request; optional token when API exposes it (dev). */
  onContinueToReset: (email: string, resetToken?: string | null) => void;
};

export function ForgotPasswordScreen({ initialEmail = '', onBack, onContinueToReset }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setFormError('Enter your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(trimmed);
      const data = res.data;
      if (!data?.sent) {
        setFormError('Unexpected response from server.');
        return;
      }
      onContinueToReset(trimmed.toLowerCase(), data.resetToken ?? null);
    } catch (e) {
      if (e instanceof RegistrationApiError) {
        const code = e.envelope.error?.code;
        if (code === 'NETWORK_ERROR' || code === 'INVALID_RESPONSE') {
          setFormError(e.envelope.error?.message ?? 'Could not reach the server.');
        } else if (code === 'RATE_LIMITED') {
          setFormError('Too many attempts. Wait a minute and try again.');
        } else if (code === 'VALIDATION_ERROR') {
          setFormError(e.envelope.error?.message ?? 'Check your email and try again.');
        } else {
          setFormError(e.envelope.error?.message ?? 'Something went wrong. Try again.');
        }
      } else {
        setFormError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>
        Enter your email, then set a new password using the reset token from your email. In local dev, the API may
        return the token in the response when enabled.
      </Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Email"
      />

      {formError ? <Text style={styles.formErr}>{formError}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
        onPress={submit}
        disabled={loading}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </Pressable>

      <Pressable style={styles.linkBtn} onPress={onBack} accessibilityRole="button">
        <Text style={styles.linkText}>Back to sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.scale[3],
    paddingTop: spacing.scale[5],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h1.fontSize,
    lineHeight: typography.h1.lineHeight,
    fontWeight: '600',
    marginBottom: spacing.scale[1],
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    marginBottom: spacing.scale[4],
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.scale[1],
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.secondary,
    color: colors.textPrimary,
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
    fontSize: typography.bodyL.fontSize,
    marginBottom: spacing.scale[2],
  },
  formErr: {
    color: colors.accent,
    fontSize: typography.bodyM.fontSize,
    marginBottom: spacing.scale[2],
  },
  button: {
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.scale[2],
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
  linkBtn: {
    marginTop: spacing.scale[4],
    paddingVertical: spacing.scale[2],
  },
  linkText: {
    color: colors.secondary,
    fontSize: typography.bodyM.fontSize,
  },
});
