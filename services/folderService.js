// services/folderService.js
const fs = require("fs");
const path = require("path");
const knex = require("../config/db");

// ensure nested folder structure exists
// services/folderService.js - Improve ensureFolderPath

const ensureFolderPath = async (folderPath, parentId, userId) => {
  if (!folderPath || folderPath === "." || folderPath === "/") {
    return parentId;
  }

  const parts = folderPath.split(/[\\/]/).filter((p) => p && p.trim() !== "");
  let currentParentId = parentId;

  for (const folderName of parts) {
    if (!folderName || folderName.trim() === "") continue;

    // Check if folder already exists
    let folder = await knex("folders")
      .where({
        name: folderName,
        parent_id: currentParentId,
      })
      .first();

    // Create folder if it doesn't exist
    if (!folder) {
      const [folderId] = await knex("folders").insert({
        name: folderName,
        parent_id: currentParentId,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      folder = { id: folderId, name: folderName };
      console.log(`Created folder: ${folderName} with ID: ${folderId}`);
    }

    currentParentId = folder.id;
  }

  return currentParentId;
};
// create single folder
const createFolder = async (name, parentId, userId) => {
  const [folderId] = await knex("folders").insert({
    name,
    parent_id: parentId,
    created_by: userId,
    created_at: new Date(),
  });
  return { id: folderId, name, parent_id: parentId };
};

// save file (physically + DB)
const saveFile = async (file, folderId, userId) => {
  const uploadDir = path.join(__dirname, "..", "uploads", String(folderId));
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  await file.mv(filePath);

  const [fileId] = await knex("files").insert({
    name: file.name,
    folder_id: folderId,
    created_by: userId,
    size: file.size,
    mime_type: file.mimetype,
    path: filePath,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { id: fileId, name: file.name, folder_id: folderId };
};

const getFolder = async (id) => {
  const folder = await knex("folders").where({ id }).first();
  if (!folder) throw new Error("Folder not found");
  return folder;
};

const getUserFolders = async (userId) => {
  return knex("folders")
    .where({ created_by: userId })
    .orderBy("created_at", "desc");
};

const updateFolder = async (folderId, updates) => {
  const [updatedFolder] = await knex("folders")
    .where({ id: folderId })
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .returning("*");
  return updatedFolder;
};

const deleteFolder = async (folderId) => {
  const files = await knex("files").where({ folder_id: folderId });
  const subfolders = await knex("folders").where({ parent_id: folderId });

  if (files.length > 0 || subfolders.length > 0) {
    throw new Error("Cannot delete folder that contains files or subfolders");
  }

  await knex("folders").where({ id: folderId }).del();
  await knex("permissions")
    .where({ resource_id: folderId, resource_type: "folder" })
    .del();
};

const getFolderTree = async (userId) => {
  return knex("folders")
    .select("id", "name", "parent_id")
    .where({ created_by: userId });
};

module.exports = {
  ensureFolderPath,
  createFolder,
  getFolder,
  getUserFolders,
  updateFolder,
  deleteFolder,
  getFolderTree,
  saveFile,
};
