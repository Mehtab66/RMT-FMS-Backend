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
  const targetParentId = parentId && parentId !== "" ? parseInt(parentId) : null;
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
      const filePath = file.webkitRelativePath || file.originalname || file.name;
      console.log(`📁 Processing file: ${filePath}`);
      
      const pathParts = filePath.split('/').filter(part => part.length > 0);
      console.log(`📁 Path parts:`, pathParts);
      
      // Get folder path (everything except the last part which is the filename)
      const folderPathParts = pathParts.slice(0, -1);
      const fileName = pathParts[pathParts.length - 1];
      
      console.log(`📁 Folder path parts:`, folderPathParts);
      console.log(`📄 File name:`, fileName);
      
      let currentParentId = targetParentId;
      
      // Create folder structure if needed
      if (folderPathParts.length > 0) {
        let currentPath = '';
        
        for (let i = 0; i < folderPathParts.length; i++) {
          currentPath += (currentPath ? '/' : '') + folderPathParts[i];
          console.log(`📁 Processing folder: ${folderPathParts[i]}, current path: ${currentPath}`);
          
          if (!folderMap.has(currentPath)) {
            // Check if folder already exists in database
            const existingFolder = await knex("folders")
              .where({ name: folderPathParts[i], parent_id: currentParentId })
              .first();
            
            if (existingFolder) {
              console.log(`✅ Folder already exists: ${folderPathParts[i]} (ID: ${existingFolder.id})`);
              folderMap.set(currentPath, existingFolder.id);
              currentParentId = existingFolder.id;
            } else {
              // Create this folder
              console.log(`🔨 Creating folder: ${folderPathParts[i]} with parent_id: ${currentParentId}`);
              try {
                const [folderId] = await knex("folders").insert({
                  name: folderPathParts[i], // Use original folder name
                  parent_id: currentParentId,
                  created_by: userId,
                  created_at: new Date(),
                  updated_at: new Date(),
                });
                
                folderMap.set(currentPath, folderId);
                console.log(`✅ SUCCESS: Created folder: ${folderPathParts[i]} (ID: ${folderId}) in parent ${currentParentId}`);
                currentParentId = folderId;
              } catch (insertError) {
                console.error(`❌ ERROR creating folder ${folderPathParts[i]}:`, insertError);
                throw insertError;
              }
            }
          } else {
            currentParentId = folderMap.get(currentPath);
            console.log(`✅ Using existing folder: ${folderPathParts[i]} (ID: ${currentParentId})`);
          }
        }
      }
      
      // Upload the file to the correct folder
      const fileUrl = `/api/files/${file.filename}/download`;
      
      console.log(`📄 Uploading file: ${fileName} to folder ${currentParentId}`);
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
        
        console.log(`✅ SUCCESS: Uploaded file: ${fileName} (ID: ${fileId}) to folder ${currentParentId}`);
      } catch (fileError) {
        console.error(`❌ ERROR uploading file ${fileName}:`, fileError);
        throw fileError;
      }
    }

    console.log(`✅ UPLOAD COMPLETED: Successfully uploaded ${uploadedFiles.length} files with nested folder structure`);
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
    .select("files.*", "folders.name as folder_name")
    .where("files.created_by", userId)
    .andWhere("files.is_deleted", false);

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
  // Soft delete: mark as deleted, do not remove physical file immediately
  await knex("files")
    .where({ id: fileId })
    .update({ is_deleted: true, updated_at: new Date() });
};

const toggleFileFavourite = async (fileId) => {
  const file = await getFileById(fileId);
  if (!file) throw new Error("File not found");
  
  const newValue = !file.is_faviourite;
  await knex("files")
    .where({ id: fileId })
    .update({ is_faviourite: newValue, updated_at: new Date() });
  
  return { id: fileId, is_faviourite: newValue };
};

const getFavouriteFiles = async (userId) => {
  // Get files that are directly marked as favourite
  const directFavouriteFiles = await knex("files")
    .leftJoin("folders", "files.folder_id", "folders.id")
    .select("files.*", "folders.name as folder_name")
    .where("files.created_by", userId)
    .andWhere("files.is_deleted", false)
    .andWhere("files.is_faviourite", true)
    .orderBy("files.created_at", "desc");

  // Get files from favourite folders
  const favouriteFolderIds = await knex("folders")
    .where({ created_by: userId })
    .andWhere("is_deleted", false)
    .andWhere("is_faviourite", true)
    .select("id");

  const folderIds = favouriteFolderIds.map(f => f.id);
  
  // Get all files from favourite folders (including nested ones)
  const filesFromFavouriteFolders = [];
  for (const folderId of folderIds) {
    const nestedFiles = await getFilesFromFolderRecursively(folderId, userId);
    filesFromFavouriteFolders.push(...nestedFiles);
  }

  // Combine both lists and remove duplicates
  const allFiles = [...directFavouriteFiles, ...filesFromFavouriteFolders];
  const uniqueFiles = allFiles.filter((file, index, self) => 
    index === self.findIndex(f => f.id === file.id)
  );

  return uniqueFiles;
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
    const subfolderFiles = await getFilesFromFolderRecursively(subfolder.id, userId);
    nestedFiles.push(...subfolderFiles);
  }

  return [...directFiles, ...nestedFiles];
};

const getTrashFiles = async (userId) => {
  return knex("files")
    .leftJoin("folders", "files.folder_id", "folders.id")
    .select("files.*", "folders.name as folder_name")
    .where("files.created_by", userId)
    .andWhere("files.is_deleted", true)
    .orderBy("files.created_at", "desc");
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
  await knex("files")
    .where({ id: fileId })
    .del();

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
