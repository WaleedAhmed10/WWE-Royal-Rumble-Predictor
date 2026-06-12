// Sanitize wrestler list before saving to database

function sanitizeWrestler(w) {
  const name = String(w.name || '').trim();
  if (!name) return null;

  const winProbability = parseFloat(w.winProbability);
  const eliminationResistance = parseFloat(w.eliminationResistance);

  return {
    name,
    winProbability: Number.isFinite(winProbability) ? winProbability : 5,
    eliminationResistance: Number.isFinite(eliminationResistance) ? eliminationResistance : 1.0,
    brand: String(w.brand || 'Unknown').trim() || 'Unknown'
  };
}

function sanitizeWrestlers(wrestlers) {
  if (!Array.isArray(wrestlers)) return [];
  return wrestlers.map(sanitizeWrestler).filter(Boolean);
}

module.exports = { sanitizeWrestlers };
