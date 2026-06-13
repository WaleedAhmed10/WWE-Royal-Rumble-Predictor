const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/', async (req, res) => {
  try {
    res.json(await store.setup.get());
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
    const setup = await store.setup.save(wrestlers);
    res.status(201).json(setup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
