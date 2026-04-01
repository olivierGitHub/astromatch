/**
 * BirthForm — reusable form for birth date / time / place.
 * Used in onboarding (step 3) and profile edit card.
 */
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { searchPlaces } from '../../services/api-client/profile-onboarding';

export type BirthValues = {
  birthDate: string;          // "DD/MM/YYYY" display, stored as "YYYY-MM-DD"
  birthTimeUnknown: boolean;
  birthTime: string;          // "HH:mm"
  birthPlaceLabel: string;
  birthTimezone: string;
};

type Props = {
  values: BirthValues;
  onChange: (next: BirthValues) => void;
  error?: string | null;
};

/** Parse DD/MM/YYYY → "YYYY-MM-DD" for the API, or null if invalid */
export function parseDateForApi(display: string): string | null {
  const parts = display.trim().split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return null;
  const dd = d.padStart(2, '0');
  const mm = m.padStart(2, '0');
  if (isNaN(Date.parse(`${y}-${mm}-${dd}`))) return null;
  return `${y}-${mm}-${dd}`;
}

/** Format "YYYY-MM-DD" (from API) → "DD/MM/YYYY" for display */
export function formatDateForDisplay(apiDate: string | null | undefined): string {
  if (!apiDate) return '';
  const parts = apiDate.split('-');
  if (parts.length !== 3) return apiDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) {
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  }
  if (digits.length > 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

function formatTimeInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) {
    return digits.slice(0, 2) + ':' + digits.slice(2);
  }
  return digits;
}

export function BirthForm({ values, onChange, error }: Props) {
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeHits, setPlaceHits] = useState<{ label: string; lat: number; lng: number; timezone: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const set = (patch: Partial<BirthValues>) => onChange({ ...values, ...patch });

  const searchPlace = useCallback(async () => {
    if (!placeQuery.trim()) return;
    setSearching(true);
    try {
      const hits = await searchPlaces(placeQuery.trim());
      setPlaceHits(hits);
    } finally {
      setSearching(false);
    }
  }, [placeQuery]);

  return (
    <View style={styles.root}>
      {/* Date de naissance */}
      <Text style={styles.label}>Date de naissance</Text>
      <TextInput
        style={styles.input}
        value={values.birthDate}
        onChangeText={(v) => set({ birthDate: formatDateInput(v) })}
        placeholder="JJ/MM/AAAA"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        accessibilityLabel="Date de naissance"
      />

      {/* Ville de naissance */}
      <Text style={styles.label}>Ville de naissance</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]}
          value={placeQuery}
          onChangeText={setPlaceQuery}
          placeholder="Rechercher une ville…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={searchPlace}
        />
        <Pressable
          style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.7 }]}
          onPress={searchPlace}
          disabled={searching}
        >
          {searching
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.searchBtnText}>🔍</Text>
          }
        </Pressable>
      </View>

      {placeHits.length > 0 ? (
        <View style={styles.hits}>
          {placeHits.map((p) => (
            <Pressable
              key={p.label}
              style={({ pressed }) => [styles.hit, pressed && { backgroundColor: colors.primary + '22' }]}
              onPress={() => {
                set({ birthPlaceLabel: p.label, birthTimezone: p.timezone });
                setPlaceHits([]);
                setPlaceQuery('');
              }}
            >
              <Text style={styles.hitText}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {values.birthPlaceLabel ? (
        <View style={styles.selectedPlace}>
          <Text style={styles.selectedPlaceText}>📍 {values.birthPlaceLabel}</Text>
          <Text style={styles.selectedTz}>{values.birthTimezone}</Text>
        </View>
      ) : null}

      {/* Heure de naissance */}
      <Pressable
        style={styles.toggleRow}
        onPress={() => set({ birthTimeUnknown: !values.birthTimeUnknown })}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: values.birthTimeUnknown }}
      >
        <View style={[styles.checkbox, values.birthTimeUnknown && styles.checkboxOn]}>
          {values.birthTimeUnknown ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.toggleLabel}>Heure de naissance inconnue</Text>
      </Pressable>

      {!values.birthTimeUnknown ? (
        <>
          <Text style={styles.label}>Heure de naissance</Text>
          <TextInput
            style={styles.input}
            value={values.birthTime}
            onChangeText={(v) => set({ birthTime: formatTimeInput(v) })}
            placeholder="HH:mm"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            accessibilityLabel="Heure de naissance"
          />
        </>
      ) : null}

      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.scale[1],
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: spacing.scale[1],
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.secondary,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[1] + 2,
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.scale[1],
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.secondary,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 16,
  },
  hits: {
    backgroundColor: colors.surface,
    borderRadius: radius.secondary,
    overflow: 'hidden',
    marginTop: 2,
  },
  hit: {
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted + '22',
  },
  hitText: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  selectedPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '18',
    borderRadius: radius.secondary,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[1],
  },
  selectedPlaceText: {
    color: colors.primary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  selectedTz: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
    paddingVertical: spacing.scale[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  err: {
    color: colors.accent,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.scale[1],
  },
});
