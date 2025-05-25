const express = require('express');
const router = express.Router();
const supabase = require('../db'); // zaktualizowany db.js z createClient

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
  const { data, error } = await supabase.from('lists').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Pobierz listę po ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('lists').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Lista nie znaleziona' });
  res.json(data);
});

// Pobierz listę po kodzie
router.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  const { data, error } = await supabase.from('lists').select('*').eq('code', code).single();
  if (error) return res.status(404).json({ error: 'Lista nie znaleziona' });
  res.json(data);
});

// Dodaj nową listę
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Pole 'name' jest wymagane" });

  const code = generateCode();

  const { data, error } = await supabase
    .from('lists')
    .insert([{ name, code }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Pobierz przedmioty z listy
router.get('/:id/items', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('items').select('*').eq('list_id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Dodaj przedmiot do listy
router.post('/:id/items', async (req, res) => {
  const listId = req.params.id;
  const { name, timestamp } = req.body;

  const { data, error } = await supabase
    .from('items')
    .insert([{ list_id: listId, name, timestamp }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id });
});

// Usuń przedmiot po ID
router.delete('/items/:id', async (req, res) => {
  const itemId = req.params.id;

  const { error, count } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: 'Produkt nie znaleziony' });

  res.json({ message: 'Usunięto' });
});

module.exports = router;
