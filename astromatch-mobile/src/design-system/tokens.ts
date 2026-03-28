/**
 * Design tokens — Cosmic Calm baseline (UX spec).
 * Single import surface for features; extend with semantic roles as components grow.
 */

export const colors = {
  primary: '#6C5CE7',
  secondary: '#14B8A6',
  accent: '#F59E0B',
  background: '#0F1020',
  surface: '#17192E',
  textPrimary: '#F8FAFC',
  textMuted: '#AAB1C5',
} as const;

/** Base unit 8px; scale from UX spec */
export const spacing = {
  base: 8,
  scale: [4, 8, 12, 16, 24, 32, 40, 48] as const,
} as const;

export const radius = {
  primary: 16,
  secondary: 12,
} as const;

/** Font families */
export const fontFamily = {
  ui: 'Inter',
  display: 'Space Grotesk',
  fallback: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
} as const;

/** Mobile-first type scale: fontSize / lineHeight */
export const typography = {
  display: { fontSize: 32, lineHeight: 38 },
  h1: { fontSize: 28, lineHeight: 34 },
  h2: { fontSize: 24, lineHeight: 30 },
  h3: { fontSize: 20, lineHeight: 26 },
  bodyL: { fontSize: 16, lineHeight: 24 },
  bodyM: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
} as const;
