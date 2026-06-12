const express = require('express');
const router = express.Router();
const { predictWinners, monteCarloPredict } = require('../ml/predictor');

// POST quick AI prediction (weighted scoring)
router.post('/', async (req, res) => {
  try {
    const { wrestlers } = req.body;
    if (!wrestlers || wrestlers.length !== 30) {
      return res.status(400).json({ error: 'Need exactly 30 wrestlers with entry numbers' });
    }
    const result = predictWinners(wrestlers);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Monte Carlo AI prediction (runs many simulations)
router.post('/monte-carlo', async (req, res) => {
  try {
    const { wrestlers, runs = 500 } = req.body;
    if (!wrestlers || wrestlers.length !== 30) {
      return res.status(400).json({ error: 'Need exactly 30 wrestlers with entry numbers' });
    }
    const result = monteCarloPredict(wrestlers, Math.min(runs, 2000));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
