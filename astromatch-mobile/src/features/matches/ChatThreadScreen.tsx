import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { fetchMessages, sendMessage, type ChatMessage } from '../../services/api-client/matches';
import { blockUser, submitSafetyReport } from '../../services/api-client/safety';
import { RegistrationApiError } from '../../services/api-client/types';
import { fetchMe } from '../../services/api-client/me';

type Props = {
  matchId: string;
  otherUserId: string;
  onBack: () => void;
};

export function ChatThreadScreen({ matchId, otherUserId, onBack }: Props) {
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    fetchMe()
      .then((m) => setMyId(m.userId))
      .catch(() => setMyId(null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setItems(await fetchMessages(matchId));
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? 'Could not load messages'
          : 'Could not load messages',
      );
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    load();
  }, [load]);

  const safetyMenu = () => {
    Alert.alert('Safety', 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        onPress: () => {
          Alert.alert('Report', 'Select a reason', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Harassment',
              onPress: async () => {
                try {
                  await submitSafetyReport(otherUserId, 'CHAT', 'HARASSMENT');
                  Alert.alert('Thanks', 'We received your report.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not send report', msg);
                }
              },
            },
            {
              text: 'Spam or fake',
              onPress: async () => {
                try {
                  await submitSafetyReport(otherUserId, 'CHAT', 'SPAM');
                  Alert.alert('Thanks', 'We received your report.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not send report', msg);
                }
              },
            },
          ]);
        },
      },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Block this person?', 'You will not be able to message each other.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: async () => {
                try {
                  await blockUser(otherUserId);
                  onBack();
                  Alert.alert('Blocked', 'This conversation is closed.');
                } catch (e) {
                  const msg =
                    e instanceof RegistrationApiError
                      ? e.envelope.error?.message ?? 'Try again.'
                      : 'Try again.';
                  Alert.alert('Could not block', msg);
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  const onSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(matchId, text);
      setDraft('');
      setItems((prev) => [...prev, msg]);
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? 'Send failed'
          : 'Send failed',
      );
    } finally {
      setSending(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Pressable onPress={safetyMenu} accessibilityRole="button" accessibilityLabel="Safety options">
          <Text style={styles.safetyBtn}>⋯</Text>
        </Pressable>
      </View>
      {err ? <Text style={styles.banner}>{err}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = myId != null && item.senderId === myId;
          return (
            <View style={[styles.bubbleWrap, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <View style={[styles.bubble, mine ? styles.bubbleBgMine : styles.bubbleBgTheirs]}>
                <Text style={styles.bubbleText}>{item.body}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={4000}
          accessibilityLabel="Message text"
        />
        <Pressable
          style={({ pressed }) => [styles.send, pressed && styles.sendPressed, sending && styles.sendDisabled]}
          onPress={onSend}
          disabled={sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {sending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.scale[2],
  },
  back: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: typography.bodyM.fontSize,
  },
  safetyBtn: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: spacing.scale[2],
  },
  banner: {
    color: colors.accent,
    marginBottom: spacing.scale[2],
    fontSize: typography.caption.fontSize,
  },
  list: {
    paddingBottom: spacing.scale[4],
    flexGrow: 1,
  },
  bubbleWrap: {
    marginBottom: spacing.scale[2],
    maxWidth: '88%',
  },
  bubbleMine: {
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: radius.primary,
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
  },
  bubbleBgMine: {
    backgroundColor: colors.secondary,
  },
  bubbleBgTheirs: {
    backgroundColor: colors.surface,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.scale[2],
    paddingTop: spacing.scale[2],
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[2],
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  send: {
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.primary,
    paddingHorizontal: spacing.scale[2],
  },
  sendPressed: {
    opacity: 0.9,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
