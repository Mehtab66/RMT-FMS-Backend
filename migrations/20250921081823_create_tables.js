exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("username").notNullable().unique();
      table.string("password_hash").notNullable();
      table.enum("role", ["super_admin", "user"]).defaultTo("user");
    }),
    knex.schema.createTable("folders", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .integer("parent_id")
        .unsigned()
        .references("id")
        .inTable("folders")
        .nullable();
      table.integer("created_by").unsigned().references("id").inTable("users");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("files", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table
        .integer("folder_id")
        .unsigned()
        .references("id")
        .inTable("folders")
        .nullable();
      table.string("cloudinary_public_id").notNullable();
      table.string("cloudinary_url").notNullable();
      table.integer("created_by").unsigned().references("id").inTable("users");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    }),
    knex.schema.createTable("permissions", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().references("id").inTable("users");
      table.integer("resource_id").notNullable();
      table.enum("resource_type", ["folder", "file"]).notNullable();
      table.boolean("can_read").defaultTo(false);
      table.boolean("can_create").defaultTo(false);
      table.boolean("can_edit").defaultTo(false);
      table.boolean("can_download").defaultTo(false);
      table.boolean("inherit").defaultTo(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTableIfExists("permissions"),
    knex.schema.dropTableIfExists("files"),
    knex.schema.dropTableIfExists("folders"),
    knex.schema.dropTableIfExists("users"),
  ]);
};
