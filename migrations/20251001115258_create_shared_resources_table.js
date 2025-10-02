exports.up = function (knex) {
  return knex.schema.createTable("shared_resources", function (table) {
    table.increments("id");

    // What is being shared
    table.integer("resource_id").notNullable();
    table.enu("resource_type", ["file", "folder"]).notNullable();

    // Who shared it and with whom
    table.integer("shared_by").unsigned().notNullable(); // The user who shared
    table.integer("shared_with").unsigned().notNullable(); // The user it's shared with

    // Security token for shareable links
    table.string("share_token").unique();

    // Permissions for this specific share
    table.boolean("can_edit").defaultTo(false);
    table.boolean("can_download").defaultTo(false);
    table.boolean("can_share").defaultTo(false); // Can they re-share?

    // Temporary sharing
    table.timestamp("expires_at").nullable();

    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign("shared_by")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .foreign("shared_with")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Performance indexes
    table.index(["resource_id", "resource_type"]);
    table.index(["shared_with"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("shared_resources");
};
