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
      name: fileName,
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
      name: fileName,
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
  console.log("Upload folder service - Processing", files.length, "files");

  const uploadPromises = files.map((file) =>
    uploadFile(file, parentId, userId)
  );

  return Promise.all(uploadPromises);
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
    .select("files.*", "folders.name as folder_name")
    .where("files.created_by", userId);

  if (folder_id) {
    query = query.where("files.folder_id", folder_id);
  }

  return query.orderBy("files.created_at", "desc");
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
  const file = await getFileById(fileId);

  // Delete physical file from local storage
  if (file && file.file_path && fs.existsSync(file.file_path)) {
    fs.unlinkSync(file.file_path);
  }

  await knex("files").where({ id: fileId }).del();
  await knex("permissions")
    .where({
      resource_id: fileId,
      resource_type: "file",
    })
    .del();
};

module.exports = {
  uploadFile,
  uploadFolder,
  getFile,
  getFileById,
  getUserFiles,
  updateFile,
  deleteFile, 
};
