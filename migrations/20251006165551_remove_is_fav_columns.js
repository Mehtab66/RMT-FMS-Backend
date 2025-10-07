/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasFavFolders = await knex.schema.hasColumn("user_favourite_folders", "is_favourite");
  const hasFavFiles = await knex.schema.hasColumn("user_favourite_files", "is_favourite");

  if (hasFavFolders) {
    await knex.schema.alterTable("user_favourite_folders", function (table) {
      table.dropColumn("is_favourite");
    });
  }

  if (hasFavFiles) {
    await knex.schema.alterTable("user_favourite_files", function (table) {
      table.dropColumn("is_favourite");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasFavFolders = await knex.schema.hasColumn("user_favourite_folders", "is_favourite");
  const hasFavFiles = await knex.schema.hasColumn("user_favourite_files", "is_favourite");

  if (!hasFavFolders) {
    await knex.schema.alterTable("user_favourite_folders", function (table) {
      table.integer("is_favourite").defaultTo(0);
    });
  }

  if (!hasFavFiles) {
    await knex.schema.alterTable("user_favourite_files", function (table) {
      table.integer("is_favourite").defaultTo(0);
    });
  }
};
