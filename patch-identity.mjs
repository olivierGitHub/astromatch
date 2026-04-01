#!/usr/bin/env node
/**
 * Patch les comptes mock existants en leur assignant gender + attraction.
 * Ne retouche pas les photos ni l'onboarding.
 */
import { readdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

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

async function patchIdentity(email, gender, attraction) {
  process.stdout.write(`  ${email} → `);
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  await api('/api/v1/me/profile/identity', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender, attraction }),
  });
  console.log(`${gender} / ${attraction} ✓`);
}

async function countFiles(dir) {
  return (await readdir(dir)).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).length;
}

async function main() {
  const results = [];

  // Femmes mock → FEMALE / MEN
  console.log('\n— Comptes femmes —');
  const nbFemmes = await countFiles(join(import.meta.dirname, 'mock-data/femmes'));
  const femmeEmails = Array.from({ length: nbFemmes }, (_, i) => `femme${i + 1}@mock.com`);
  for (const email of femmeEmails) {
    try {
      await patchIdentity(email, 'FEMALE', 'MEN');
      results.push({ ok: true, email });
    } catch (e) {
      console.log(`  ✗ ${email} : ${e.message}`);
      results.push({ ok: false, email, error: e.message });
    }
  }

  // Hommes mock → MALE / WOMEN
  console.log('\n— Comptes hommes —');
  const nbHommes = await countFiles(join(import.meta.dirname, 'mock-data/hommes'));
  const hommeEmails = Array.from({ length: nbHommes }, (_, i) => `homme${i + 1}@mock.com`);
  for (const email of hommeEmails) {
    try {
      await patchIdentity(email, 'MALE', 'WOMEN');
      results.push({ ok: true, email });
    } catch (e) {
      console.log(`  ✗ ${email} : ${e.message}`);
      results.push({ ok: false, email, error: e.message });
    }
  }

  // Thierry → MALE / WOMEN
  console.log('\n— Thierry —');
  try {
    await patchIdentity('thierrylove75020@gmail.com', 'MALE', 'WOMEN');
    results.push({ ok: true, email: 'thierrylove75020@gmail.com' });
  } catch (e) {
    console.log(`  ✗ thierrylove75020@gmail.com : ${e.message}`);
    results.push({ ok: false, email: 'thierrylove75020@gmail.com', error: e.message });
  }

  const ok = results.filter(r => r.ok).length;
  const ko = results.filter(r => !r.ok).length;
  console.log(`\n=== ${ok} patché(s), ${ko} erreur(s) ===`);
}

main().catch(console.error);
