exports.up = async function (knex) {
  // Check if columns already exist using raw SQL
  const columns = await knex.raw(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'files'
  `);
  
  const existingColumns = columns[0].map(col => col.COLUMN_NAME);
  const hasMimeType = existingColumns.includes('mime_type');
  const hasSize = existingColumns.includes('size');
  const hasOriginalName = existingColumns.includes('original_name');
  const hasUpdatedAt = existingColumns.includes('updated_at');
  const hasCloudinaryPublicId = existingColumns.includes('cloudinary_public_id');
  const hasCloudinaryUrl = existingColumns.includes('cloudinary_url');

  return knex.schema.alterTable("files", function (table) {
    // Rename cloudinary fields to local storage fields (only if they exist)
    if (hasCloudinaryPublicId) {
      table.renameColumn("cloudinary_public_id", "file_path");
    }
    if (hasCloudinaryUrl) {
      table.renameColumn("cloudinary_url", "file_url");
    }

    // Add new fields for better file management (only if they don't exist)
    if (!hasMimeType) {
      table.string("mime_type"); // e.g., 'image/jpeg', 'application/pdf'
    }
    if (!hasSize) {
      table.bigInteger("size"); // File size in bytes
    }
    if (!hasOriginalName) {
      table.string("original_name"); // Original filename from user
    }
    if (!hasUpdatedAt) {
      table.timestamp("updated_at");
    }

    // Note: Foreign keys for folder_id and created_by already exist from initial table creation
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
