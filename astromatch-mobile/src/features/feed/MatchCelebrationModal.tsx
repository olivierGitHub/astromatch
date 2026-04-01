import { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { colors, radius, spacing, typography } from '../../design-system';
import { apiUrl } from '../../services/api-client/api-base';
import { matchProfilePhotoUrl } from '../../services/api-client/matches';
import { getAccessToken } from '../../services/auth/session';
import type { MatchCreated } from '../../services/api-client/feed';
import { useState } from 'react';

const { width: SCREEN_W } = Dimensions.get('window');
const PHOTO_SIZE = 130;
const BADGE_SIZE = 40;
const STAR_COUNT = 22;

type StarConfig = {
  x: number;
  y: number;
  size: number;
  delay: number;
  symbol: string;
};

const STAR_SYMBOLS = ['✦', '✧', '⋆', '·', '✦', '✧', '⋆', '·', '★', '☆'];

function makeStar(i: number): StarConfig {
  return {
    x: Math.random() * SCREEN_W,
    y: Math.random() * 500 + 100,
    size: Math.random() * 6 + 3,
    delay: Math.random() * 1200,
    symbol: STAR_SYMBOLS[i % STAR_SYMBOLS.length],
  };
}

function StarParticle({ config, visible }: { config: StarConfig; visible: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) { anim.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200 + Math.random() * 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1, 0.8, 0] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] });

  return (
    <Animated.Text
      style={[
        styles.star,
        {
          left: config.x,
          top: config.y,
          fontSize: config.size,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {config.symbol}
    </Animated.Text>
  );
}

type Props = {
  visible: boolean;
  match: MatchCreated | null;
  onContinue: () => void;
  onChat: () => void;
};

export function MatchCelebrationModal({ visible, match, onContinue, onChat }: Props) {
  const stars = useMemo(() => Array.from({ length: STAR_COUNT }, (_, i) => makeStar(i)), []);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const photosAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then(setToken);
  }, []);

  useEffect(() => {
    if (!visible) {
      titleAnim.setValue(0);
      photosAnim.setValue(0);
      actionsAnim.setValue(0);
      heartAnim.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(photosAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const heartLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, { toValue: 1.22, duration: 480, useNativeDriver: true }),
        Animated.timing(heartAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    );
    const t = setTimeout(() => heartLoop.start(), 900);
    return () => { clearTimeout(t); heartLoop.stop(); };
  }, [visible]);

  const titleScale = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const titleOpacity = titleAnim;

  const myPhotoTranslateX = photosAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] });
  const otherPhotoTranslateX = photosAnim.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });
  const photosOpacity = photosAnim;

  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
    : undefined;

  const myPhotoUri =
    match?.myFirstPhotoId
      ? apiUrl(`/api/v1/me/profile/photos/${match.myFirstPhotoId}`)
      : null;

  const otherPhotoUri =
    match?.otherFirstPhotoId && match?.otherUserId
      ? matchProfilePhotoUrl(match.otherUserId, match.otherFirstPhotoId)
      : null;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent accessibilityViewIsModal>
      <View style={styles.backdrop} pointerEvents="box-none">
        {/* Particle stars */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {stars.map((s, i) => (
            <StarParticle key={i} config={s} visible={visible} />
          ))}
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Animated.View style={{ opacity: titleOpacity, transform: [{ scale: titleScale }] }}>
            <Text style={styles.superTitle}>✨</Text>
            <Text style={styles.title}>C'est un match !</Text>
            <Text style={styles.sub}>Vous vous êtes choisi·es mutuellement.</Text>
          </Animated.View>

          {/* Photos */}
          <Animated.View style={[styles.photosRow, { opacity: photosOpacity }]}>
            {/* My photo */}
            <Animated.View style={{ transform: [{ translateX: myPhotoTranslateX }] }}>
              <View style={styles.photoWrapper}>
                {myPhotoUri && authHeaders ? (
                  <Image
                    source={{ uri: myPhotoUri, headers: authHeaders }}
                    style={styles.photo}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]}>
                    <Text style={styles.photoInitial}>Moi</Text>
                  </View>
                )}
                {match?.mySunSign ? (
                  <View style={[styles.signBadge, styles.signBadgeLeft]}>
                    <Text style={styles.signSymbol}>{match.mySunSign}</Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>

            {/* Heart */}
            <Animated.Text style={[styles.heart, { transform: [{ scale: heartAnim }] }]}>
              💜
            </Animated.Text>

            {/* Other photo */}
            <Animated.View style={{ transform: [{ translateX: otherPhotoTranslateX }] }}>
              <View style={styles.photoWrapper}>
                {otherPhotoUri && authHeaders ? (
                  <Image
                    source={{ uri: otherPhotoUri, headers: authHeaders }}
                    style={styles.photo}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]}>
                    <Text style={styles.photoInitial}>?</Text>
                  </View>
                )}
                {match?.otherSunSign ? (
                  <View style={[styles.signBadge, styles.signBadgeRight]}>
                    <Text style={styles.signSymbol}>{match.otherSunSign}</Text>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[styles.actions, { opacity: actionsAnim }]}>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Continuer d'explorer"
            >
              <Text style={styles.secondaryText}>Continuer d'explorer</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              onPress={onChat}
              accessibilityRole="button"
              accessibilityLabel="Envoyer un message"
            >
              <Text style={styles.primaryText}>Envoyer un message 💌</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,6,28,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
    color: '#c8b8ff',
  },
  content: {
    width: '88%',
    alignItems: 'center',
    gap: spacing.scale[4],
  },
  superTitle: {
    textAlign: 'center',
    fontSize: 40,
  },
  title: {
    color: '#fff',
    fontSize: typography.h1.fontSize,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: typography.bodyM.fontSize,
    textAlign: 'center',
    marginTop: 6,
  },
  photosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[3],
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photoPlaceholder: {
    backgroundColor: colors.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: {
    color: '#fff',
    fontSize: typography.bodyM.fontSize,
    fontWeight: '700',
  },
  signBadge: {
    position: 'absolute',
    bottom: 2,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: 'rgba(8,6,28,0.88)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signBadgeLeft: {
    right: -4,
  },
  signBadgeRight: {
    left: -4,
  },
  signSymbol: {
    fontSize: 20,
    color: '#fff',
  },
  heart: {
    fontSize: 32,
  },
  actions: {
    width: '100%',
    gap: spacing.scale[2],
  },
  primary: {
    minHeight: 52,
    borderRadius: radius.primary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.scale[3],
  },
  secondary: {
    minHeight: 52,
    borderRadius: radius.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.bodyL.fontSize,
  },
  secondaryText: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    fontSize: typography.bodyL.fontSize,
  },
});
