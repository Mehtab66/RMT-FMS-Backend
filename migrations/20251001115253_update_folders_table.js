exports.up = function (knex) {
  return knex.schema.alterTable("folders", function (table) {
    table.timestamp("updated_at");

    // Note: Foreign keys for parent_id and created_by already exist from initial table creation
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("folders", function (table) {
    table.dropColumn("updated_at");
  });
};
