const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    res.json(await store.simulations.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    res.json(await store.simulations.getLatest());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const sim = await store.simulations.save(req.body);
    res.status(201).json(sim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
