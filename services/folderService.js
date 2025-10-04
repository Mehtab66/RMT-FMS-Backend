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
  return folder; // Return null if not found, let permission middleware handle access control
};

const getUserFolders = async (userId) => {
  return knex("folders")
    .where({ created_by: userId })
    .andWhere("is_deleted", false)
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
  // Soft delete folder and cascade to children and files
  // Mark current folder
  await knex("folders")
    .where({ id: folderId })
    .update({ is_deleted: true, updated_at: new Date() });

  // Mark files in this folder
  await knex("files")
    .where({ folder_id: folderId })
    .update({ is_deleted: true, updated_at: new Date() });

  // Recurse into subfolders
  const subfolders = await knex("folders").where({ parent_id: folderId });
  for (const subfolder of subfolders) {
    await deleteFolder(subfolder.id);
  }
};

const getFolderTree = async (userId) => {
  return knex("folders")
    .select("id", "name", "parent_id")
    .where({ created_by: userId });
};

const toggleFolderFavourite = async (folderId) => {
  const folder = await getFolder(folderId);
  if (!folder) throw new Error("Folder not found");
  
  const newValue = !folder.is_faviourite;
  await knex("folders")
    .where({ id: folderId })
    .update({ is_faviourite: newValue, updated_at: new Date() });
  
  return { id: folderId, is_faviourite: newValue };
};

const getFavouriteFolders = async (userId) => {
  // Get all favourite folders and their nested content
  const favouriteFolders = await knex("folders")
    .where({ created_by: userId })
    .andWhere("is_deleted", false)
    .andWhere("is_faviourite", true)
    .orderBy("created_at", "desc");

  // For each favourite folder, get all its nested folders and files
  const result = [];
  
  for (const folder of favouriteFolders) {
    // Get all nested folders (recursively)
    const nestedFolders = await getNestedFolders(folder.id, userId);
    
    // Get all nested files
    const nestedFiles = await getNestedFiles(folder.id, userId);
    
    result.push({
      ...folder,
      nested_folders: nestedFolders,
      nested_files: nestedFiles
    });
  }
  
  return result;
};

// Helper function to get all nested folders recursively
const getNestedFolders = async (parentId, userId) => {
  const directChildren = await knex("folders")
    .where({ parent_id: parentId, created_by: userId })
    .andWhere("is_deleted", false)
    .orderBy("created_at", "desc");
  
  const result = [];
  
  for (const child of directChildren) {
    // Get nested folders and files for this child
    const nestedFolders = await getNestedFolders(child.id, userId);
    const nestedFiles = await getNestedFiles(child.id, userId);
    
    result.push({
      ...child,
      nested_folders: nestedFolders,
      nested_files: nestedFiles
    });
  }
  
  return result;
};

// Helper function to get all nested files
const getNestedFiles = async (folderId, userId) => {
  return knex("files")
    .where({ folder_id: folderId, created_by: userId })
    .andWhere("is_deleted", false)
    .orderBy("created_at", "desc");
};

const getTrashFolders = async (userId) => {
  return knex("folders")
    .where({ created_by: userId })
    .andWhere("is_deleted", true)
    .orderBy("created_at", "desc");
};

const restoreFolder = async (folderId) => {
  // Restore folder and all its children recursively
  await knex("folders")
    .where({ id: folderId })
    .update({ is_deleted: false, updated_at: new Date() });

  // Get all child folders
  const childFolders = await knex("folders")
    .where({ parent_id: folderId })
    .andWhere("is_deleted", true)
    .select("id");

  // Restore all child folders recursively
  for (const child of childFolders) {
    await restoreFolder(child.id);
  }

  // Restore all files in this folder
  await knex("files")
    .where({ folder_id: folderId })
    .andWhere("is_deleted", true)
    .update({ is_deleted: false, updated_at: new Date() });

  return { id: folderId, restored: true };
};

const permanentDeleteFolder = async (folderId) => {
  // Get folder info before deletion
  const folder = await knex("folders").where({ id: folderId }).first();
  if (!folder) {
    throw new Error("Folder not found");
  }

  // Get all child folders
  const childFolders = await knex("folders")
    .where({ parent_id: folderId })
    .andWhere("is_deleted", true)
    .select("id");

  // Permanently delete all child folders recursively
  for (const child of childFolders) {
    await permanentDeleteFolder(child.id);
  }

  // Permanently delete all files in this folder
  const files = await knex("files")
    .where({ folder_id: folderId })
    .andWhere("is_deleted", true)
    .select("*");

  for (const file of files) {
    // Delete physical file
    const fs = require("fs");
    if (file.file_path && fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }
  }

  // Delete file records
  await knex("files")
    .where({ folder_id: folderId })
    .andWhere("is_deleted", true)
    .del();

  // Delete folder record
  await knex("folders")
    .where({ id: folderId })
    .del();

  return { id: folderId, permanentlyDeleted: true };
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
  toggleFolderFavourite,
  getFavouriteFolders,
  getTrashFolders,
  getNestedFolders,
  getNestedFiles,
  restoreFolder,
  permanentDeleteFolder,
};
