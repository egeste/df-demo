'use strict';

const { Router } = require('express');
const store = require('./store');
const { ERRORS } = require('./constants');

const router = Router();

// GET /items — return the full collection
router.get('/', (_req, res) => {
  res.json(store.list());
});

// GET /items/:id — return a single item or 404
router.get('/:id', (req, res) => {
  const item = store.findById(req.params.id);
  if (!item) return res.status(404).json({ error: ERRORS.NOT_FOUND });
  res.json(item);
});

// POST /items — create a new item; name is mandatory
router.post('/', (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: ERRORS.NAME_REQUIRED });

  const item = store.create({ name, description });
  res.status(201).json(item);
});

// PUT /items/:id — replace mutable fields; name is mandatory
router.put('/:id', (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: ERRORS.NAME_REQUIRED });

  const item = store.update(req.params.id, { name, description });
  if (!item) return res.status(404).json({ error: ERRORS.NOT_FOUND });

  res.json(item);
});

// DELETE /items/:id — remove item; 204 on success, 404 when missing
router.delete('/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: ERRORS.NOT_FOUND });

  res.status(204).end();
});

module.exports = router;
