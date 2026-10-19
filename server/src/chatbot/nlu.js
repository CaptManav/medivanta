import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let intentData = { intents: [] };
try {
  const raw = readFileSync(join(__dirname, 'intents.json'), 'utf-8');
  intentData = JSON.parse(raw);
} catch (err) {
  console.error('Failed to load intents.json:', err.message);
}

/**
 * Tokenize and normalize input string.
 * @param {string} text
 * @returns {string[]}
 */
export const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ') // preserves Devanagari script
    .split(/\s+/)
    .filter(Boolean);
};

/**
 * Detect user intent using weighted token overlap & ngram phrase matching.
 * @param {string} message
 * @returns {{ intent: string, confidence: number }}
 */
export const detectIntent = (message) => {
  if (!message || typeof message !== 'string') {
    return { intent: 'fallback', confidence: 0 };
  }

  const normalized = message.toLowerCase().trim();
  const tokens = new Set(tokenize(normalized));

  let bestIntent = 'fallback';
  let bestScore = 0;

  for (const item of intentData.intents) {
    for (const example of item.examples) {
      const exNormalized = example.toLowerCase();
      // Exact substring match gives high weight
      if (normalized.includes(exNormalized)) {
        const score = 0.8 + (exNormalized.length / (normalized.length + 1)) * 0.2;
        if (score > bestScore) {
          bestScore = score;
          bestIntent = item.name;
        }
      } else {
        // Token overlap
        const exTokens = tokenize(exNormalized);
        let matchCount = 0;
        for (const t of exTokens) {
          if (tokens.has(t)) matchCount++;
        }
        if (exTokens.length > 0) {
          const score = (matchCount / exTokens.length) * 0.7;
          if (score > bestScore && score >= 0.4) {
            bestScore = score;
            bestIntent = item.name;
          }
        }
      }
    }
  }

  return {
    intent: bestScore >= 0.3 ? bestIntent : 'fallback',
    confidence: Math.min(1, Number(bestScore.toFixed(2))),
  };
};

/**
 * Extract named entities from message (hospital, doctor, department).
 * @param {string} message
 * @param {Array<{ id: string, name: string, taluka?: string, district?: string }>} hospitals
 * @param {Array<{ id: string, name: string, specialization?: string }>} doctors
 * @returns {{ hospital: object|null, doctor: object|null }}
 */
export const extractEntities = (message, hospitals = [], doctors = []) => {
  const lower = message.toLowerCase();

  let matchedHospital = null;
  for (const h of hospitals) {
    const hName = h.name.toLowerCase();
    const shortName = hName.split(' ')[0]; // e.g. "awari" or "samarth"
    if (
      lower.includes(hName) ||
      (shortName.length > 3 && lower.includes(shortName)) ||
      (h.taluka && lower.includes(h.taluka.toLowerCase())) ||
      (h.district && lower.includes(h.district.toLowerCase()))
    ) {
      matchedHospital = h;
      break;
    }
  }

  let matchedDoctor = null;
  for (const d of doctors) {
    const dName = d.name.toLowerCase();
    const docTokens = dName.replace('dr.', '').trim().split(' ');
    for (const token of docTokens) {
      if (token.length > 3 && lower.includes(token)) {
        matchedDoctor = d;
        break;
      }
    }
    if (matchedDoctor) break;
  }

  return {
    hospital: matchedHospital,
    doctor: matchedDoctor,
  };
};
