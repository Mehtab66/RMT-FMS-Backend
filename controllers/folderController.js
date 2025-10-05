// controllers/folderController.js
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const knex = require("../config/db");
const {
  createFolder,
  getFolder,
  getUserFolders,
  updateFolder,
  deleteFolder,
  getFolderTree,
  ensureFolderPath,
  saveFile,
  toggleFolderFavourite,
  getFavouriteFolders,
  getTrashFolders,
  restoreFolder,
  permanentDeleteFolder,
} = require("../services/folderService");

const createfolder = async (req, res, next) => {
  try {
    console.log("into the  controller");
    
    const { name, parent_id } = req.body;
    req.resourceType = "folder";
    req.resourceId = parent_id || null;
    req.action = "create";

    const folder = await createFolder(name, parent_id, req.user.id);
    res.json(folder);
  } catch (err) {
    console.log("error in controller", err);
    
    next(err);
  }
};

const getfolder = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);
    req.resourceType = "folder";
    req.resourceId = folderId;
    req.action = "read";

    const folder = await getFolder(folderId);
    res.json(folder);
  } catch (err) {
    next(err);
  }
};

const getFolders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { parent_id, context } = req.query;
    
    let userFolders;
    
    // Handle different contexts
    if (context === 'favourites') {
      // Get folders from favourite folders that match the parent_id
      const favouriteFolders = await getFavouriteFolders(userId);
      userFolders = [];
      
      // Find folders that match the parent_id in the favourite structure
      const findFoldersInFavourites = (folders, targetParentId) => {
        for (const folder of folders) {
          if (folder.parent_id == targetParentId) {
            userFolders.push(folder);
          }
          // Recursively search in nested folders
          if (folder.nested_folders && folder.nested_folders.length > 0) {
            findFoldersInFavourites(folder.nested_folders, targetParentId);
          }
        }
      };
      
      if (parent_id) {
        findFoldersInFavourites(favouriteFolders, parent_id);
      } else {
        // If no parent_id, return all favourite folders
        userFolders = favouriteFolders;
      }
    } else {
      // Default dashboard context
      userFolders = await getUserFolders(userId);
      
      // Filter by parent_id if specified
      if (parent_id) {
        userFolders = userFolders.filter(folder => folder.parent_id == parent_id);
      }
    }
    
    // Get folders user has permission to access (only for dashboard context)
    let permissionFolders = [];
    if (context !== 'favourites') {
      const permissionQuery = knex("folders")
        .join("permissions", function() {
          this.on("folders.id", "=", "permissions.resource_id")
            .andOn("permissions.resource_type", "=", knex.raw("'folder'"));
        })
        .where("permissions.user_id", userId)
        .where("permissions.can_read", true)
        .andWhere("folders.is_deleted", false);
      
      if (parent_id) {
        permissionQuery.where("folders.parent_id", parent_id);
      }
      
      permissionFolders = await permissionQuery.select("folders.*");
    }
    
    // Combine and deduplicate folders
    const allFolders = [...userFolders];
    const existingIds = new Set(userFolders.map(f => f.id));
    
    for (const folder of permissionFolders) {
      if (!existingIds.has(folder.id)) {
        allFolders.push(folder);
      }
    }
    
    res.json({ folders: allFolders });
  } catch (err) {
    next(err);
  }
};

const updateFolderDetails = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);
    const { name } = req.body;

    req.resourceType = "folder";
    req.resourceId = folderId;
    req.action = "edit";

    const updatedFolder = await updateFolder(folderId, { name });
    res.json(updatedFolder);
  } catch (err) {
    next(err);
  }
};

const deleteFolderById = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);

    req.resourceType = "folder";
    req.resourceId = folderId;
    req.action = "delete";

    await deleteFolder(folderId);
    res.json({ message: "Folder deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getFolderTreeStructure = async (req, res, next) => {
  try {
    const folders = await getFolderTree(req.user.id);
    res.json(folders);
  } catch (err) {
    next(err);
  }
};

// NEW: upload folder with nested structure
// controllers/folderController.js - Update uploadFolderWithFiles

const uploadFolderWithFiles = async (req, res, next) => {
  try {
    const { parent_id = null } = req.body;
    const userId = req.user.id;
    
    console.log('Upload folder request - Files:', req.files?.length);
    console.log('Parent ID:', parent_id);
    console.log('User ID:', userId);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Log file paths for debugging
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        relativePath: file.webkitRelativePath || file.relativePath,
        size: file.size
      });
    });

    const uploadedFiles = await uploadFolder(req.files, parent_id, userId);
    
    res.json({ 
      message: 'Folder uploaded successfully with structure preserved',
      files: uploadedFiles,
      total: uploadedFiles.length
    });

  } catch (error) {
    console.error('Error in uploadFolderWithFiles:', error);
    next(error);
  }
};

