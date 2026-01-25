const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

// GET /api/enhanced-content/courses
router.get('/enhanced-content/courses', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'scripts', 'courses-seed.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error('Failed to load courses-seed.json', err);
    res.status(500).json({ error: 'Failed to load enhanced courses catalog' });
  }
});

module.exports = router;
