import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { type MatchSummary, fetchMatches } from '../../services/api-client/matches';
import { RegistrationApiError } from '../../services/api-client/types';

type Props = {
  onOpenChat: (matchId: string, otherUserId: string) => void;
};

export function MatchesScreen({ onOpenChat }: Props) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<MatchSummary[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setRows(await fetchMatches());
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? 'Could not load matches'
          : 'Could not load matches',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>{err}</Text>
        <Pressable style={styles.retry} onPress={load} accessibilityRole="button">
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No matches yet. When you and someone both like each other, they’ll show up here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.matchId}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => onOpenChat(item.matchId, item.otherUserId)}
          accessibilityRole="button"
          accessibilityLabel={`Open chat with ${item.otherEmail}`}
        >
          <Text style={styles.rowTitle}>{item.otherEmail}</Text>
          <Text style={styles.rowHint}>Tap to chat</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.scale[3],
  },
  list: {
    paddingBottom: spacing.scale[4],
  },
  err: {
    color: colors.textMuted,
    marginBottom: spacing.scale[2],
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'center',
    padding: spacing.scale[2],
  },
  retryText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    textAlign: 'center',
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
    marginBottom: spacing.scale[2],
  },
  pressed: {
    opacity: 0.88,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '600',
  },
  rowHint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.scale[1],
  },
});
