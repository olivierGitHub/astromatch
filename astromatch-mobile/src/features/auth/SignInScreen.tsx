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
import { loginAccount } from '../../services/api-client/login';
import { RegistrationApiError } from '../../services/api-client/types';
import { saveSession } from '../../services/auth/session';

type FieldErr = { field: string; message: string };

function mapValidationFieldToKey(field: string): 'email' | 'password' | null {
  const f = field.toLowerCase();
  if (f === 'email' || f.endsWith('.email')) return 'email';
  if (f === 'password' || f.endsWith('.password')) return 'password';
  return null;
}

type Props = {
  initialEmail?: string;
  onSignedIn: (email: string) => void;
  onForgotPassword?: (email: string) => void;
};

export function SignInScreen({ initialEmail = '', onSignedIn, onForgotPassword }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'email' | 'password', string>>>({});

  const clearField = (key: 'email' | 'password') => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = async () => {
    setFormError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await loginAccount({ email: email.trim(), password });
      const data = res.data;
      if (!data?.accessToken || !data.refreshToken) {
        setFormError('Unexpected response from server.');
        return;
      }
      await saveSession(data.accessToken, data.refreshToken, data.email);
      onSignedIn(data.email);
    } catch (e) {
      if (e instanceof RegistrationApiError) {
        const code = e.envelope.error?.code;
        const details = e.envelope.error?.details;
        if (code === 'NETWORK_ERROR' || code === 'INVALID_RESPONSE') {
          setFormError(e.envelope.error?.message ?? 'Could not reach the server or read the response.');
        } else if (code === 'VALIDATION_ERROR' && Array.isArray(details)) {
          const next: Partial<Record<'email' | 'password', string>> = {};
          for (const row of details as FieldErr[]) {
            const key = mapValidationFieldToKey(row.field);
            if (key) next[key] = row.message;
          }
          setFieldErrors(next);
          if (Object.keys(next).length === 0) {
            setFormError(e.envelope.error?.message ?? 'Check your input and try again.');
          }
        } else if (code === 'INVALID_CREDENTIALS') {
          setFormError('Invalid email or password.');
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
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Use the email and password for your account</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clearField('email');
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="you@example.com"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Email"
      />
      {fieldErrors.email ? <Text style={styles.fieldErr}>{fieldErrors.email}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clearField('password');
        }}
        secureTextEntry
        placeholder="Your password"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Password"
      />
      {fieldErrors.password ? <Text style={styles.fieldErr}>{fieldErrors.password}</Text> : null}

      {formError ? <Text style={styles.formErr}>{formError}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
        onPress={submit}
        disabled={loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        {loading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
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
  fieldErr: {
    color: colors.accent,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.scale[2],
  },
  formErr: {
    color: colors.accent,
    fontSize: typography.bodyM.fontSize,
    marginBottom: spacing.scale[2],
  },
  button: {
    minHeight: 48,
    minWidth: 48,
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
    alignItems: 'center',
  },
  linkText: {
    color: colors.secondary,
    fontSize: typography.bodyM.fontSize,
  },
});
