// services/fileService.js
const knex = require("../config/db");
const path = require("path");
const fs = require("fs");

const uploadFile = async (file, folderId, userId, customName = null) => {
  console.log("=== UPLOAD FILE SERVICE START ===");
  console.log("File object:", {
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
  });

  const trx = await knex.transaction();

  try {
    const fileName = customName || file.originalname;

    // Use the path where multer saved the file
    const filePath = file.path;
    const fileUrl = `/api/files/${file.filename}/download`;

    console.log("File will be stored at:", filePath);
    console.log("File URL will be:", fileUrl);

    // Insert into DB
    const [fileId] = await trx("files").insert({
      name: file.originalname, // Use original filename for display
      original_name: file.originalname,
      folder_id: folderId || null,
      file_path: filePath,
      file_url: fileUrl,
      mime_type: file.mimetype,
      size: file.size,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await trx.commit();

    console.log("File successfully inserted into database with ID:", fileId);

    return {
      id: fileId,
      name: file.originalname, // Use original filename for display
      url: `/api/files/${fileId}/download`,
      size: file.size,
      mime_type: file.mimetype,
      file_path: filePath,
    };
  } catch (error) {
    console.error("Error in uploadFile service:", error);
    await trx.rollback();

    // Clean up the uploaded file if DB insert failed
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log("Cleaned up file after error:", file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    throw error;
  }
};

const uploadFolder = async (files, parentId, userId) => {
  console.log("🚀 UPLOAD FOLDER SERVICE START");
  console.log("Files count:", files.length);
  console.log("Parent ID:", parentId);
  console.log("User ID:", userId);

  // Validate inputs
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Convert parentId to null if it's undefined or empty string
  const targetParentId =
    parentId && parentId !== "" ? parseInt(parentId) : null;
  console.log("Target parent ID:", targetParentId);

  // Verify user exists
  const user = await knex("users").where({ id: userId }).first();
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }
  console.log("✅ User verified:", user.username);

  const uploadedFiles = [];
  const folderMap = new Map(); // Map to store created folder IDs by path

  try {
    console.log("🔍 Starting folder upload process...");

    // Process each file and create necessary folder structure
    for (const file of files) {
      // For folder uploads, use webkitRelativePath if available, otherwise fall back to originalname
      const filePath =
        file.webkitRelativePath || file.originalname || file.name;
      console.log(`📁 Processing file: ${filePath}`);

      const pathParts = filePath.split("/").filter((part) => part.length > 0);
      console.log(`📁 Path parts:`, pathParts);

      // Get folder path (everything except the last part which is the filename)
      const folderPathParts = pathParts.slice(0, -1);
      const fileName = pathParts[pathParts.length - 1];

      console.log(`📁 Folder path parts:`, folderPathParts);
      console.log(`📄 File name:`, fileName);

      let currentParentId = targetParentId;

      // Create folder structure if needed
      if (folderPathParts.length > 0) {
        let currentPath = "";

        for (let i = 0; i < folderPathParts.length; i++) {
          currentPath += (currentPath ? "/" : "") + folderPathParts[i];
          console.log(
            `📁 Processing folder: ${folderPathParts[i]}, current path: ${currentPath}`
          );

          if (!folderMap.has(currentPath)) {
            // Check if folder already exists in database
            const existingFolder = await knex("folders")
              .where({ name: folderPathParts[i], parent_id: currentParentId })
              .first();

            if (existingFolder) {
              console.log(
                `✅ Folder already exists: ${folderPathParts[i]} (ID: ${existingFolder.id})`
              );
              folderMap.set(currentPath, existingFolder.id);
              currentParentId = existingFolder.id;
            } else {
              // Create this folder
              console.log(
                `🔨 Creating folder: ${folderPathParts[i]} with parent_id: ${currentParentId}`
              );
              try {
                const [folderId] = await knex("folders").insert({
                  name: folderPathParts[i], // Use original folder name
                  parent_id: currentParentId,
                  created_by: userId,
                  created_at: new Date(),
                  updated_at: new Date(),
                });

                folderMap.set(currentPath, folderId);
                console.log(
                  `✅ SUCCESS: Created folder: ${folderPathParts[i]} (ID: ${folderId}) in parent ${currentParentId}`
                );
                currentParentId = folderId;
              } catch (insertError) {
                console.error(
                  `❌ ERROR creating folder ${folderPathParts[i]}:`,
                  insertError
                );
                throw insertError;
              }
            }
          } else {
            currentParentId = folderMap.get(currentPath);
            console.log(
              `✅ Using existing folder: ${folderPathParts[i]} (ID: ${currentParentId})`
            );
          }
        }
      }

      // Upload the file to the correct folder
      const fileUrl = `/api/files/${file.filename}/download`;

      console.log(
        `📄 Uploading file: ${fileName} to folder ${currentParentId}`
      );
      try {
        const [fileId] = await knex("files").insert({
          name: fileName, // Use the filename from the path
          original_name: file.originalname || file.name, // Keep original name
          folder_id: currentParentId,
          file_path: file.path,
          file_url: fileUrl,
          mime_type: file.mimetype,
          size: file.size,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });

        uploadedFiles.push({
          id: fileId,
          name: fileName, // Use the filename from the path
          url: `/api/files/${fileId}/download`,
          size: file.size,
          mime_type: file.mimetype,
          folder_id: currentParentId,
        });

        console.log(
          `✅ SUCCESS: Uploaded file: ${fileName} (ID: ${fileId}) to folder ${currentParentId}`
        );
      } catch (fileError) {
        console.error(`❌ ERROR uploading file ${fileName}:`, fileError);
        throw fileError;
      }
    }

    console.log(
      `✅ UPLOAD COMPLETED: Successfully uploaded ${uploadedFiles.length} files with nested folder structure`
    );
    console.log("✅ Created folders:", Array.from(folderMap.entries()));

    return uploadedFiles;
  } catch (error) {
    console.error("❌ UPLOAD ERROR in uploadFolder:", error);
    console.error("❌ Error details:", error.message);
    throw error;
  }
};

const getFileById = async (fileId) => {
  return knex("files").where({ id: fileId }).first();
};

const getFile = async (fileId) => {
  const file = await getFileById(fileId);
  if (!file) throw new Error("File not found");
  return file;
};

const getUserFiles = async (userId, folder_id = null) => {
  let query = knex("files")
    .leftJoin("folders", "files.folder_id", "folders.id")
    .leftJoin("user_favourite_files", function() {
      this.on("files.id", "=", "user_favourite_files.file_id")
          .andOn("user_favourite_files.user_id", "=", userId);
    })
    .select("files.*", "folders.name as folder_name", knex.raw("CASE WHEN user_favourite_files.file_id IS NOT NULL THEN true ELSE false END as favourited"))
    .where("files.created_by", userId)
    .andWhere("files.is_deleted", false);

  if (folder_id) {
    query = query.where("files.folder_id", folder_id);
  }

  const result = await query.orderBy("files.created_at", "desc");
  
  console.log("🔍 [getUserFiles] Result for user:", userId, "folder:", folder_id, "files:", result.length);
  if (result.length > 0) {
    console.log("🔍 [getUserFiles] First file favourited:", result[0].favourited);
  }
  
  return result;
};

const updateFile = async (fileId, updates) => {
  await knex("files")
    .where({ id: fileId })
    .update({
      ...updates,
      updated_at: new Date(),
    });

  return knex("files").where({ id: fileId }).first();
};

const deleteFile = async (fileId) => {
  // Soft delete: mark as deleted, do not remove physical file immediately
  await knex("files")
    .where({ id: fileId })
    .update({ is_deleted: true, updated_at: new Date() });
};
const toggleFileFavourite = async (fileId, userId) => {
  // Check if file exists
  const file = await knex("files").where({ id: fileId }).first();
  if (!file) throw new Error("File not found");

  // Check if user has already favourited this file
  const existingFav = await knex("user_favourite_files")
    .where({ user_id: userId, file_id: fileId })
    .first();

  if (existingFav) {
    // Unfavourite (delete record)
    await knex("user_favourite_files")
      .where({ user_id: userId, file_id: fileId })
      .delete();
    return { id: fileId, is_favourited: false };
  } else {
    // Favourite (insert record)
    await knex("user_favourite_files").insert({
      user_id: userId,
      file_id: fileId,
      created_at: new Date(),
    });
    return { id: fileId, is_favourited: true };
  }
};

const getFavouriteFiles = async (userId) => {
  const favouriteFiles = await knex("user_favourite_files as uf")
    .join("files as f", "uf.file_id", "f.id")
    .leftJoin("folders as fo", "f.folder_id", "fo.id")
    .select(
      "f.id",
      "f.name",
      "f.folder_id",
      "fo.name as folder_name",
      "f.file_path",
      "f.file_url",
      "f.mime_type",
      "f.size",
      "f.original_name",
      "f.created_at",
      "f.updated_at",
      "f.is_faviourite",
      "f.is_deleted"
    )
    .where("uf.user_id", userId)
    .andWhere("f.is_deleted", false)
    .orderBy("f.created_at", "desc");

  return favouriteFiles;
};

// Helper function to get all files from a folder recursively
const getFilesFromFolderRecursively = async (folderId, userId) => {
  // Get direct files in this folder
  const directFiles = await knex("files")
    .leftJoin("folders", "files.folder_id", "folders.id")
    .select("files.*", "folders.name as folder_name")
    .where("files.folder_id", folderId)
    .andWhere("files.created_by", userId)
    .andWhere("files.is_deleted", false)
    .orderBy("files.created_at", "desc");

  // Get all subfolders
  const subfolders = await knex("folders")
    .where({ parent_id: folderId, created_by: userId })
    .andWhere("is_deleted", false)
    .select("id");

  // Get files from all subfolders recursively
  let nestedFiles = [];
  for (const subfolder of subfolders) {
    const subfolderFiles = await getFilesFromFolderRecursively(
      subfolder.id,
      userId
    );
    nestedFiles.push(...subfolderFiles);
  }

  return [...directFiles, ...nestedFiles];
};

const getTrashFiles = async (userId, folderId = null) => {
  console.log(
    `🔍 Backend getTrashFiles called - userId: ${userId}, folderId: ${folderId}`
  );

  if (folderId === null) {
    // Get only root-level deleted files (files with no folder or whose folder is not deleted)
    const files = await knex("files")
      .leftJoin("folders", "files.folder_id", "folders.id")
      .select("files.*", "folders.name as folder_name")
      .where("files.created_by", userId)
      .andWhere("files.is_deleted", true)
      .andWhere(function () {
        this.whereNull("files.folder_id").orWhereNotExists(function () {
          this.select("*")
            .from("folders as folder")
            .whereRaw("folder.id = files.folder_id")
            .andWhere("folder.is_deleted", true);
        });
      })
      .orderBy("files.created_at", "desc");

    console.log(
      `📁 Backend returning ${files.length} root-level trash files:`,
      files.map((f) => ({ id: f.id, name: f.name, folder_id: f.folder_id }))
    );
    return files;
  } else {
    // Get files within a specific folder
    const files = await knex("files")
      .leftJoin("folders", "files.folder_id", "folders.id")
      .select("files.*", "folders.name as folder_name")
      .where("files.created_by", userId)
      .andWhere("files.folder_id", folderId)
      .andWhere("files.is_deleted", true)
      .orderBy("files.created_at", "desc");

    console.log(
      `📁 Backend returning ${files.length} trash files for folder ${folderId}:`,
      files.map((f) => ({ id: f.id, name: f.name, folder_id: f.folder_id }))
    );
    return files;
  }
};

const restoreFile = async (fileId) => {
  await knex("files")
    .where({ id: fileId })
    .update({ is_deleted: false, updated_at: new Date() });

  return { id: fileId, restored: true };
};

const permanentDeleteFile = async (fileId) => {
  // Get file info before deletion
  const file = await knex("files").where({ id: fileId }).first();
  if (!file) {
    throw new Error("File not found");
  }

  // Delete physical file
  const fs = require("fs");
  if (file.file_path && fs.existsSync(file.file_path)) {
    fs.unlinkSync(file.file_path);
  }

  // Delete file record
  await knex("files").where({ id: fileId }).del();

  return { id: fileId, permanentlyDeleted: true };
};

module.exports = {
  uploadFile,
  uploadFolder,
  getFile,
  getFileById,
  getUserFiles,
  updateFile,
  deleteFile,
  toggleFileFavourite,
  getFavouriteFiles,
  getTrashFiles,
  getFilesFromFolderRecursively,
  restoreFile,
  permanentDeleteFile,
};
