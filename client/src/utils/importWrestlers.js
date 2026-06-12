// Parse wrestler JSON from file — supports multiple formats

export function parseWrestlerJson(text) {
  if (!text || !text.trim()) {
    throw new Error('File is empty');
  }

  // Remove BOM (common in Windows exports)
  const cleaned = text.replace(/^\uFEFF/, '').trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Invalid JSON file. Make sure it is valid .json format.');
  }

  // Accept: [{ wrestler }, ...]  OR  { "wrestlers": [...] }
  let list;
  if (Array.isArray(data)) {
    list = data;
  } else if (data && Array.isArray(data.wrestlers)) {
    list = data.wrestlers;
  } else {
    throw new Error('JSON must be an array of wrestlers, or an object with a "wrestlers" array.');
  }

  if (list.length === 0) {
    throw new Error('No wrestlers found in the file.');
  }

  return list.map(normalizeWrestler).filter(w => w.name);
}

function normalizeWrestler(raw) {
  const name = String(raw.name || raw.Name || raw.wrestler || '').trim();
  const winProbability = parseFloat(raw.winProbability ?? raw.win_prob ?? raw.win ?? 5);
  const eliminationResistance = parseFloat(
    raw.eliminationResistance ?? raw.elimination_resistance ?? raw.resistance ?? 1.0
  );

  return {
    name,
    winProbability: Number.isFinite(winProbability) ? winProbability : 5,
    eliminationResistance: Number.isFinite(eliminationResistance) ? eliminationResistance : 1.0,
    brand: String(raw.brand || raw.Brand || 'Unknown').trim() || 'Unknown'
  };
}
