import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { colors, radius, spacing, typography } from '../../design-system';
import { SessionCard } from '../feed/SessionCard';
import { BirthForm, type BirthValues, formatDateForDisplay, parseDateForApi } from './BirthForm';
import { getAccessToken } from '../../services/auth/session';
import { apiUrl } from '../../services/api-client/api-base';
import { type FeedCandidateCard, fetchMyPreviewCard } from '../../services/api-client/feed';
import {
  type MyPhotoDto,
  fetchMyPhotos,
  fetchMyProfile,
  uploadProfilePhotoAndGetId,
  deleteProfilePhoto,
  reorderProfilePhotos,
  putBio,
  putBirthProfile,
  putRedFlags,
} from '../../services/api-client/profile-onboarding';

const MAX_PHOTOS = 6;
const SCREEN_W = Dimensions.get('window').width;
const GRID_PADDING = spacing.scale[3];
const CELL_GAP = spacing.scale[2];
const CELL_SIZE = (SCREEN_W - GRID_PADDING * 2 - CELL_GAP * 2) / 3;
const CELL_H = CELL_SIZE * 1.25;

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type Props = {
  tab: 'edit' | 'account';
  onTabChange: (tab: 'edit' | 'account') => void;
  accountContent: React.ReactNode;
};

export function ProfileScreen({ tab, onTabChange, accountContent }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tabBtn, tab === 'edit' && styles.tabBtnActive]}
          onPress={() => onTabChange('edit')}
        >
          <Text style={[styles.tabLabel, tab === 'edit' && styles.tabLabelActive]}>
            Modifier le profil
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === 'account' && styles.tabBtnActive]}
          onPress={() => onTabChange('account')}
        >
          <Text style={[styles.tabLabel, tab === 'account' && styles.tabLabelActive]}>
            Mon compte
          </Text>
        </Pressable>
      </View>

      {tab === 'edit' ? <EditProfileTab /> : <View style={styles.fill}>{accountContent}</View>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Edit tab — preview mode + form mode
// ---------------------------------------------------------------------------

function EditProfileTab() {
  const [mode, setMode] = useState<'preview' | 'form'>('preview');
  const [previewCard, setPreviewCard] = useState<FeedCandidateCard | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const card = await fetchMyPreviewCard();
      setPreviewCard(card);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger le profil.');
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => { loadPreview(); }, [loadPreview]);

  // Reload preview after returning from form
  const handleBackFromForm = useCallback(() => {
    setMode('preview');
    loadPreview();
  }, [loadPreview]);

  if (mode === 'form') {
    return <EditForm onBack={handleBackFromForm} />;
  }

  if (previewLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.fill}>
      {previewCard ? (
        <SessionCard card={previewCard} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.hint}>Aucun profil à afficher</Text>
        </View>
      )}
      {/* Floating edit button */}
      <Pressable
        style={({ pressed }) => [styles.editFab, pressed && styles.editFabPressed]}
        onPress={() => setMode('form')}
      >
        <Text style={styles.editFabText}>✏️  Modifier</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Edit form (photos + bio + red flags)
// ---------------------------------------------------------------------------

