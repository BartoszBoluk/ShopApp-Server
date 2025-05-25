const express = require('express');
const router = express.Router();
const db = require('../db');

// Funkcja do generowania unikalnego kodu (6 znaków)
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pobierz wszystkie listy
router.get('/', (req, res) => {
  db.query('SELECT * FROM lists', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Pobierz listę o danym ID
router.get('/:id', (req, res) => {
  const listId = req.params.id;
  db.query('SELECT * FROM lists WHERE id = ?', [listId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Lista nie znaleziona' });
    res.json(rows[0]);
  });
});

// Pobierz listę po kodzie
router.get('/code/:code', (req, res) => {
  const code = req.params.code;
  db.query('SELECT * FROM lists WHERE code = ?', [code], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "Lista nie znaleziona" });
    res.json(rows[0]);
  });
});

// Dodaj nową listę z generowaniem unikalnego kodu
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Pole 'name' jest wymagane" });
  }

  // Generowanie kodu
  const code = generateCode();

  // Opcjonalnie: tu możesz dodać pętlę lub logikę, żeby upewnić się, że kod jest unikalny
  // Dla uproszczenia pomijamy to teraz

  db.query('INSERT INTO lists (name, code) VALUES (?, ?)', [name, code], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, code });
  });
});

// Pobierz przedmioty z listy
router.get('/:id/items', (req, res) => {
  const listId = req.params.id;
  db.query('SELECT * FROM items WHERE list_id = ?', [listId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Dodaj przedmiot do listy
router.post('/:id/items', (req, res) => {
  const listId = req.params.id;
  const { name, timestamp } = req.body;
  db.query(
    'INSERT INTO items (list_id, name, timestamp) VALUES (?, ?, ?)',
    [listId, name, timestamp],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

// Usuń pojedynczy produkt po ID
router.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;

  db.query('DELETE FROM items WHERE id = ?', [itemId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    res.json({ message: 'Usunięto' });
  });
});


module.exports = router;
