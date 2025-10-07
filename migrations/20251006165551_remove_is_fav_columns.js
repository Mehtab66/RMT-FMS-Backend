/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('user_favourite_folders', function(table) {
      table.dropColumn('is_fav');
    }),
    knex.schema.alterTable('user_favourite_files', function(table) {
      table.dropColumn('is_fav');
    })
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('user_favourite_folders', function(table) {
      table.integer('is_fav').defaultTo(1);
    }),
    knex.schema.alterTable('user_favourite_files', function(table) {
      table.integer('is_fav').defaultTo(1);
    })
  ]);
};
