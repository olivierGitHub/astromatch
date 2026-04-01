#!/usr/bin/env node
const BASE_URL = 'https://monophyletic-cathryn-overattentive.ngrok-free.dev';
const PASSWORD = 'qwertyuiop';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

// 12 signes du zodiaque avec symboles
const SIGNS = [
  { sign: 'Bélier', symbol: '♈' },
  { sign: 'Taureau', symbol: '♉' },
  { sign: 'Gémeaux', symbol: '♊' },
  { sign: 'Cancer', symbol: '♋' },
  { sign: 'Lion', symbol: '♌' },
  { sign: 'Vierge', symbol: '♍' },
  { sign: 'Balance', symbol: '♎' },
  { sign: 'Scorpion', symbol: '♏' },
  { sign: 'Sagittaire', symbol: '♐' },
  { sign: 'Capricorne', symbol: '♑' },
  { sign: 'Verseau', symbol: '♒' },
  { sign: 'Poissons', symbol: '♓' },
];

const PLANETS = [
  { planet: 'Soleil', symbol: '☀️' },
  { planet: 'Lune', symbol: '🌙' },
  { planet: 'Mercure', symbol: '☿' },
  { planet: 'Vénus', symbol: '♀' },
  { planet: 'Mars', symbol: '♂' },
  { planet: 'Jupiter', symbol: '♃' },
  { planet: 'Saturne', symbol: '♄' },
  { planet: 'Uranus', symbol: '♅' },
  { planet: 'Neptune', symbol: '♆' },
  { planet: 'Pluton', symbol: '♇' },
];

// Génère un thème natal pseudo-aléatoire basé sur l'index du compte
function getNatalChart(accountIndex) {
  return PLANETS.map((p, pi) => {
    const signIndex = (accountIndex * 3 + pi * 7 + pi) % SIGNS.length;
    return {
      planet: p.planet,
      symbol: p.symbol,
      sign: SIGNS[signIndex].sign,
    };
  });
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

async function setNatalChart(email, chart) {
  process.stdout.write(`  ${email} → `);
  const loginRes = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const token = loginRes.data.accessToken;
  await api('/api/v1/me/profile/natalchart', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ chart: JSON.stringify(chart) }),
  });
  console.log(`✓ (${chart.length} planètes)`);
}

async function main() {
  const accounts = [
    ...Array.from({ length: 26 }, (_, i) => `femme${i + 1}@mock.com`),
    ...Array.from({ length: 5 },  (_, i) => `homme${i + 1}@mock.com`),
  ];

  console.log(`Ajout du thème natal pour ${accounts.length} comptes...\n`);
  let ok = 0, errors = 0;

  for (let i = 0; i < accounts.length; i++) {
    const chart = getNatalChart(i);
    try {
      await setNatalChart(accounts[i], chart);
      ok++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== ${ok} mis à jour, ${errors} erreur(s) ===`);
}

main().catch(console.error);
