const express = require('express');
const router = express.Router();
const store = require('../store');
const { sanitizeWrestlers } = require('../utils/sanitizeWrestlers');

router.get('/', async (req, res) => {
  try {
    res.json(await store.wrestlers.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const wrestler = await store.wrestlers.add(req.body);
    res.status(201).json(wrestler);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const wrestler = await store.wrestlers.update(req.params.id, req.body);
    if (!wrestler) return res.status(404).json({ error: 'Wrestler not found' });
    res.json(wrestler);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await store.wrestlers.remove(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    res.json(await store.wrestlers.reset());
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

    res.json(await store.wrestlers.import(cleaned));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/export/all', async (req, res) => {
  try {
    res.json(await store.wrestlers.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
