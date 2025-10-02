// controllers/folderController.js
const fs = require("fs");
const path = require("path");
const {
  createFolder,
  getFolder,
  getUserFolders,
  updateFolder,
  deleteFolder,
  getFolderTree,
  ensureFolderPath,
  saveFile,
} = require("../services/folderService");

const createfolder = async (req, res, next) => {
  try {
    const { name, parent_id } = req.body;
    req.resourceType = "folder";
    req.resourceId = parent_id || null;
    req.action = "create";

    const folder = await createFolder(name, parent_id, req.user.id);
    res.json(folder);
  } catch (err) {
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
    const folders = await getUserFolders(req.user.id);
    res.json({ folders });
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

module.exports = {
  createfolder,
  getfolder,
  getFolders,
  updateFolderDetails,
  deleteFolderById,
  getFolderTreeStructure,
  uploadFolderWithFiles,
};
