const express = require('express');
const router = express.Router();
const RumbleSetup = require('../models/RumbleSetup');
const fileDb = require('../fileDb');
const { useFile } = require('../db');

router.get('/', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.getSetup());
    const setup = await RumbleSetup.findOne().sort({ createdAt: -1 });
    res.json(setup || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { wrestlers } = req.body;
    if (!wrestlers || wrestlers.length !== 30) {
      return res.status(400).json({ error: 'Need exactly 30 wrestlers' });
    }
    if (useFile()) return res.status(201).json(fileDb.saveSetup(wrestlers));
    const setup = new RumbleSetup({ wrestlers });
    await setup.save();
    res.status(201).json(setup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
