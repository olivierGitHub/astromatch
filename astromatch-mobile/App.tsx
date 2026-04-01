import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ForgotPasswordScreen } from './src/features/auth/ForgotPasswordScreen';
import { HomeScreen } from './src/features/auth/HomeScreen';
import { RegisterScreen } from './src/features/auth/RegisterScreen';
import { ResetPasswordScreen } from './src/features/auth/ResetPasswordScreen';
import { SignInScreen } from './src/features/auth/SignInScreen';
import { OnboardingFlow } from './src/features/onboarding/OnboardingFlow';
import { colors } from './src/design-system';
import { setSessionInvalidationHandler } from './src/services/api-client/authenticated-fetch';
import { fetchMe } from './src/services/api-client/me';
import { getAccessToken, getStoredEmail } from './src/services/auth/session';

type Route =
  | { screen: 'loading' }
  | { screen: 'register' }
  | { screen: 'signIn'; email?: string }
  | { screen: 'forgotPassword'; email?: string }
  | { screen: 'resetPassword'; email: string; token?: string }
  | { screen: 'onboarding'; email: string }
  | { screen: 'home'; email: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'loading' });

  const goHomeOrOnboarding = useCallback(async (fallbackEmail: string) => {
    try {
      const me = await fetchMe();
      if (!me.onboardingCompleted) {
        setRoute({ screen: 'onboarding', email: me.email });
      } else {
        setRoute({ screen: 'home', email: me.email });
      }
    } catch {
      setRoute({ screen: 'home', email: fallbackEmail });
    }
  }, []);

  const bootstrap = useCallback(async () => {
    const token = await getAccessToken();
    const email = await getStoredEmail();
    if (token && email) {
      await goHomeOrOnboarding(email);
    } else {
      setRoute({ screen: 'register' });
    }
  }, [goHomeOrOnboarding]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    setSessionInvalidationHandler(() => {
      setRoute({ screen: 'signIn', email: undefined });
    });
    return () => setSessionInvalidationHandler(null);
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.screen === 'signIn') {
        setRoute({ screen: 'register' });
        return true;
      }
      if (route.screen === 'forgotPassword') {
        setRoute({ screen: 'signIn', email: route.email });
        return true;
      }
      if (route.screen === 'resetPassword') {
        setRoute({ screen: 'forgotPassword', email: route.email });
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [route]);

  if (route.screen === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {route.screen === 'register' ? (
        <RegisterScreen
          onRegistered={(email) => setRoute({ screen: 'signIn', email })}
          onSignIn={() => setRoute({ screen: 'signIn' })}
        />
      ) : null}
      {route.screen === 'signIn' ? (
        <SignInScreen
          initialEmail={route.email ?? ''}
          onSignedIn={(email) => goHomeOrOnboarding(email)}
          onForgotPassword={(email) => setRoute({ screen: 'forgotPassword', email })}
        />
      ) : null}
      {route.screen === 'forgotPassword' ? (
        <ForgotPasswordScreen
          initialEmail={route.email ?? ''}
          onBack={() => setRoute({ screen: 'signIn', email: route.email })}
          onContinueToReset={(email, resetToken) =>
            setRoute({ screen: 'resetPassword', email, token: resetToken ?? undefined })
          }
        />
      ) : null}
      {route.screen === 'resetPassword' ? (
        <ResetPasswordScreen
          email={route.email}
          initialToken={route.token}
          onBack={() => setRoute({ screen: 'forgotPassword', email: route.email })}
          onDone={(email) => setRoute({ screen: 'signIn', email })}
        />
      ) : null}
      {route.screen === 'onboarding' ? (
        <OnboardingFlow
          email={route.email}
          onComplete={() => setRoute({ screen: 'home', email: route.email })}
        />
      ) : null}
      {route.screen === 'home' ? (
        <HomeScreen email={route.email} onSignOut={() => setRoute({ screen: 'register' })} />
      ) : null}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
