exports.up = function (knex) {
  return knex.schema.alterTable("folders", function (table) {
    table.timestamp("updated_at");

    // Add foreign keys
    table
      .foreign("parent_id")
      .references("id")
      .inTable("folders")
      .onDelete("CASCADE");
    table
      .foreign("created_by")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("folders", function (table) {
    table.dropColumn("updated_at");
  });
};
