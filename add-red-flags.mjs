#!/usr/bin/env node
const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

const RED_FLAGS_POOL = [
  "Répond aux messages deux jours plus tard en disant \"j'étais Mercure rétrograde\"",
  "Refuse de choisir un restaurant (stellium Balance)",
  "Envoie des mèmes à 3h du matin sans prévenir",
  "Annule les plans le jour J pour \"suivre son intuition\"",
  "Suranalyse chaque message pendant 45 minutes avant de répondre",
  "A encore son ex en fond d'écran \"pour l'énergie\"",
  "Ne supporte pas les gens qui ne croient pas à l'astrologie",
  "Parle de sa \"shadow work\" à tous les premiers rendez-vous",
  "Convaincu·e que tous ses exes sont des Scorpions toxiques",
  "Cherche son âme sœur depuis \"plusieurs vies passées\"",
  "Peut pas dormir si Vénus est en carré avec Mars",
  "Relit les conversations pour y trouver des \"signes de l'univers\"",
  "Collectionne les cristaux mais perd ses clés tous les jours",
  "Affirme ressentir les énergies des lieux publics",
  "Fait confiance aux inconnus si leur signe est compatible",
  "Pleure devant les couchers de soleil (\"trop de sensibilité neptunienne\")",
  "Dit \"je suis juste très intense\" pour tout justifier",
  "Refuse de prendre des décisions sans consulter son thème natal",
];

// Assigne 3 red flags différents par compte (rotation dans le pool)
function getRedFlags(index) {
  const flags = [];
  for (let i = 0; i < 3; i++) {
    flags.push(RED_FLAGS_POOL[(index * 3 + i) % RED_FLAGS_POOL.length]);
  }
  return flags;
}

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...NGROK_HEADERS, ...options.headers },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function setRedFlags(email, flags) {
  process.stdout.write(`  ${email} → `);
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  await api('/api/v1/me/profile/redflags', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags }),
  });
  console.log(`✓ [${flags.map((_, i) => i + 1).join(',')}]`);
}

async function main() {
  const accounts = [
    ...Array.from({ length: 26 }, (_, i) => `femme${i + 1}@mock.com`),
    ...Array.from({ length: 5 },  (_, i) => `homme${i + 1}@mock.com`),
  ];

  console.log(`Ajout de red flags pour ${accounts.length} comptes...\n`);
  let ok = 0, errors = 0;

  for (let i = 0; i < accounts.length; i++) {
    const flags = getRedFlags(i);
    try {
      await setRedFlags(accounts[i], flags);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== ${ok} mis à jour, ${errors} erreur(s) ===`);
}

main().catch(console.error);
