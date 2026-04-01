#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const MONUMENT_DIR = join(import.meta.dirname, 'mock-data/monument');
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };
const MAX_BYTES = 4.5 * 1024 * 1024;

const MONUMENT_PHOTOS = [
  'pexels-ahrphotography-32599891.jpg',
  'pexels-costa-18709350.jpg',
  'pexels-efrem-efre-2786187-25536924.jpg',
  'pexels-khaled-hamoud-1740481-6547316.jpg',
  'pexels-markus-winkler-1430818-5757123.jpg',
];

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...NGROK_HEADERS, ...options.headers },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  return json;
}

async function addBeachPhoto(email, photoFile) {
  process.stdout.write(`  ${email} (${photoFile}) → `);

  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;

  const photoPath = join(MONUMENT_DIR, photoFile);
  let photoBytes = await readFile(photoPath);
  if (photoBytes.length > MAX_BYTES) {
    photoBytes = await sharp(photoBytes).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  }

  const form = new FormData();
  form.append('file', new Blob([photoBytes], { type: 'image/jpeg' }), photoFile);
  await api('/api/v1/me/profile/photos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, ...NGROK_HEADERS },
    body: form,
  });

  console.log('✓');
}

async function main() {
  const femmeCount = 26;
  const hommeCount = 5;

  const accounts = [
    ...Array.from({ length: femmeCount }, (_, i) => `femme${i + 1}@mock.com`),
    ...Array.from({ length: hommeCount }, (_, i) => `homme${i + 1}@mock.com`),
  ];

  console.log(`Ajout d'une photo de plage pour ${accounts.length} comptes...\n`);
  let ok = 0, errors = 0;

  for (let i = 0; i < accounts.length; i++) {
    const photo = MONUMENT_PHOTOS[i % MONUMENT_PHOTOS.length];
    try {
      await addBeachPhoto(accounts[i], photo);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== ${ok} ajouté(s), ${errors} erreur(s) ===`);
}

main().catch(console.error);
