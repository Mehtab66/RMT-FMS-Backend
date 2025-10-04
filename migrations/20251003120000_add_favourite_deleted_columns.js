exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable("files", function (table) {
      table.boolean("is_faviourite").notNullable().defaultTo(false);
      table.boolean("is_deleted").notNullable().defaultTo(false);
      table.index(["is_faviourite"]);
      table.index(["is_deleted"]);
    }),
    knex.schema.alterTable("folders", function (table) {
      table.boolean("is_faviourite").notNullable().defaultTo(false);
      table.boolean("is_deleted").notNullable().defaultTo(false);
      table.index(["is_faviourite"]);
      table.index(["is_deleted"]);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.alterTable("files", function (table) {
      table.dropIndex(["is_faviourite"]);
      table.dropIndex(["is_deleted"]);
      table.dropColumn("is_faviourite");
      table.dropColumn("is_deleted");
    }),
    knex.schema.alterTable("folders", function (table) {
      table.dropIndex(["is_faviourite"]);
      table.dropIndex(["is_deleted"]);
      table.dropColumn("is_faviourite");
      table.dropColumn("is_deleted");
    }),
  ]);
};
