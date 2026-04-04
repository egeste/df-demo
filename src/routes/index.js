'use strict';

const { Router } = require('express');
const itemsRouter = require('./items/router');

const router = Router();

// Config-map: add new domain routers here without touching index.js.
// The key is the mount path; the value is the domain Router.
const DOMAIN_ROUTES = {
  '/items': itemsRouter,
};

Object.entries(DOMAIN_ROUTES).forEach(([path, domainRouter]) => {
  router.use(path, domainRouter);
});

module.exports = router;
