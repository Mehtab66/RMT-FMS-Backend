// db.js
const knex = require("knex");
const knexConfig = require("../knexfile");

// Pick environment config (development, production, etc.)
const db = knex(knexConfig.development);

module.exports = db;
