import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageURISource,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';
import { type FeedCandidateCard, feedProfilePhotoUrl } from '../../services/api-client/feed';
import { getAccessToken } from '../../services/auth/session';

type Props = {
  card: FeedCandidateCard;
};

export function SessionCard({ card }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
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

  useEffect(() => {
    setPhotoIndex(0);
  }, [card.userId]);

  const photos = card.photos.length > 0 ? [...card.photos].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const current = photos[photoIndex];

  const uriSource: ImageURISource | null =
    current && token
      ? {
          uri: feedProfilePhotoUrl(card.userId, current.id),
          headers: { Authorization: `Bearer ${token}` },
        }
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.hero}>
        {uriSource ? (
          <Image source={uriSource} style={styles.heroImg} resizeMode="cover" accessibilityLabel="Profile photo" />
        ) : (
          <View style={[styles.heroImg, styles.heroPlaceholder]}>
            <Text style={styles.placeholderText}>No photo yet</Text>
          </View>
        )}
        <View style={styles.heroOverlay} pointerEvents="none">
          <Text style={styles.dynamicPill}>{card.suggestedDynamicTitle}</Text>
        </View>
      </View>

      {photos.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
          accessibilityLabel="Photo carousel"
        >
          {photos.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => setPhotoIndex(i)}
              style={[styles.thumbWrap, i === photoIndex && styles.thumbActive]}
              accessibilityRole="button"
              accessibilityLabel={`Photo ${i + 1} of ${photos.length}`}
            >
              {token ? (
                <Image
                  source={{
                    uri: feedProfilePhotoUrl(card.userId, p.id),
                    headers: { Authorization: `Bearer ${token}` },
                  }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.body}>
        <Text style={styles.cosmic}>{card.cosmicContext}</Text>
        <Text style={styles.locality} accessibilityLabel="Location hint">
          {card.localityLine}
        </Text>
        {card.bioPreview ? <Text style={styles.bio}>{card.bioPreview}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    overflow: 'hidden',
    marginBottom: spacing.scale[3],
  },
  hero: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
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
  dynamicPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: colors.textPrimary,
    paddingVertical: spacing.scale[1],
    paddingHorizontal: spacing.scale[2],
    borderRadius: radius.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    overflow: 'hidden',
  },
  thumbRow: {
    gap: spacing.scale[1],
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[2],
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.primary,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: colors.secondary,
  },
  thumb: {
    width: '100%',
    height: '100%',
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
});
