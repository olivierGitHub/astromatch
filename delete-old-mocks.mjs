#!/usr/bin/env node
/**
 * Supprime les anciens comptes mock (format slug @astromatch.mock).
 * Se connecte via l'API et appelle DELETE /api/v1/account pour chacun.
 */
const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

// Anciens emails dérivés des noms de fichiers (même logique que le seed original)
function toSlug(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
}

const OLD_FEMMES = [
  'freestocks-9UVmlIb0wJU-unsplash.jpg',
  'happy-woman-home-coronavirus-quarantine.jpg',
  'jake-nackos-IF9TK5Uy-KI-unsplash.jpg',
  'jillwellington-woman-593141.jpg',
  'pexels-girl-1867092.jpg',
  'pretty-smiling-joyfully-female-with-fair-hair-dressed-casually-looking-with-satisfaction.jpg',
  'tamara-bellis-Brl7bqld05E-unsplash.jpg',
  'young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair.jpg',
].map(f => `femme_${toSlug(f)}@astromatch.mock`);

const OLD_HOMMES = [
  'pexels-arch-5813151.jpg',
  'pexels-chrissykrueger-30688136.jpg',
  'pexels-ebuuyildiz-16698438.jpg',
  'pexels-nadine-ginzel-80607840-31428202.jpg',
  'pexels-nazar-aslan-443954785-29382972.jpg',
].map(f => `homme_${toSlug(f)}@astromatch.mock`);

const ALL_OLD = [...OLD_FEMMES, ...OLD_HOMMES];

async function deleteAccount(email) {
  process.stdout.write(`  ${email} → `);
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...NGROK_HEADERS },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (loginRes.status === 401 || loginRes.status === 404) {
    console.log('inexistant, ignoré');
    return 'skipped';
  }
  if (!loginRes.ok) {
    const t = await loginRes.text();
    console.log(`login échoué (${loginRes.status}): ${t}`);
    return 'error';
  }
  const loginJson = await loginRes.json();
  const token = loginJson.data.accessToken;

  const delRes = await fetch(`${BASE_URL}/api/v1/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, ...NGROK_HEADERS },
  });
  if (!delRes.ok) {
    const t = await delRes.text();
    console.log(`suppression échouée (${delRes.status}): ${t}`);
    return 'error';
  }
  console.log('supprimé ✓');
  return 'deleted';
}

async function main() {
  console.log(`${ALL_OLD.length} anciens comptes à supprimer...\n`);
  let deleted = 0, skipped = 0, errors = 0;
  for (const email of ALL_OLD) {
    const r = await deleteAccount(email);
    if (r === 'deleted') deleted++;
    else if (r === 'skipped') skipped++;
    else errors++;
  }
  console.log(`\n=== ${deleted} supprimé(s), ${skipped} ignoré(s), ${errors} erreur(s) ===`);
}

main().catch(console.error);