const downloadFolder = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);
    console.log(`📁 Download folder function called for ID: ${folderId}, User: ${req.user.id}, Role: ${req.user.role}`);

    // First check if folder exists in database
    const folder = await knex("folders").where({ id: folderId }).first();
    console.log(`🔍 Database check for folder ${folderId}:`, folder ? `Found: ${folder.name}` : 'NOT FOUND');
    
    if (!folder) {
      console.log(`❌ Folder ${folderId} not found in database`);
      return res.status(404).json({ error: "Folder not found" });
    }
    
    console.log(`✅ Folder found: ${folder.name} (ID: ${folder.id})`);

    // Get all files in this folder and subfolders recursively with folder structure
    const getAllFilesInFolder = async (folderId, parentPath = "") => {
      const files = await knex("files").where("folder_id", folderId);
      const subfolders = await knex("folders").where("parent_id", folderId);
      
      // Add current folder's files with proper path
      const filesWithPath = files.map(file => ({
        ...file,
        relativePath: parentPath ? `${parentPath}/${file.name}` : file.name
      }));
      
      // Process subfolders recursively
      for (const subfolder of subfolders) {
        const subfolderPath = parentPath ? `${parentPath}/${subfolder.name}` : subfolder.name;
        const subfolderFiles = await getAllFilesInFolder(subfolder.id, subfolderPath);
        filesWithPath.push(...subfolderFiles);
      }
      
      return filesWithPath;
    };

    const allFiles = await getAllFilesInFolder(folderId);
    
    if (allFiles.length === 0) {
      console.log(`⚠️ Folder ${folderId} is empty, creating empty zip`);
      // Create an empty zip file instead of returning 404
      const archive = archiver("zip", { zlib: { level: 9 } });
      
      // Handle archive errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).json({ error: 'Failed to create archive' });
      });
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${folder.name}.zip"`);
      
      archive.pipe(res);
      archive.finalize();
      return;
    }

    // Create zip archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({ error: 'Failed to create archive' });
    });
    
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${folder.name}.zip"`);
    
    archive.pipe(res);

    // Add files to archive with proper folder structure
    for (const file of allFiles) {
      const filePath = file.file_path || file.path;
      if (filePath && fs.existsSync(filePath)) {
        const relativePath = file.relativePath || file.original_name || file.name;
        console.log(`📄 Adding file to archive: ${filePath} as ${relativePath}`);
        archive.file(filePath, { name: relativePath });
      } else {
        console.log(`⚠️ File not found or no path: ${file.name} (path: ${filePath})`);
      }
    }

    archive.finalize();
  } catch (err) {
    console.error("Error in downloadFolder:", err);
    next(err);
  }
};

const toggleFolderFavouriteController = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);

    req.resourceType = "folder";
    req.resourceId = folderId;
    req.action = "edit";

    const result = await toggleFolderFavourite(folderId);
    res.json(result);
  } catch (err) {
    console.error("Error in toggleFolderFavouriteController:", err);
    next(err);
  }
};

const getFavouriteFoldersController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const folders = await getFavouriteFolders(userId);
    res.json({ folders });
  } catch (err) {
    console.error("Error in getFavouriteFoldersController:", err);
    next(err);
  }
};

const getTrashFoldersController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const parentId = req.query.parent_id ? parseInt(req.query.parent_id) : null;
    const folders = await getTrashFolders(userId, parentId);
    res.json({ folders });
  } catch (err) {
    console.error("Error in getTrashFoldersController:", err);
    next(err);
  }
};

const restoreFolderController = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);
    const result = await restoreFolder(folderId);
    res.json(result);
  } catch (err) {
    console.error("Error in restoreFolderController:", err);
    next(err);
  }
};

const permanentDeleteFolderController = async (req, res, next) => {
  try {
    const folderId = parseInt(req.params.id);
    const result = await permanentDeleteFolder(folderId);
    res.json(result);
  } catch (err) {
    console.error("Error in permanentDeleteFolderController:", err);
    next(err);
  }
};

module.exports = {
  createfolder,
  getfolder,
  getFolders,
  updateFolderDetails,
  deleteFolderById,
  getFolderTreeStructure,
  uploadFolderWithFiles,
  downloadFolder,
  toggleFolderFavouriteController,
  getFavouriteFoldersController,
  getTrashFoldersController,
  restoreFolderController,
  permanentDeleteFolderController,
};