function EditForm({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<MyPhotoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Bio
  const [bio, setBio] = useState('');
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);

  // Red flags
  const [flags, setFlags] = useState<string[]>([]);
  const [flagsSaving, setFlagsSaving] = useState(false);
  const [flagsSaved, setFlagsSaved] = useState(false);

  // Birth
  const [birth, setBirth] = useState<BirthValues>({
    birthDate: '',
    birthTimeUnknown: true,
    birthTime: '',
    birthPlaceLabel: '',
    birthTimezone: '',
  });
  const [birthSaving, setBirthSaving] = useState(false);
  const [birthSaved, setBirthSaved] = useState(false);
  const [birthError, setBirthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccessToken().then((t) => { if (!cancelled) setToken(t); });
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, profile] = await Promise.all([fetchMyPhotos(), fetchMyProfile()]);
      if (list) setPhotos(list.sort((a, b) => a.sortOrder - b.sortOrder));
      if (profile) {
        setBio(profile.bio ?? '');
        setFlags(profile.redFlags ?? []);
        setBirth({
          birthDate: formatDateForDisplay(profile.birthDate),
          birthTimeUnknown: profile.birthTimeUnknown ?? true,
          birthTime: profile.birthTime ? profile.birthTime.substring(0, 5) : '',
          birthPlaceLabel: profile.birthPlaceLabel ?? '',
          birthTimezone: profile.birthTimezone ?? '',
        });
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    try {
      const dto = await uploadProfilePhotoAndGetId(result.assets[0].uri);
      setPhotos((prev) => [...prev, dto].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Upload échoué.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProfilePhoto(photoId);
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
          } catch {
            Alert.alert('Erreur', 'Suppression échouée.');
          }
        },
      },
    ]);
  };

  const handleReorder = useCallback((next: MyPhotoDto[]) => {
    setPhotos(next);
    reorderProfilePhotos(next.map((p) => p.id)).catch(() => {});
  }, []);

  const saveBio = async () => {
    setBioSaving(true);
    try {
      await putBio(bio);
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2000);
    } catch {
      Alert.alert('Erreur', 'Sauvegarde de la description échouée.');
    } finally {
      setBioSaving(false);
    }
  };

  const saveBirth = async () => {
    setBirthError(null);
    const dateForApi = parseDateForApi(birth.birthDate);
    if (!dateForApi) {
      setBirthError('Date invalide — format JJ/MM/AAAA attendu.');
      return;
    }
    if (!birth.birthPlaceLabel.trim()) {
      setBirthError('Ville de naissance requise.');
      return;
    }
    if (!birth.birthTimeUnknown && !birth.birthTime.trim()) {
      setBirthError('Heure requise ou coche « inconnue ».');
      return;
    }
    setBirthSaving(true);
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
      setBirthSaved(true);
      setTimeout(() => setBirthSaved(false), 2000);
    } catch {
      setBirthError('Sauvegarde échouée.');
    } finally {
      setBirthSaving(false);
    }
  };

  const saveFlags = async () => {
    const trimmed = flags.map((f) => f.trim()).filter(Boolean);
    setFlagsSaving(true);
    try {
      await putRedFlags(trimmed);
      setFlags(trimmed);
      setFlagsSaved(true);
      setTimeout(() => setFlagsSaved(false), 2000);
    } catch {
      Alert.alert('Erreur', 'Sauvegarde des red flags échouée.');
    } finally {
      setFlagsSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  const headers = token
    ? { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
    : undefined;

  return (
    <View style={styles.fill}>
      {/* Form header */}
      <View style={styles.formHeader}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={onBack}
          hitSlop={8}
        >
          <Text style={styles.backBtnText}>← Retour</Text>
        </Pressable>
        <Text style={styles.formHeaderTitle}>Modifier le profil</Text>
        <View style={{ width: 80 }} />
      </View>

    <ScrollView style={styles.fill} contentContainerStyle={styles.editContent} showsVerticalScrollIndicator={false}>

      {/* Photos */}
      <Text style={styles.sectionTitle}>Photos</Text>
      <Text style={styles.hint}>Maintenez et glissez pour réordonner</Text>
      {uploading ? (
        <View style={styles.uploadRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.hint}>Envoi en cours…</Text>
        </View>
      ) : null}
      <PhotoGrid
        photos={photos}
        headers={headers}
        onAdd={pickAndUpload}
        onDelete={removePhoto}
        onReorder={handleReorder}
      />

      {/* Thème natal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✨ Thème natal</Text>
        <BirthForm values={birth} onChange={setBirth} error={birthError} />
        <View style={styles.cardFooter}>
          <View />
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, birthSaving && styles.saveBtnDisabled]}
            onPress={saveBirth}
            disabled={birthSaving}
          >
            {birthSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{birthSaved ? '✓ Enregistré' : 'Enregistrer'}</Text>
            }
          </Pressable>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Description</Text>
        <TextInput
          style={styles.bioInput}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={2000}
          placeholder="Décris-toi en quelques mots…"
          placeholderTextColor={colors.textMuted}
          textAlignVertical="top"
        />
        <View style={styles.cardFooter}>
          <Text style={styles.charCount}>{bio.length}/2000</Text>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, bioSaving && styles.saveBtnDisabled]}
            onPress={saveBio}
            disabled={bioSaving}
          >
            {bioSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{bioSaved ? '✓ Enregistré' : 'Enregistrer'}</Text>
            }
          </Pressable>
        </View>
      </View>

      {/* Red flags */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚩 Red flags</Text>
        <Text style={styles.hint}>3 maximum</Text>
        <View style={styles.flagsList}>
          {flags.map((flag, i) => (
            <View key={i} style={styles.flagRow}>
              <TextInput
                style={styles.flagInput}
                value={flag}
                onChangeText={(val) => {
                  const next = [...flags];
                  next[i] = val;
                  setFlags(next);
                }}
                placeholder={`Red flag ${i + 1}`}
                placeholderTextColor={colors.textMuted}
                maxLength={150}
              />
              <Pressable
                style={({ pressed }) => [styles.flagRemove, pressed && { opacity: 0.6 }]}
                onPress={() => setFlags(flags.filter((_, fi) => fi !== i))}
                hitSlop={8}
              >
                <Text style={styles.flagRemoveText}>✕</Text>
              </Pressable>
            </View>
          ))}
          {flags.length < 3 ? (
            <Pressable
              style={({ pressed }) => [styles.flagAdd, pressed && { opacity: 0.7 }]}
              onPress={() => setFlags([...flags, ''])}
            >
              <Text style={styles.flagAddText}>+ Ajouter un red flag</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.cardFooter}>
          <View />
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, flagsSaving && styles.saveBtnDisabled]}
            onPress={saveFlags}
            disabled={flagsSaving}
          >
            {flagsSaving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>{flagsSaved ? '✓ Enregistré' : 'Enregistrer'}</Text>
            }
          </Pressable>
        </View>
      </View>

    </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Photo grid with drag-and-drop
// ---------------------------------------------------------------------------

type GridProps = {
  photos: MyPhotoDto[];
  headers: Record<string, string> | undefined;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onReorder: (next: MyPhotoDto[]) => void;
};

function PhotoGrid({ photos, headers, onAdd, onDelete, onReorder }: GridProps) {
  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? null);

  // Drag state — all in refs to avoid closure issues in PanResponder callbacks
  const dragIdxRef = useRef<number | null>(null);
  const overIdxRef = useRef<number | null>(null);
  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);

  // Visual state
  const [activeDrag, setActiveDrag] = useState<number | null>(null);
  const [overDrop, setOverDrop] = useState<number | null>(null);

  // Ghost animation
  const ghostAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [ghostIdx, setGhostIdx] = useState<number | null>(null);

  // Grid container position on screen (measured once on layout)
  const gridRef = useRef<View>(null);
  const gridOrigin = useRef({ x: 0, y: 0 });
  // Cell local positions (relative to grid container)
  const cellLayouts = useRef<{ x: number; y: number; w: number; h: number }[]>(
    Array(MAX_PHOTOS).fill(null)
  );

  const measureGrid = useCallback(() => {
    gridRef.current?.measureInWindow((x, y) => {
      gridOrigin.current = { x, y };
    });
  }, []);

  const hitTest = (pageX: number, pageY: number): number | null => {
    const ox = gridOrigin.current.x;
    const oy = gridOrigin.current.y;
    for (let i = 0; i < MAX_PHOTOS; i++) {
      const l = cellLayouts.current[i];
      if (!l) continue;
      const ax = ox + l.x;
      const ay = oy + l.y;
      if (pageX >= ax && pageX <= ax + l.w && pageY >= ay && pageY <= ay + l.h) {
        return i;
      }
    }
    return null;
  };

  const panResponder = useMemo(() => PanResponder.create({
    // Don't capture taps (let Pressable handle them)
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    // Capture move only if started on a populated cell
    onMoveShouldSetPanResponder: (evt, g) => {
      if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) return false;
      const { pageX, pageY } = evt.nativeEvent;
      const startX = pageX - g.dx;
      const startY = pageY - g.dy;
      const idx = hitTest(startX, startY);
      return idx !== null && photosRef.current[idx] != null;
    },
    onMoveShouldSetPanResponderCapture: (evt, g) => {
      if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) return false;
      const { pageX, pageY } = evt.nativeEvent;
      const startX = pageX - g.dx;
      const startY = pageY - g.dy;
      const idx = hitTest(startX, startY);
      return idx !== null && photosRef.current[idx] != null;
    },
    onPanResponderGrant: (evt, g) => {
      const { pageX, pageY } = evt.nativeEvent;
      const startX = pageX - g.dx;
      const startY = pageY - g.dy;
      const idx = hitTest(startX, startY);
      if (idx === null || photosRef.current[idx] == null) return;

      dragIdxRef.current = idx;
      overIdxRef.current = idx;

      const ox = gridOrigin.current.x;
      const oy = gridOrigin.current.y;
      const cell = cellLayouts.current[idx];
      if (cell) {
        ghostAnim.setValue({ x: cell.x, y: cell.y });
      }
      setActiveDrag(idx);
      setOverDrop(idx);
      setGhostIdx(idx);
    },
    onPanResponderMove: (evt) => {
      if (dragIdxRef.current === null) return;
      const { pageX, pageY } = evt.nativeEvent;
      const ox = gridOrigin.current.x;
      const oy = gridOrigin.current.y;
      // Ghost follows finger, centered on the cell
      ghostAnim.setValue({
        x: pageX - ox - CELL_SIZE / 2,
        y: pageY - oy - CELL_H / 2,
      });
      // Update drop target
      const over = hitTest(pageX, pageY);
      overIdxRef.current = over;
      setOverDrop(over);
    },
    onPanResponderRelease: () => {
      const from = dragIdxRef.current;
      const to = overIdxRef.current;

      dragIdxRef.current = null;
      overIdxRef.current = null;
      setActiveDrag(null);
      setOverDrop(null);
      setGhostIdx(null);

      if (from !== null && to !== null && from !== to) {
        const next = [...photosRef.current];
        const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => next[i] ?? null);
        const [item] = slots.splice(from, 1);
        if (item) {
          slots.splice(to, 0, item);
          const reordered = slots
            .filter((p): p is MyPhotoDto => p !== null)
            .map((p, i) => ({ ...p, sortOrder: i }));
          onReorder(reordered);
        }
      }
    },
    onPanResponderTerminate: () => {
      dragIdxRef.current = null;
      overIdxRef.current = null;
      setActiveDrag(null);
      setOverDrop(null);
      setGhostIdx(null);
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [onReorder]);

  return (
    <View
      ref={gridRef}
      style={styles.grid}
      onLayout={measureGrid}
      {...panResponder.panHandlers}
    >
      {slots.map((photo, idx) => {
        const isDragging = activeDrag === idx;
        const isOver = overDrop === idx && activeDrag !== null && activeDrag !== idx;

        return (
          <View
            key={photo ? photo.id : `empty-${idx}`}
            style={[
              styles.cell,
              isDragging && styles.cellDragging,
              isOver && styles.cellOver,
            ]}
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              cellLayouts.current[idx] = { x, y, w: width, h: height };
            }}
          >
            {photo && headers ? (
              <>
                <Image
                  source={{ uri: apiUrl(`/api/v1/me/profile/photos/${photo.id}`), headers }}
                  style={styles.cellImg}
                  contentFit="cover"
                />
                {/* Delete button — tap only, not drag */}
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => onDelete(photo.id)}
                  hitSlop={8}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>
                <View style={styles.handle} pointerEvents="none">
                  <Text style={styles.handleText}>⠿</Text>
                </View>
              </>
            ) : (
              <Pressable style={styles.addBtn} onPress={onAdd}>
                <Text style={styles.addBtnText}>+</Text>
              </Pressable>
            )}
          </View>
        );
      })}

      {/* Ghost — absolute within the grid, no overflow: hidden on parent */}
      {ghostIdx !== null && photos[ghostIdx] && headers ? (
        <Animated.View
          style={[
            styles.ghost,
            { transform: [{ translateX: ghostAnim.x }, { translateY: ghostAnim.y }] },
          ]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: apiUrl(`/api/v1/me/profile/photos/${photos[ghostIdx].id}`), headers }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted + '22',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.scale[3],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editContent: {
    padding: GRID_PADDING,
    gap: spacing.scale[2],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
  },
  // FAB edit button
  editFab: {
    position: 'absolute',
    bottom: spacing.scale[4],
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: spacing.scale[2],
    paddingHorizontal: spacing.scale[4],
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  editFabPressed: { opacity: 0.85 },
  editFabText: {
    color: '#fff',
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
  },
  // Form header
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.scale[3],
    paddingVertical: spacing.scale[2],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted + '22',
  },
  backBtn: {
    width: 80,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  formHeaderTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
  },
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.primary,
    padding: spacing.scale[3],
    gap: spacing.scale[2],
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyL.fontSize,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.scale[1],
  },
  charCount: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.secondary,
    paddingVertical: spacing.scale[1] + 2,
    paddingHorizontal: spacing.scale[3],
    minWidth: 110,
    alignItems: 'center',
  },
  saveBtnPressed: { opacity: 0.85 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: '#fff',
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  bioInput: {
    backgroundColor: colors.background,
    borderRadius: radius.secondary,
    padding: spacing.scale[2],
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
    lineHeight: typography.bodyM.lineHeight,
    minHeight: 100,
  },
  flagsList: {
    gap: spacing.scale[2],
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.scale[2],
  },
  flagInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.secondary,
    paddingHorizontal: spacing.scale[2],
    paddingVertical: spacing.scale[1] + 2,
    color: colors.textPrimary,
    fontSize: typography.bodyM.fontSize,
  },
  flagRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF444433',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagRemoveText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  flagAdd: {
    paddingVertical: spacing.scale[1],
  },
  flagAddText: {
    color: colors.primary,
    fontSize: typography.bodyM.fontSize,
    fontWeight: '600',
  },
  // Grid — no overflow: hidden so ghost can escape
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CELL_GAP,
    marginTop: spacing.scale[2],
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_H,
    borderRadius: radius.secondary,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cellDragging: {
    opacity: 0.25,
  },
  cellOver: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  cellImg: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  handle: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  handleText: {
    color: '#fff',
    fontSize: 14,
  },
  addBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.textMuted,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
  ghost: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_H,
    borderRadius: radius.secondary,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 100,
  },
});
