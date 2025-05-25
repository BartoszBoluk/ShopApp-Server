const express = require('express');
const router = express.Router();
const db = require('../db'); // to jest Pool z `pg`

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pobierz wszystkie listy
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lists');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pobierz listę po ID
router.get('/:id', async (req, res) => {
  const listId = req.params.id;
  try {
    const result = await db.query('SELECT * FROM lists WHERE id = $1', [listId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lista nie znaleziona' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pobierz listę po kodzie
router.get('/code/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const result = await db.query('SELECT * FROM lists WHERE code = $1', [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lista nie znaleziona' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dodaj nową listę
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Pole 'name' jest wymagane" });

  const code = generateCode();
  try {
    const result = await db.query(
      'INSERT INTO lists (name, code) VALUES ($1, $2) RETURNING id',
      [name, code]
    );
    res.json({ id: result.rows[0].id, name, code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pobierz przedmioty z listy
router.get('/:id/items', async (req, res) => {
  const listId = req.params.id;
  try {
    const result = await db.query('SELECT * FROM items WHERE list_id = $1', [listId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dodaj przedmiot
router.post('/:id/items', async (req, res) => {
  const listId = req.params.id;
  const { name, timestamp } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO items (list_id, name, timestamp) VALUES ($1, $2, $3) RETURNING id',
      [listId, name, timestamp]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usuń przedmiot
router.delete('/items/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    const result = await db.query('DELETE FROM items WHERE id = $1', [itemId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Produkt nie znaleziony' });
    res.json({ message: 'Usunięto' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
