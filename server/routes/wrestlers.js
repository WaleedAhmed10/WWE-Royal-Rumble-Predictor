const express = require('express');
const router = express.Router();
const Wrestler = require('../models/Wrestler');
const DEFAULT_WRESTLERS = require('../data/defaultWrestlers');
const fileDb = require('../fileDb');
const { sanitizeWrestlers } = require('../utils/sanitizeWrestlers');

const useFile = () => global.dbMode === 'file';

router.get('/', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.getWrestlers());
    const wrestlers = await Wrestler.find().sort({ name: 1 });
    res.json(wrestlers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (useFile()) return res.status(201).json(fileDb.addWrestler(req.body));
    const wrestler = new Wrestler(req.body);
    await wrestler.save();
    res.status(201).json(wrestler);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (useFile()) {
      const wrestler = fileDb.updateWrestler(req.params.id, req.body);
      if (!wrestler) return res.status(404).json({ error: 'Wrestler not found' });
      return res.json(wrestler);
    }
    const wrestler = await Wrestler.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wrestler) return res.status(404).json({ error: 'Wrestler not found' });
    res.json(wrestler);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useFile()) {
      fileDb.deleteWrestler(req.params.id);
      return res.json({ message: 'Deleted' });
    }
    const wrestler = await Wrestler.findByIdAndDelete(req.params.id);
    if (!wrestler) return res.status(404).json({ error: 'Wrestler not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.resetWrestlers());
    await Wrestler.deleteMany({});
    const wrestlers = await Wrestler.insertMany(DEFAULT_WRESTLERS);
    res.json(wrestlers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { wrestlers } = req.body;
    if (!Array.isArray(wrestlers)) {
      return res.status(400).json({ error: 'wrestlers must be an array' });
    }

    const cleaned = sanitizeWrestlers(wrestlers);
    if (cleaned.length === 0 && wrestlers.length > 0) {
      return res.status(400).json({ error: 'No valid wrestlers found. Each wrestler needs a name.' });
    }

    if (useFile()) return res.json(fileDb.importWrestlers(cleaned));

    await Wrestler.deleteMany({});
    const imported = await Wrestler.insertMany(cleaned);
    res.json(imported);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/export/all', async (req, res) => {
  try {
    if (useFile()) return res.json(fileDb.getWrestlers());
    const wrestlers = await Wrestler.find();
    res.json(wrestlers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
