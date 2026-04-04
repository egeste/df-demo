'use strict';

const { randomUUID } = require('node:crypto');

// Single source of truth for item persistence within a process lifetime.
// Deliberately not a class — plain functions over a module-scoped array
// keeps the interface minimal and the dependency graph shallow.
let items = [];

const findById = (id) => items.find((item) => item.id === id);

const list = () => [...items];

const create = ({ name, description = '' }) => {
  const item = {
    id: randomUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  return item;
};

const update = (id, { name, description }) => {
  const item = findById(id);
  if (!item) return null;

  // Only mutate fields that were explicitly provided
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;

  return item;
};

const remove = (id) => {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  return true;
};

// Exposed for test teardown so each test suite can start with a clean slate
// without reaching into the module internals.
const reset = () => { items = []; };

module.exports = { list, create, findById, update, remove, reset };
