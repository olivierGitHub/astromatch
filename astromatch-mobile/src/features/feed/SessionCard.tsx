import { useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { colors, radius, spacing, typography } from '../../design-system';
import { type FeedCandidateCard, type NatalPlanet, feedProfilePhotoUrl } from '../../services/api-client/feed';
import { getAccessToken } from '../../services/auth/session';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  card: FeedCandidateCard;
  onSafetyMenu?: () => void;
  onMismatch?: () => void;
};

export function SessionCard({ card, onSafetyMenu, onMismatch }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccessToken().then((t) => {
      if (!cancelled) setToken(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const photos = card.photos.length > 0 ? [...card.photos].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const firstPhoto = photos[0];
  const extraPhotos = photos.slice(1);

  const headers = token
    ? { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
    : undefined;

  return (
    <ScrollView style={styles.card} showsVerticalScrollIndicator={false} bounces={false}>
      {/* Hero — première photo plein écran */}
      <View style={styles.hero}>
        {firstPhoto && headers ? (
          <Image
            source={{ uri: feedProfilePhotoUrl(card.userId, firstPhoto.id), headers }}
            style={styles.heroImg}
            contentFit="cover"
            accessibilityLabel="Profile photo"
          />
        ) : (
          <View style={[styles.heroImg, styles.heroPlaceholder]}>
            <Text style={styles.placeholderText}>No photo yet</Text>
          </View>
        )}
        <View style={styles.heroOverlay} pointerEvents="none">
          <View style={styles.heroOverlayRow}>
            <View style={styles.heroNameBlock}>
              {card.firstName ? (
                <Text style={styles.heroName}>
                  {card.firstName}
                  {card.age > 0 ? <Text style={styles.heroAge}>,  {card.age}</Text> : null}
                </Text>
              ) : null}
              {card.localityLine ? (
                <Text style={styles.heroLocality}>📍 {card.localityLine}</Text>
              ) : null}
            </View>
            <Text style={styles.dynamicPill}>{card.suggestedDynamicTitle}</Text>
          </View>
        </View>
      </View>

      {/* Natal chart — below hero photo */}
      {card.natalChart?.length > 0 ? (
        <View style={styles.natalCard}>
          <Text style={styles.natalTitle}>✨ Thème natal</Text>
          <View style={styles.natalGrid}>
            {card.natalChart.map((p, i) => (
              <View key={i} style={styles.natalRow}>
                <Text style={styles.natalSymbol}>{p.symbol}</Text>
                <Text style={styles.natalPlanet}>{p.planet}</Text>
                <Text style={styles.natalSign}>{p.sign}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Photo 2 (beach) */}
      {extraPhotos[0] && headers ? (
        <Image
          source={{ uri: feedProfilePhotoUrl(card.userId, extraPhotos[0].id), headers }}
          style={styles.extraPhoto}
          contentFit="cover"
          accessibilityLabel="Additional photo"
        />
      ) : null}

      {/* Description — below photo 2 */}
      <View style={styles.body}>
        <Text style={styles.cosmic}>{card.cosmicContext}</Text>
        <Text style={styles.locality} accessibilityLabel="Location hint">
          {card.localityLine}
        </Text>
        {card.bioPreview ? <Text style={styles.bio}>{card.bioPreview}</Text> : null}
      </View>

      {/* Photo 3 (monument) */}
      {extraPhotos[1] && headers ? (
        <Image
          source={{ uri: feedProfilePhotoUrl(card.userId, extraPhotos[1].id), headers }}
          style={styles.extraPhoto}
          contentFit="cover"
          accessibilityLabel="Additional photo"
        />
      ) : null}

      {/* Red flags — below photo 3 */}
      {card.redFlags?.length > 0 ? (
        <View style={styles.redFlagsCard}>
          <Text style={styles.redFlagsTitle}>🚩 Top 3 red flags</Text>
          {card.redFlags.map((flag, fi) => (
            <View key={fi} style={styles.redFlagRow}>
              <Text style={styles.redFlagNumber}>{fi + 1}.</Text>
              <Text style={styles.redFlagText}>{flag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Remaining extra photos */}
      {extraPhotos.slice(2).map((p) => (
        headers ? (
          <Image
            key={p.id}
            source={{ uri: feedProfilePhotoUrl(card.userId, p.id), headers }}
            style={styles.extraPhoto}
            contentFit="cover"
            accessibilityLabel="Additional photo"
          />
        ) : null
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        {onMismatch ? (
          <Pressable
            onPress={onMismatch}
            style={({ pressed }) => [styles.actionLink, pressed && styles.actionLinkPressed]}
            accessibilityRole="button"
            accessibilityLabel="Doesn't match me"
          >
            <Text style={styles.actionLinkText}>Doesn't match me</Text>
          </Pressable>
        ) : null}
        {onSafetyMenu ? (
          <Pressable
            onPress={onSafetyMenu}
            style={({ pressed }) => [styles.actionLink, pressed && styles.actionLinkPressed]}
            accessibilityRole="button"
            accessibilityLabel="Report or block"
          >
            <Text style={styles.actionLinkText}>Report or block</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    overflow: 'hidden',
  },
  hero: {
    height: SCREEN_HEIGHT,
    position: 'relative',
    width: '100%',
    backgroundColor: colors.background,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
  },
  heroOverlay: {
    position: 'absolute',
    left: spacing.scale[2],
    right: spacing.scale[2],
    bottom: spacing.scale[2],
  },
  heroOverlayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroNameBlock: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: spacing.scale[1],
  },
  heroAge: {
    fontSize: 24,
    fontWeight: '400',
  },
  heroLocality: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dynamicPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#FFFFFF',
    paddingVertical: spacing.scale[1],
    paddingHorizontal: spacing.scale[2],
    borderRadius: radius.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    overflow: 'hidden',
  },
  body: {
    padding: spacing.scale[3],
    gap: spacing.scale[2],
  },
  cosmic: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    lineHeight: typography.bodyL.lineHeight,
    fontWeight: '500',
  },
  locality: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  bio: {
    color: colors.textMuted,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
  },
  extraPhoto: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  natalCard: {
    margin: spacing.scale[3],
    backgroundColor: colors.background,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
  },
  natalTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
    marginBottom: spacing.scale[2],
  },
  natalGrid: {
    gap: spacing.scale[1],
  },
  natalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
  },
  natalSymbol: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  natalPlanet: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    width: 72,
  },
  natalSign: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
    flex: 1,
  },
  redFlagsCard: {
    margin: spacing.scale[3],
    marginTop: spacing.scale[3],
    backgroundColor: colors.background,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
    gap: spacing.scale[2],
  },
  redFlagsTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
    marginBottom: spacing.scale[1],
  },
  redFlagRow: {
    flexDirection: 'row',
    gap: spacing.scale[2],
    alignItems: 'flex-start',
  },
  redFlagNumber: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: typography.bodyM.fontSize,
    minWidth: 18,
  },
  redFlagText: {
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.scale[3],
    paddingTop: spacing.scale[2],
    borderTopWidth: 1,
    borderTopColor: colors.textMuted + '33',
    marginTop: spacing.scale[2],
  },
  actionLink: {
    paddingVertical: spacing.scale[1],
  },
  actionLinkPressed: {
    opacity: 0.6,
  },
  actionLinkText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textDecorationLine: 'underline',
  },
});
