/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('permissions', function(table) {
    // Drop unnecessary columns
    table.dropColumn('can_create');
    table.dropColumn('can_edit');
    table.dropColumn('inherit');
    table.dropColumn('can_delete');
    table.dropColumn('expires_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('permissions', function(table) {
    // Add back the columns if needed to rollback
    table.boolean('can_create').defaultTo(false);
    table.boolean('can_edit').defaultTo(false);
    table.boolean('inherit').defaultTo(true);
    table.boolean('can_delete').defaultTo(false);
    table.timestamp('expires_at').nullable();
  });
};
