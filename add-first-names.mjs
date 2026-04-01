#!/usr/bin/env node
const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

const FEMME_NAMES = [
  'Léa', 'Emma', 'Manon', 'Chloé', 'Camille',
  'Sarah', 'Lucie', 'Clara', 'Julie', 'Sophie',
  'Marie', 'Inès', 'Alice', 'Zoé', 'Jade',
  'Anaïs', 'Laura', 'Pauline', 'Charlotte', 'Céline',
  'Margot', 'Élise', 'Noémie', 'Ambre', 'Justine', 'Océane',
];

const HOMME_NAMES = ['Thomas', 'Lucas', 'Hugo', 'Nathan', 'Antoine'];

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...NGROK_HEADERS, ...options.headers },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function setFirstName(email, firstName) {
  process.stdout.write(`  ${email} → ${firstName} `);
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  await api('/api/v1/me/profile/firstname', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName }),
  });
  console.log('✓');
}

async function main() {
  console.log('Ajout des prénoms...\n');
  let ok = 0, errors = 0;

  for (let i = 0; i < FEMME_NAMES.length; i++) {
    try {
      await setFirstName(`femme${i + 1}@mock.com`, FEMME_NAMES[i]);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  for (let i = 0; i < HOMME_NAMES.length; i++) {
    try {
      await setFirstName(`homme${i + 1}@mock.com`, HOMME_NAMES[i]);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== ${ok} mis à jour, ${errors} erreur(s) ===`);
}

main().catch(console.error);
