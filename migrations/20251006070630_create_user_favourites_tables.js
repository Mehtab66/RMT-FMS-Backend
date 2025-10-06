exports.up = function (knex) {
  return knex.schema
    .createTable("user_favourite_files", function (table) {
      table.increments("id").unsigned().primary();
      table.integer("user_id").unsigned().notNullable();
      table.integer("file_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .foreign("file_id")
        .references("id")
        .inTable("files")
        .onDelete("CASCADE");

      table.unique(["user_id", "file_id"]);
    })
    .createTable("user_favourite_folders", function (table) {
      table.increments("id").unsigned().primary();
      table.integer("user_id").unsigned().notNullable();
      table.integer("folder_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .foreign("folder_id")
        .references("id")
        .inTable("folders")
        .onDelete("CASCADE");

      table.unique(["user_id", "folder_id"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("user_favourite_folders")
    .dropTable("user_favourite_files");
};
