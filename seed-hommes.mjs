#!/usr/bin/env node
import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import sharp from 'sharp';

const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const PHOTOS_DIR = join(import.meta.dirname, 'mock-data/hommes');
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

const PROFILES = [
  { birthDate: '1993-07-12', birthPlace: 'Paris, France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris', location: 'Paris, France', bio: 'Passionné de cosmos et de randonnée. Lion ascendant Sagittaire.' },
  { birthDate: '1990-02-28', birthPlace: 'Lyon, France', lat: 45.7640, lng: 4.8357, tz: 'Europe/Paris', location: 'Lyon, France', bio: 'Philosophe amateur, amateur de bonne cuisine et d\'étoiles.' },
  { birthDate: '1997-10-15', birthPlace: 'Paris, France', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris', location: 'Paris, France', bio: 'Scorpion curieux, attentif aux synchronicités de la vie.' },
  { birthDate: '1988-05-03', birthPlace: 'Montreal, Canada', lat: 45.5017, lng: -73.5673, tz: 'America/Montreal', location: 'Montreal, Canada', bio: 'Entre la musique et l\'astronomie, je cherche une vraie connexion.' },
  { birthDate: '1995-12-21', birthPlace: 'Lyon, France', lat: 45.7640, lng: 4.8357, tz: 'Europe/Paris', location: 'Lyon, France', bio: 'Capricorne discret mais profond. Amoureux de jazz et de nuits claires.' },
];

const DYNAMICS_OPTIONS = [
  ['deep_connection'],
  ['slow_burn'],
  ['friendship_first'],
  ['spiritual_alignment'],
  ['deep_connection', 'slow_burn'],
  ['playful_exploration'],
  ['passion_forward'],
  ['co_creation'],
];

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...NGROK_HEADERS, ...options.headers },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return json;
}

async function createAccount(photo, index) {
  const email = `homme${index + 1}@mock.com`;
  const profile = PROFILES[index % PROFILES.length];
  const dynamics = DYNAMICS_OPTIONS[index % DYNAMICS_OPTIONS.length];

  console.log(`\n[${index + 1}] ${email}`);

  // 1. Register (skip if already exists)
  console.log('  → register');
  try {
    await api('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: PASSWORD, birthDate: profile.birthDate }),
    });
  } catch (e) {
    if (!e.message.includes('already') && !e.message.includes('409') && !e.message.includes('DUPLICATE')) throw e;
    console.log('     (compte existant, on continue)');
  }

  // 2. Login
  console.log('  → login');
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 3. Consents
  console.log('  → consents');
  await api('/api/v1/me/consents', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ privacy_ack: true, notifications: false, analytics: false }),
  });

  // 4. Birth profile
  console.log('  → birth profile');
  await api('/api/v1/me/profile/birth', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      birthTimeUnknown: true,
      birthTime: null,
      birthPlaceLabel: profile.birthPlace,
      birthPlaceLat: profile.lat,
      birthPlaceLng: profile.lng,
      birthTimezone: profile.tz,
    }),
  });

  // 5. Location
  console.log('  → location');
  await api('/api/v1/me/profile/location', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ label: profile.location, lat: profile.lat, lng: profile.lng, manual: true }),
  });

  // 6. Dynamics
  console.log('  → dynamics');
  await api('/api/v1/me/profile/dynamics', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ labels: dynamics }),
  });

  // 7. Identity
  console.log('  → identity');
  await api('/api/v1/me/profile/identity', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ gender: 'MALE', attraction: 'WOMEN' }),
  });

  // 8. Bio
  console.log('  → bio');
  await api('/api/v1/me/profile/bio', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ bio: profile.bio }),
  });

  // 9. Upload photo (resize if > 4.5 MB)
  console.log('  → photo upload');
  const photoPath = join(PHOTOS_DIR, photo);
  const MAX_BYTES = 4.5 * 1024 * 1024;
  let photoBytes = await readFile(photoPath);
  if (photoBytes.length > MAX_BYTES) {
    console.log(`     (resize: ${(photoBytes.length / 1024 / 1024).toFixed(1)} MB → <4.5 MB)`);
    photoBytes = await sharp(photoBytes).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  }
  const form = new FormData();
  form.append('file', new Blob([photoBytes], { type: 'image/jpeg' }), photo);
  await api('/api/v1/me/profile/photos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, ...NGROK_HEADERS },
    body: form,
  });

  // 10. Complete onboarding
  console.log('  → complete onboarding');
  await api('/api/v1/me/onboarding/complete', {
    method: 'POST',
    headers: auth,
    body: '{}',
  });

  console.log(`  ✓ compte créé : ${email} / ${PASSWORD}`);
  return email;
}

async function addPhotoToExistingUser(email, photoPath) {
  console.log(`\n[photo+identity] Ajout photo et identity pour ${email}`);

  console.log('  → login');
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  console.log('  → identity');
  await api('/api/v1/me/profile/identity', {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ gender: 'MALE', attraction: 'WOMEN' }),
  });

  console.log('  → photo upload');
  const MAX_BYTES = 4.5 * 1024 * 1024;
  let photoBytes = await readFile(photoPath);
  if (photoBytes.length > MAX_BYTES) {
    console.log(`     (resize: ${(photoBytes.length / 1024 / 1024).toFixed(1)} MB → <4.5 MB)`);
    photoBytes = await sharp(photoBytes).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  }
  const form = new FormData();
  const filename = basename(photoPath);
  form.append('file', new Blob([photoBytes], { type: 'image/jpeg' }), filename);
  await api('/api/v1/me/profile/photos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, ...NGROK_HEADERS },
    body: form,
  });

  console.log(`  ✓ photo ajoutée`);
}

async function main() {
  // --- Seed hommes ---
  const files = (await readdir(PHOTOS_DIR))
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  console.log(`${files.length} photos trouvées dans mock-data/hommes/`);

  const results = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const email = await createAccount(files[i], i);
      results.push({ ok: true, email });
    } catch (err) {
      console.error(`  ✗ erreur : ${err.message}`);
      results.push({ ok: false, file: files[i], error: err.message });
    }
  }

  // --- Photo pour thierrylove75020 ---
  // On réutilise la première photo des hommes comme photo de profil
  const thierryPhoto = join(PHOTOS_DIR, files[0]);
  try {
    await addPhotoToExistingUser('thierrylove75020@gmail.com', thierryPhoto);
    results.push({ ok: true, email: 'thierrylove75020@gmail.com (photo ajoutée)' });
  } catch (err) {
    console.error(`  ✗ erreur photo thierry : ${err.message}`);
    results.push({ ok: false, file: thierryPhoto, error: err.message });
  }

  console.log('\n=== Résumé ===');
  results.forEach(r => {
    if (r.ok) console.log(`  ✓ ${r.email}`);
    else console.log(`  ✗ ${r.file} : ${r.error}`);
  });
}

main().catch(console.error);
