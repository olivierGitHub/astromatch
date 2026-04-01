import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BirthForm, type BirthValues, parseDateForApi } from '../profile/BirthForm';

import { colors, radius, spacing, typography } from '../../design-system';
import {
  DYNAMIC_LABELS,
  type Attraction,
  type Gender,
  completeOnboarding,
  fetchPrivacyNotice,
  putBio,
  putBirthProfile,
  putConsents,
  putDynamics,
  putFirstName,
  putIdentity,
  putLocationProfile,
  uploadProfilePhoto,
} from '../../services/api-client/profile-onboarding';
import { RegistrationApiError } from '../../services/api-client/types';

type Props = {
  email: string;
  onComplete: () => void;
};

const STEPS = ['Privacy', 'Identity', 'Name', 'Birth', 'Location', 'Dynamics', 'Profile', 'Finish'] as const;

export function OnboardingFlow({ email, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [privacyText, setPrivacyText] = useState<string>('');

  const [gender, setGender] = useState<Gender | null>(null);
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [firstName, setFirstName] = useState('');

  const [birth, setBirth] = useState<BirthValues>({
    birthDate: '',
    birthTimeUnknown: true,
    birthTime: '',
    birthPlaceLabel: '',
    birthTimezone: 'Europe/Paris',
  });
  const [birthErr, setBirthErr] = useState<string | null>(null);

  const [locManual, setLocManual] = useState(true);
  const [locLabel, setLocLabel] = useState('');
  const [locLat, setLocLat] = useState<number | null>(null);
  const [locLng, setLocLng] = useState<number | null>(null);

  const [selectedDynamics, setSelectedDynamics] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (step === 0) {
      fetchPrivacyNotice()
        .then(setPrivacyText)
        .catch(() => setPrivacyText('Could not load privacy text.'));
    }
  }, [step]);

  const toggleDynamic = (id: string) => {
    setSelectedDynamics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };


  const nextFromPrivacy = async () => {
    setErr(null);
    setLoading(true);
    try {
      await putConsents({ privacy_ack: true, notifications: false, analytics: false });
      setStep(1);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const nextFromIdentity = async () => {
    setErr(null);
    if (!gender) {
      setErr('Choisis ton sexe.');
      return;
    }
    if (!attraction) {
      setErr('Choisis ton attirance.');
      return;
    }
    setLoading(true);
    try {
      await putIdentity(gender, attraction);
      setStep(2);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const nextFromName = async () => {
    setErr(null);
    if (!firstName.trim()) {
      setErr('Saisis ton prénom.');
      return;
    }
    setLoading(true);
    try {
      await putFirstName(firstName.trim());
      setStep(3);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const nextFromBirth = async () => {
    setErr(null);
    setBirthErr(null);
    const dateForApi = parseDateForApi(birth.birthDate);
    if (!dateForApi) {
      setBirthErr('Date invalide — format JJ/MM/AAAA attendu.');
      return;
    }
    if (!birth.birthPlaceLabel.trim()) {
      setBirthErr('Ville de naissance requise.');
      return;
    }
    if (!birth.birthTimeUnknown && !birth.birthTime.trim()) {
      setBirthErr('Heure requise ou coche « inconnue ».');
      return;
    }
    setLoading(true);
    try {
      await putBirthProfile({
        birthDate: dateForApi,
        birthTimeUnknown: birth.birthTimeUnknown,
        birthTime: birth.birthTimeUnknown ? null : birth.birthTime.trim() || null,
        birthPlaceLabel: birth.birthPlaceLabel.trim(),
        birthPlaceLat: null,
        birthPlaceLng: null,
        birthTimezone: birth.birthTimezone || 'Europe/Paris',
      });
      setStep(4);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const useDeviceLocation = async () => {
    setErr(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocManual(true);
      setErr('Permission denied — use manual city below.');
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setLocLat(pos.coords.latitude);
    setLocLng(pos.coords.longitude);
    setLocManual(false);
    const rev = await Location.reverseGeocodeAsync({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
    const r = rev[0];
    const label = [r?.city, r?.region, r?.country].filter(Boolean).join(', ') || 'Current location';
    setLocLabel(label);
  };

  const nextFromLocation = async () => {
    setErr(null);
    if (!locLabel.trim()) {
      setErr('Set a location label (device or manual).');
      return;
    }
    setLoading(true);
    try {
      await putLocationProfile({ label: locLabel.trim(), lat: locLat, lng: locLng, manual: locManual });
      setStep(5);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const nextFromDynamics = async () => {
    setErr(null);
    if (selectedDynamics.length === 0) {
      setErr('Pick at least one dynamic (up to two).');
      return;
    }
    setLoading(true);
    try {
      await putDynamics(selectedDynamics);
      setStep(6);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const nextFromProfile = async () => {
    setErr(null);
    setLoading(true);
    try {
      await putBio(bio.trim());
      setStep(7);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setErr('Photo permission denied.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (res.canceled || !res.assets[0]) return;
    setLoading(true);
    setErr(null);
    try {
      await uploadProfilePhoto(res.assets[0].uri);
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Upload failed' : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setErr(null);
    setLoading(true);
    try {
      await completeOnboarding();
      onComplete();
    } catch (e) {
      setErr(e instanceof RegistrationApiError ? e.envelope.error?.message ?? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step {step + 1}/{STEPS.length}: {STEPS[step]}</Text>
      <Text style={styles.email}>Signed in as {email}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}

      {step === 0 ? (
        <>
          <Text style={styles.body}>{privacyText}</Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromPrivacy}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Continue after reading privacy notice"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continue</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Text style={styles.body}>Indique ton sexe et ce qui t'attire.</Text>
          <Text style={styles.label}>Je suis</Text>
          <View style={styles.pills}>
            {([['MALE', 'Homme'], ['FEMALE', 'Femme']] as const).map(([val, label]) => (
              <Pressable
                key={val}
                style={[styles.pill, gender === val && styles.pillOn]}
                onPress={() => setGender(val)}
                accessibilityRole="button"
                accessibilityState={{ selected: gender === val }}
                accessibilityLabel={label}
              >
                <Text style={[styles.pillText, gender === val && styles.pillTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Attiré(e) par</Text>
          <View style={styles.pills}>
            {([['MEN', 'Les hommes'], ['WOMEN', 'Les femmes'], ['ALL', 'Les deux']] as const).map(([val, label]) => (
              <Pressable
                key={val}
                style={[styles.pill, attraction === val && styles.pillOn]}
                onPress={() => setAttraction(val)}
                accessibilityRole="button"
                accessibilityState={{ selected: attraction === val }}
                accessibilityLabel={label}
              >
                <Text style={[styles.pillText, attraction === val && styles.pillTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromIdentity}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continuer</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Text style={styles.body}>Comment tu t'appelles ?</Text>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Ton prénom"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="First name"
          />
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromName}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continuer</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <BirthForm values={birth} onChange={setBirth} error={birthErr} />
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromBirth}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continuer</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 4 ? (
        <>
          <Pressable style={styles.secondary} onPress={useDeviceLocation} accessibilityRole="button">
            <Text style={styles.secondaryText}>Use device location</Text>
          </Pressable>
          <Text style={styles.label}>Current city / area</Text>
          <TextInput
            style={styles.input}
            value={locLabel}
            onChangeText={(t) => {
              setLocLabel(t);
              setLocManual(true);
            }}
            placeholder="Manual city"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Current location label"
          />
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromLocation}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continue</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 5 ? (
        <>
          <Text style={styles.body}>Choose up to two dynamics (min 1).</Text>
          <View style={styles.pills}>
            {DYNAMIC_LABELS.map((d) => {
              const on = selectedDynamics.includes(d.id);
              return (
                <Pressable
                  key={d.id}
                  style={[styles.pill, on && styles.pillOn]}
                  onPress={() => toggleDynamic(d.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={d.title}
                >
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>{d.title}</Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromDynamics}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continue</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 6 ? (
        <>
          <Text style={styles.label}>Short bio</Text>
          <TextInput
            style={[styles.input, styles.bio]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="A few words about you"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Bio"
          />
          <Pressable style={styles.secondary} onPress={pickPhoto} accessibilityRole="button">
            <Text style={styles.secondaryText}>Add photo (optional)</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={nextFromProfile}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Continue</Text>}
          </Pressable>
        </>
      ) : null}

      {step === 7 ? (
        <>
          <Text style={styles.body}>You are ready for the feed. Confirm to finish onboarding.</Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed, loading && styles.dis]}
            onPress={finish}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.btnText}>Finish</Text>}
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.scale[3], paddingBottom: spacing.scale[7] },
  step: { color: colors.secondary, fontSize: typography.caption.fontSize, marginBottom: spacing.scale[1] },
  email: { color: colors.textMuted, marginBottom: spacing.scale[2] },
  err: { color: colors.accent, marginBottom: spacing.scale[2] },
  body: { color: colors.textPrimary, fontSize: typography.bodyM.fontSize, marginBottom: spacing.scale[2] },
  label: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginBottom: spacing.scale[1] },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.secondary,
    color: colors.textPrimary,
    padding: spacing.scale[2],
    marginBottom: spacing.scale[2],
    fontSize: typography.bodyL.fontSize,
  },
  bio: { minHeight: 100, textAlignVertical: 'top' },
  btn: {
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.scale[2],
  },
  pressed: { opacity: 0.85 },
  dis: { opacity: 0.6 },
  btnText: { color: colors.textPrimary, fontWeight: '600', fontSize: typography.bodyL.fontSize },
  secondary: { paddingVertical: spacing.scale[2], marginBottom: spacing.scale[1] },
  secondaryText: { color: colors.secondary, fontSize: typography.bodyM.fontSize },
  hit: { paddingVertical: spacing.scale[1] },
  hitText: { color: colors.secondary },
  row: { paddingVertical: spacing.scale[2] },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.scale[2], marginVertical: spacing.scale[2] },
  pill: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[2],
    borderRadius: radius.secondary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  pillOn: { borderColor: colors.primary, backgroundColor: colors.surface },
  pillText: { color: colors.textPrimary, fontSize: typography.bodyM.fontSize },
  pillTextOn: { fontWeight: '600' },
});
