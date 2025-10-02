exports.up = function (knex) {
  return knex.schema.alterTable("files", function (table) {
    // Rename cloudinary fields to local storage fields
    table.renameColumn("cloudinary_public_id", "file_path");
    table.renameColumn("cloudinary_url", "file_url");

    // Add new fields for better file management
    table.string("mime_type"); // e.g., 'image/jpeg', 'application/pdf'
    table.bigInteger("size"); // File size in bytes
    table.string("original_name"); // Original filename from user
    table.timestamp("updated_at");

    // Add foreign keys for data integrity
    table
      .foreign("folder_id")
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
  return knex.schema.alterTable("files", function (table) {
    table.renameColumn("file_path", "cloudinary_public_id");
    table.renameColumn("file_url", "cloudinary_url");
    table.dropColumn("mime_type");
    table.dropColumn("size");
    table.dropColumn("original_name");
    table.dropColumn("updated_at");
  });
};
