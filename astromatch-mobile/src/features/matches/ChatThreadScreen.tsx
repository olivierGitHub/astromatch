import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  type KeyboardEvent,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../../design-system';
import {
  fetchMessages,
  matchMessageAudioUrl,
  matchMessageImageUrl,
  matchProfilePhotoUrl,
  sendImageMessage,
  sendMessage,
  sendVoiceMessage,
  type ChatMessage,
} from '../../services/api-client/matches';
import { type FeedCandidateCard, fetchFeedProfile } from '../../services/api-client/feed';
import { blockUser, submitSafetyReport } from '../../services/api-client/safety';
import { RegistrationApiError } from '../../services/api-client/types';
import { fetchMe } from '../../services/api-client/me';
import { getAccessToken } from '../../services/auth/session';
import { SessionCard } from '../feed/SessionCard';

const HEADER_AVATAR = 200;

function formatVoiceDuration(ms: number | null): string {
  if (ms == null || ms <= 0 || Number.isNaN(ms)) return '—:—';
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Temps restant pendant la lecture (style WhatsApp). */
function formatRemainingMs(positionMs: number, durationMs: number): string {
  if (durationMs <= 0 || Number.isNaN(durationMs)) return '—:—';
  const leftMs = Math.max(0, durationMs - positionMs);
  const totalSec = Math.ceil(leftMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Marge basse au-dessus du clavier (barre de suggestions / IME). */
const KEYBOARD_ACCESSORY_FUDGE_PX = 12;

type KeyboardFrame = { height: number; screenY: number };

/**
 * Hauteur réelle masquée en bas : `height` seul exclut souvent la barre de suggestions.
 * `windowH - screenY` = zone IME du haut du clavier jusqu’en bas de la fenêtre.
 */
function inferKeyboardBottomInset(coords: KeyboardFrame, windowHeight: number): number {
  const { height, screenY } = coords;
  let fromTop = 0;
  if (typeof screenY === 'number' && screenY > 0 && screenY < windowHeight - 1) {
    fromTop = windowHeight - screenY;
  }
  return Math.ceil(Math.max(height, fromTop, 0));
}

type Props = {
  matchId: string;
  otherUserId: string;
  onBack: () => void;
};

export function ChatThreadScreen({ matchId, otherUserId, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [myId, setMyId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [peerCard, setPeerCard] = useState<FeedCandidateCard | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSending, setVoiceSending] = useState(false);
  const [imageSending, setImageSending] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [voicePlayback, setVoicePlayback] = useState({ positionMs: 0, durationMs: 0 });
  /** Hauteur clavier (padding bas) — évite KeyboardAvoidingView + FlatList + SafeArea. */
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const playbackRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const keyboardRecalcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchMe()
      .then((m) => setMyId(m.userId))
      .catch(() => setMyId(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    getAccessToken().then((t) => {
      if (!cancelled) setToken(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [msgs, profile] = await Promise.all([
        fetchMessages(matchId),
        fetchFeedProfile(otherUserId).catch(() => null),
      ]);
      setItems(msgs);
      setPeerCard(profile);
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? 'Could not load messages'
          : 'Could not load messages',
      );
    } finally {
      setLoading(false);
    }
  }, [matchId, otherUserId]);

  useEffect(() => {
    load();
  }, [load]);

  /** À l’ouverture (ou changement de match), afficher le bas de fil = derniers messages. */
  useEffect(() => {
    if (loading) return;
    const scrollEnd = () => listRef.current?.scrollToEnd({ animated: false });
    const raf = requestAnimationFrame(scrollEnd);
    const t = setTimeout(scrollEnd, 200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [loading, matchId]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const mergeInset = (coords: KeyboardFrame) => {
      const fromEvent = inferKeyboardBottomInset(coords, windowHeight);
      const metrics = Keyboard.metrics();
      const fromMetrics =
        metrics != null ? inferKeyboardBottomInset(metrics, windowHeight) : 0;
      return Math.max(fromEvent, fromMetrics, 0) + KEYBOARD_ACCESSORY_FUDGE_PX;
    };

    const applyKeyboardMetrics = (e: KeyboardEvent) => {
      setKeyboardBottomInset(mergeInset(e.endCoordinates));
      if (Platform.OS === 'android') {
        if (keyboardRecalcTimeoutRef.current) clearTimeout(keyboardRecalcTimeoutRef.current);
        keyboardRecalcTimeoutRef.current = setTimeout(() => {
          keyboardRecalcTimeoutRef.current = null;
          const m = Keyboard.metrics();
          if (m) setKeyboardBottomInset((prev) => Math.max(prev, mergeInset(m)));
        }, 120);
      }
    };

    const onHide = () => {
      if (keyboardRecalcTimeoutRef.current) {
        clearTimeout(keyboardRecalcTimeoutRef.current);
        keyboardRecalcTimeoutRef.current = null;
      }
      setKeyboardBottomInset(0);
    };

    const subShow = Keyboard.addListener(showEvt, applyKeyboardMetrics);
    const subFrame = Keyboard.addListener('keyboardDidChangeFrame', applyKeyboardMetrics);
    const subHide = Keyboard.addListener(hideEvt, onHide);

    return () => {
      if (keyboardRecalcTimeoutRef.current) clearTimeout(keyboardRecalcTimeoutRef.current);
      subShow.remove();
      subFrame.remove();
      subHide.remove();
    };
  }, [windowHeight]);

  useEffect(() => {
    return () => {
      void (async () => {
        const rec = recordingRef.current;
        if (rec) {
          try {
            await rec.stopAndUnloadAsync();
          } catch {
            /* ignore */
          }
          recordingRef.current = null;
        }
        const snd = playbackRef.current;
        if (snd) {
          try {
            await snd.unloadAsync();
          } catch {
            /* ignore */
          }
          playbackRef.current = null;
        }
      })();
    };
  }, []);

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

  const openPeerProfile = async () => {
    if (peerCard) {
      setProfileOpen(true);
      return;
    }
    setProfileLoading(true);
    setProfileOpen(true);
    try {
      const card = await fetchFeedProfile(otherUserId);
      setPeerCard(card);
    } catch {
      // leave peerCard null; modal shows error
    } finally {
      setProfileLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    if (sending || voiceSending || imageSending || isRecording) return;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone', "L'accès au micro est nécessaire pour envoyer un message vocal.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setIsRecording(true);
    } catch {
      Alert.alert('Enregistrement', "Impossible de démarrer l'enregistrement.");
    }
  };

  const stopVoiceRecordingAndSend = async () => {
    const rec = recordingRef.current;
    if (!rec || !isRecording) return;
    recordingRef.current = null;
    setIsRecording(false);
    setVoiceSending(true);
    setErr(null);
    try {
      const statusBefore = await rec.getStatusAsync();
      const durationMs =
        statusBefore.isRecording && typeof statusBefore.durationMillis === 'number'
          ? statusBefore.durationMillis
          : 0;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) {
        throw new Error('no uri');
      }
      const msg = await sendVoiceMessage(
        matchId,
        { uri, name: 'voice.m4a', type: 'audio/mp4' },
        durationMs,
      );
      setItems((prev) => [...prev, msg]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      setErr(
        e instanceof RegistrationApiError
          ? e.envelope.error?.message ?? "Envoi du vocal impossible"
          : "Envoi du vocal impossible",
      );
    } finally {
      setVoiceSending(false);
    }
  };

  const onMicPress = () => {
    if (voiceSending || imageSending) return;
    if (isRecording) {
      void stopVoiceRecordingAndSend();
    } else {
      void startVoiceRecording();
    }
  };

  const onPickImage = async () => {
    if (sending || voiceSending || imageSending || isRecording) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos', "L'accès à la galerie est nécessaire pour envoyer une image.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uri = asset.uri;
      const name = asset.fileName ?? 'photo.jpg';
      const mime = asset.mimeType ?? 'image/jpeg';
      setImageSending(true);
      setErr(null);
      try {
        const msg = await sendImageMessage(matchId, { uri, name, type: mime });
        setItems((prev) => [...prev, msg]);
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      } catch (e) {
        setErr(
          e instanceof RegistrationApiError
            ? e.envelope.error?.message ?? "Envoi de l'image impossible"
            : "Envoi de l'image impossible",
        );
      } finally {
        setImageSending(false);
      }
    } catch {
      Alert.alert('Image', "Impossible d'ouvrir la galerie.");
    }
  };

  const toggleVoicePlayback = async (msg: ChatMessage) => {
    if (msg.kind !== 'AUDIO' || !token) return;
    try {
      if (playingMessageId === msg.id) {
        const snd = playbackRef.current;
        if (snd) {
          await snd.stopAsync();
          await snd.unloadAsync();
          playbackRef.current = null;
        }
        setPlayingMessageId(null);
        setVoicePlayback({ positionMs: 0, durationMs: 0 });
        return;
      }
      const prev = playbackRef.current;
      if (prev) {
        try {
          await prev.unloadAsync();
        } catch {
          /* ignore */
        }
        playbackRef.current = null;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const uri = matchMessageAudioUrl(matchId, msg.id);
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      };
      setVoicePlayback({
        positionMs: 0,
        durationMs: msg.audioDurationMs != null && msg.audioDurationMs > 0 ? msg.audioDurationMs : 0,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri, headers: authHeaders },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (playbackRef.current !== sound) return;
          const pos = status.positionMillis ?? 0;
          const durFromFile = status.durationMillis ?? 0;
          setVoicePlayback((prev) => {
            const dur = durFromFile > 0 ? durFromFile : prev.durationMs;
            return { positionMs: pos, durationMs: dur };
          });
          if (status.didJustFinish) {
            void (async () => {
              try {
                await sound.unloadAsync();
              } catch {
                /* ignore */
              }
              if (playbackRef.current === sound) {
                playbackRef.current = null;
              }
              setVoicePlayback({ positionMs: 0, durationMs: 0 });
              setPlayingMessageId((id) => (id === msg.id ? null : id));
            })();
          }
        },
      );
      await sound.setProgressUpdateIntervalAsync(50);
      playbackRef.current = sound;
      setPlayingMessageId(msg.id);
    } catch {
      Alert.alert('Lecture', 'Impossible de lire ce message vocal.');
      setPlayingMessageId(null);
      setVoicePlayback({ positionMs: 0, durationMs: 0 });
    }
  };

  const onSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(matchId, text);
      setDraft('');
      setItems((prev) => [...prev, msg]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
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

  const headers = token
    ? { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
    : undefined;
  const sortedPhotos =
    peerCard && peerCard.photos.length > 0
      ? [...peerCard.photos].sort((a, b) => a.sortOrder - b.sortOrder)
      : [];
  const firstPhoto = sortedPhotos[0];
  const displayName = peerCard?.firstName?.trim() || 'Profil';
  const displayAge = peerCard != null && peerCard.age > 0 ? peerCard.age : null;

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
      <Modal
        visible={profileOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setProfileOpen(false)}
      >
        <View style={styles.profileModal}>
          <Pressable style={styles.profileClose} onPress={() => setProfileOpen(false)}>
            <Text style={styles.profileCloseText}>✕ Fermer</Text>
          </Pressable>
          {profileLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.secondary} />
            </View>
          ) : peerCard ? (
            <ScrollView contentContainerStyle={styles.profileScroll}>
              <SessionCard
                card={peerCard}
                useMatchPhotoUrls
                onSafetyMenu={() => {}}
                onMismatch={() => {}}
              />
            </ScrollView>
          ) : (
            <View style={[styles.center, styles.profileErrorWrap]}>
              <Text style={styles.profileErrorText}>Impossible de charger le profil.</Text>
            </View>
          )}
        </View>
      </Modal>
      {err ? <Text style={styles.banner}>{err}</Text> : null}
      <View
        style={[
          styles.keyboardShell,
          {
            paddingBottom:
              keyboardBottomInset > 0 ? keyboardBottomInset : Math.max(insets.bottom, spacing.scale[2]),
          },
        ]}
      >
        <FlatList
          ref={listRef}
          style={styles.listFlex}
          data={items}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
          <View style={styles.peerHeader}>
            <Pressable
              onPress={openPeerProfile}
              accessibilityRole="button"
              accessibilityLabel={`Voir le profil de ${displayName}`}
              style={({ pressed }) => [styles.avatarPressable, pressed && styles.avatarPressed]}
            >
              {firstPhoto && headers ? (
                <Image
                  source={{ uri: matchProfilePhotoUrl(otherUserId, firstPhoto.id), headers }}
                  style={styles.peerAvatar}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={styles.peerAvatarPlaceholder}>
                  <Text style={styles.peerAvatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </Pressable>
            <Text style={styles.peerNameLine}>
              {displayName}
              {displayAge != null ? <Text style={styles.peerAge}>, {displayAge}</Text> : null}
            </Text>
          </View>
          }
          renderItem={({ item }) => {
          const mine = myId != null && item.senderId === myId;
          if (item.kind === 'AUDIO') {
            const isThisPlaying = playingMessageId === item.id;
            const durMs =
              isThisPlaying && voicePlayback.durationMs > 0
                ? voicePlayback.durationMs
                : item.audioDurationMs ?? 0;
            const posMs = isThisPlaying ? voicePlayback.positionMs : 0;
            const progress = durMs > 0 ? Math.min(1, posMs / durMs) : 0;
            const pct = Math.round(progress * 1000) / 10;
            return (
              <View style={[styles.bubbleWrap, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Pressable
                  onPress={() => void toggleVoicePlayback(item)}
                  style={({ pressed }) => [
                    styles.voiceBubble,
                    mine ? styles.bubbleBgMine : styles.bubbleBgTheirs,
                    pressed && styles.voiceBubblePressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    playingMessageId === item.id ? 'Pause message vocal' : 'Lire message vocal'
                  }
                >
                  <Ionicons
                    name={playingMessageId === item.id ? 'pause' : 'play'}
                    size={22}
                    color={colors.textPrimary}
                  />
                  <View style={styles.voiceMid}>
                    <View
                      style={[
                        styles.voiceTrack,
                        mine ? styles.voiceTrackMine : styles.voiceTrackTheirs,
                      ]}
                    >
                      <View
                        style={[
                          styles.voiceTrackFill,
                          mine ? styles.voiceTrackFillMine : styles.voiceTrackFillTheirs,
                          { width: `${pct}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.voiceDuration}>
                    {isThisPlaying
                      ? formatRemainingMs(posMs, durMs > 0 ? durMs : item.audioDurationMs ?? 0)
                      : formatVoiceDuration(item.audioDurationMs)}
                  </Text>
                </Pressable>
              </View>
            );
          }
          if (item.kind === 'IMAGE') {
            return (
              <View style={[styles.bubbleWrap, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <View style={[styles.imageBubble, mine ? styles.bubbleBgMine : styles.bubbleBgTheirs]}>
                  {headers ? (
                    <Image
                      source={{
                        uri: matchMessageImageUrl(matchId, item.id),
                        headers,
                      }}
                      style={styles.chatImage}
                      contentFit="cover"
                      accessibilityLabel="Image dans la conversation"
                    />
                  ) : (
                    <View style={[styles.chatImage, styles.chatImagePlaceholder]}>
                      <ActivityIndicator color={colors.secondary} />
                    </View>
                  )}
                </View>
              </View>
            );
          }
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
        <Pressable
          onPress={() => void onPickImage()}
          disabled={sending || voiceSending || imageSending || isRecording}
          style={({ pressed }) => [
            styles.attachBtn,
            pressed && styles.micBtnPressed,
            (sending || voiceSending || imageSending || isRecording) && styles.sendDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Envoyer une image depuis la galerie"
        >
          {imageSending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Ionicons name="image-outline" size={24} color={colors.textPrimary} />
          )}
        </Pressable>
        <Pressable
          onPress={onMicPress}
          disabled={sending || voiceSending || imageSending}
          style={({ pressed }) => [
            styles.micBtn,
            isRecording && styles.micBtnRecording,
            pressed && styles.micBtnPressed,
            (sending || voiceSending || imageSending) && styles.sendDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? 'Arrêter et envoyer le vocal' : 'Enregistrer un message vocal'}
        >
          {voiceSending ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color={colors.textPrimary} />
          )}
        </Pressable>
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
          disabled={sending || isRecording || imageSending}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.scale[2],
  },
  keyboardShell: {
    flex: 1,
  },
  listFlex: {
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
  peerHeader: {
    alignItems: 'center',
    paddingBottom: spacing.scale[3],
    gap: spacing.scale[2],
  },
  avatarPressable: {
    borderRadius: HEADER_AVATAR / 2,
    overflow: 'hidden',
  },
  avatarPressed: {
    opacity: 0.85,
  },
  peerAvatar: {
    width: HEADER_AVATAR,
    height: HEADER_AVATAR,
    borderRadius: HEADER_AVATAR / 2,
  },
  peerAvatarPlaceholder: {
    width: HEADER_AVATAR,
    height: HEADER_AVATAR,
    borderRadius: HEADER_AVATAR / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerAvatarInitial: {
    color: colors.textPrimary,
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
  },
  peerNameLine: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  peerAge: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  profileModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileClose: {
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
    alignSelf: 'flex-start',
  },
  profileCloseText: {
    color: colors.primary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  profileScroll: {
    paddingBottom: spacing.scale[5],
  },
  profileErrorWrap: {
    paddingHorizontal: spacing.scale[4],
  },
  profileErrorText: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    textAlign: 'center',
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
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
    borderRadius: radius.primary,
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
    minWidth: 200,
    maxWidth: '100%',
  },
  voiceBubblePressed: {
    opacity: 0.88,
  },
  voiceMid: {
    flex: 1,
    minWidth: 72,
    minHeight: 22,
    justifyContent: 'center',
  },
  voiceTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  voiceTrackMine: {
    backgroundColor: 'rgba(15,16,32,0.22)',
  },
  voiceTrackTheirs: {
    backgroundColor: 'rgba(15,16,32,0.12)',
  },
  voiceTrackFill: {
    height: '100%',
    borderRadius: 2,
  },
  voiceTrackFillMine: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  voiceTrackFillTheirs: {
    backgroundColor: colors.secondary,
  },
  voiceDuration: {
    color: colors.textPrimary,
    fontSize: typography.caption.fontSize,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  imageBubble: {
    borderRadius: radius.primary,
    overflow: 'hidden',
    maxWidth: 280,
  },
  chatImage: {
    width: 260,
    height: 220,
    backgroundColor: colors.surface,
  },
  chatImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
  },
  micBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
  },
  micBtnRecording: {
    backgroundColor: colors.accent + '44',
  },
  micBtnPressed: {
    opacity: 0.85,
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
