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
import { resetPasswordWithToken } from '../../services/api-client/reset-password';
import { RegistrationApiError } from '../../services/api-client/types';

type Props = {
  email: string;
  initialToken?: string;
  onBack: () => void;
  /** Navigate to sign-in with email prefilled after success. */
  onDone: (email: string) => void;
};

export function ResetPasswordScreen({ email, initialToken = '', onBack, onDone }: Props) {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    setFormError(null);
    const t = token.trim();
    if (!t) {
      setFormError('Paste the reset token from your email (or dev response).');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithToken(t, newPassword);
      onDone(email);
    } catch (e) {
      if (e instanceof RegistrationApiError) {
        const code = e.envelope.error?.code;
        if (code === 'NETWORK_ERROR' || code === 'INVALID_RESPONSE') {
          setFormError(e.envelope.error?.message ?? 'Could not reach the server.');
        } else if (code === 'INVALID_RESET_TOKEN') {
          setFormError('This reset link is invalid or expired. Request a new one.');
        } else if (code === 'VALIDATION_ERROR') {
          setFormError(e.envelope.error?.message ?? 'Check your password and try again.');
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
      <Text style={styles.title}>Set new password</Text>
      <Text style={styles.subtitle}>Account: {email}</Text>

      <Text style={styles.label}>Reset token</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Paste token from email"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Reset token"
        multiline
      />

      <Text style={styles.label}>New password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        placeholder="At least 8 characters"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="New password"
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
          <Text style={styles.buttonText}>Update password</Text>
        )}
      </Pressable>

      <Pressable style={styles.linkBtn} onPress={onBack} accessibilityRole="button">
        <Text style={styles.linkText}>Back</Text>
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
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
