const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const pool = require('../config/db');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// CSV columns expected: restaurant_id,order_value,order_date,status
router.post('/upload-orders', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const content = fs.readFileSync(req.file.path);
    const records = parse(content, { columns: true, skip_empty_lines: true });

    let inserted = 0;
    for (const row of records) {
      await pool.query(
        'INSERT INTO orders (restaurant_id, order_value, order_date, status) VALUES (?, ?, ?, ?)',
        [row.restaurant_id, row.order_value, row.order_date, row.status || 'completed']
      );
      inserted++;
    }
    fs.unlinkSync(req.file.path);
    res.json({ message: `Imported ${inserted} orders successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;