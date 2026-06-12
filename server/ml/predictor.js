// Simple AI/ML predictor - uses weighted scoring + Monte Carlo simulation
// No heavy libraries needed - easy to read and understand

function getEntryBonus(entryNumber) {
  // Late entries (#25-30) often win the Rumble
  if (entryNumber >= 28) return 1.4;
  if (entryNumber >= 25) return 1.25;
  if (entryNumber >= 20) return 1.1;
  if (entryNumber <= 3) return 0.75; // Early entries are risky
  if (entryNumber <= 10) return 0.9;
  return 1.0;
}

// Score one wrestler based on their stats
function scoreWrestler(wrestler) {
  const winProb = wrestler.winProbability || 5;
  const resistance = wrestler.eliminationResistance || 1.0;
  const entryBonus = getEntryBonus(wrestler.entryNumber || 15);

  return winProb * resistance * entryBonus;
}

// Predict win percentages for all wrestlers in a roster
function predictWinners(wrestlers) {
  const scores = wrestlers.map(w => ({
    name: w.name,
    entryNumber: w.entryNumber,
    brand: w.brand,
    score: scoreWrestler(w)
  }));

  const total = scores.reduce((sum, w) => sum + w.score, 0) || 1;

  const predictions = scores
    .map(w => ({
      ...w,
      winPercent: Math.round((w.score / total) * 1000) / 10
    }))
    .sort((a, b) => b.winPercent - a.winPercent);

  return {
    topPick: predictions[0],
    predictions,
    insight: buildInsight(predictions)
  };
}

function buildInsight(predictions) {
  const top = predictions[0];
  const lateEntry = predictions.find(p => p.entryNumber >= 25 && p.winPercent > 8);

  if (lateEntry && lateEntry.name !== top.name) {
    return `${top.name} is the AI favorite (${top.winPercent}%), but watch ${lateEntry.name} — late entry #${lateEntry.entryNumber} gives a strong edge.`;
  }
  return `${top.name} leads with ${top.winPercent}% predicted win chance based on stats and entry position.`;
}

// Run many quick simulations (Monte Carlo) for more accurate ML prediction
function monteCarloPredict(wrestlers, runs = 500) {
  const winCounts = {};

  wrestlers.forEach(w => {
    winCounts[w.name] = 0;
  });

  for (let i = 0; i < runs; i++) {
    const winner = runQuickSimulation(wrestlers);
    if (winner) winCounts[winner]++;
  }

  const results = wrestlers.map(w => ({
    name: w.name,
    entryNumber: w.entryNumber,
    brand: w.brand,
    winPercent: Math.round((winCounts[w.name] / runs) * 1000) / 10
  })).sort((a, b) => b.winPercent - a.winPercent);

  return {
    runs,
    topPick: results[0],
    predictions: results,
    insight: `After ${runs} AI simulations, ${results[0].name} wins most often (${results[0].winPercent}%).`
  };
}

// Fast simulation for Monte Carlo (no timeline, just find winner)
function runQuickSimulation(wrestlers) {
  const sorted = [...wrestlers].sort((a, b) => a.entryNumber - b.entryNumber);
  let entryQueue = [...sorted];
  let active = [];
  let minute = 0;

  while (minute < 120) {
    minute++;

    const entryIndex = Math.floor(minute / 1.5);
    while (entryQueue.length > 0 && entryQueue[0].entryNumber === entryIndex) {
      const w = entryQueue.shift();
      active.push({
        ...w,
        stamina: 100,
        momentum: 0,
        eliminations: 0
      });
    }

    const toRemove = [];
    active.forEach(w => {
      w.stamina -= 1 + active.length / 10;
      w.momentum *= 0.95;

      let elimChance = 0.05;
      elimChance *= (1 + (100 - w.stamina) / 200);
      elimChance /= w.eliminationResistance || 1;
      elimChance /= 1 + w.momentum;

      if (Math.random() < elimChance) {
        toRemove.push(w);
      }
    });

    toRemove.forEach(w => {
      const idx = active.indexOf(w);
      if (idx !== -1) active.splice(idx, 1);
      if (active.length > 0) {
        const eliminator = active[Math.floor(Math.random() * active.length)];
        eliminator.momentum += 0.25;
      }
    });

    const totalEliminated = 30 - active.length - entryQueue.length;
    if (totalEliminated >= 29 && active.length === 1) {
      return active[0].name;
    }
    if (entryQueue.length === 0 && active.length === 1) {
      return active[0].name;
    }
  }

  return active[0]?.name || sorted[sorted.length - 1]?.name;
}

module.exports = { predictWinners, monteCarloPredict, scoreWrestler };
