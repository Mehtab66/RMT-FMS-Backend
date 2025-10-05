export async function up(knex) {
  const hasColumn = await knex.schema.hasColumn("permissions", "can_delete");

  if (hasColumn) {
    await knex.schema.table("permissions", (table) => {
      table.dropColumn("can_delete");
    });
  }
}

export async function down(knex) {
  const hasColumn = await knex.schema.hasColumn("permissions", "can_delete");

  if (!hasColumn) {
    await knex.schema.table("permissions", (table) => {
      table.boolean("can_delete").defaultTo(false);
    });
  }
}
