exports.up = function (knex) {
  return knex.schema.alterTable("permissions", function (table) {
    // Add delete permission
    table.boolean("can_delete").defaultTo(false);

    // Add expiration for temporary permissions
    table.timestamp("expires_at").nullable();

    // Add timestamps
    table.timestamps(true, true);

    // Prevent duplicate permissions
    table.unique(["user_id", "resource_id", "resource_type"]);

    // Note: Foreign key for user_id already exists from initial table creation
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("permissions", function (table) {
    table.dropColumn("can_delete");
    table.dropColumn("expires_at");
    table.dropTimestamps();
    table.dropUnique(["user_id", "resource_id", "resource_type"]);
  });
};
