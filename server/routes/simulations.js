const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const fileDb = require('../fileDb');

const useFile = () => global.dbMode === 'file';

router.get('/', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.getSimulations());
    const sims = await Simulation.find().sort({ createdAt: -1 }).limit(10);
    res.json(sims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.getLatestSimulation());
    const sim = await Simulation.findOne().sort({ createdAt: -1 });
    res.json(sim || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (useFile()) return res.status(201).json(fileDb.saveSimulation(req.body));
    const sim = new Simulation(req.body);
    await sim.save();
    res.status(201).json(sim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
