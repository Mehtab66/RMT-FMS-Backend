// controllers/fileController.js
const knex = require("../config/db");
const {
  uploadFile,
  uploadFolder,
  getFile,
  getUserFiles,
  updateFile,
  deleteFile,
  getFileById,
  toggleFileFavourite,
  getFavouriteFiles,
  getTrashFiles,
  restoreFile,
  permanentDeleteFile,
} = require("../services/fileService");
const uploadFiles = async (req, res, next) => {
  try {
    const { folder_id } = req.body;
    const userId = req.user.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const trx = await knex.transaction();
    try {
      const uploaded = [];
      for (const file of req.files) {
        const fileUrl = `/api/files/${file.filename}/download`;
        const [fileId] = await trx("files").insert({
          name: file.originalname,
          original_name: file.originalname,
          folder_id: folder_id || null,
          file_path: file.path,
          file_url: fileUrl,
          mime_type: file.mimetype,
          size: file.size,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });
        uploaded.push({
          id: fileId,
          name: file.originalname,
          url: `/api/files/${fileId}/download`,
          size: file.size,
          mime_type: file.mimetype,
        });
      }
      await trx.commit();
      res.json({ message: "Files uploaded successfully", files: uploaded });
    } catch (err) {
      await trx.rollback();
      console.error("DB insert error:", err);
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      throw err;
    }
  } catch (err) {
    console.error("Upload error:", err);
    next(err);
  }
};

const uploadFolderFiles = async (req, res, next) => {
  console.log("🚀 Upload folder files controller called");
  console.log("Files received:", req.files?.length);
  console.log("Body received:", req.body);
  console.log("User:", req.user);

  try {
    const { folder_id, parent_id } = req.body;
    const targetFolderId = folder_id || parent_id;

    const files = req.files;
    if (!files || files.length === 0) {
      console.log("❌ No files uploaded");
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log("✅ Processing", files.length, "files for folder:", targetFolderId);
    console.log("User ID:", req.user.id);
    
    // Log file details
    files.forEach((file, index) => {
      console.log(`📄 File ${index + 1}:`, {
        originalname: file.originalname,
        filename: file.filename,
        webkitRelativePath: file.webkitRelativePath,
        size: file.size,
        mimetype: file.mimetype
      });
    });
    
    const uploadedFiles = await uploadFolder(files, targetFolderId, req.user.id);
    console.log("✅ Upload completed, returning", uploadedFiles.length, "files");

    res.json({ files: uploadedFiles });
  } catch (err) {
    console.error("❌ Error in uploadFolderFiles:", err);
    console.error("❌ Error stack:", err.stack);
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "download";

    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if file exists in local storage
    if (!file.file_path || !require("fs").existsSync(file.file_path)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set appropriate headers for download
    res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.original_name || file.name}"`
    );

    // Stream the file
    const fileStream = require("fs").createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error in downloadFile:", err);
    next(err);
  }
};

const getFiles = async (req, res, next) => {
  try {
    const { folder_id, context } = req.query;
    const userId = req.user.id;
    
    console.log(`🔍 getFiles called - folder_id: ${folder_id}, user_id: ${userId}, context: ${context}`);
    
    let userFiles;
    
    // Handle different contexts
    if (context === 'favourites') {
      // Get files from favourite folders that match the folder_id
      const favouriteFiles = await getFavouriteFiles(userId);
      userFiles = [];
      
      // Find files that match the folder_id in the favourite structure
      const findFilesInFavourites = (files, targetFolderId) => {
        for (const file of files) {
          if (file.folder_id == targetFolderId) {
            userFiles.push(file);
          }
        }
      };
      
      if (folder_id) {
        findFilesInFavourites(favouriteFiles, folder_id);
      } else {
        // If no folder_id, return all favourite files
        userFiles = favouriteFiles;
      }
    } else {
      // Default dashboard context
      userFiles = await getUserFiles(userId, folder_id);
    }
    
    console.log(`📁 User files found: ${userFiles.length}`);
    console.log(`📁 User files:`, userFiles.map(f => ({ id: f.id, name: f.name, folder_id: f.folder_id })));
    
    // Get files user has permission to access (only for dashboard context)
    let permissionFiles = [];
    if (context !== 'favourites') {
      const permissionQuery = knex("files")
        .join("permissions", function() {
          this.on("files.id", "=", "permissions.resource_id")
            .andOn("permissions.resource_type", "=", knex.raw("'file'"));
        })
        .where("permissions.user_id", userId)
        .where("permissions.can_read", true)
        .andWhere("files.is_deleted", false);
      
      if (folder_id) {
        permissionQuery.where("files.folder_id", folder_id);
      }
      
      permissionFiles = await permissionQuery.select("files.*");
      console.log(`🔐 Permission files found: ${permissionFiles.length}`);
      console.log(`🔐 Permission files:`, permissionFiles.map(f => ({ id: f.id, name: f.name, folder_id: f.folder_id })));
    }
    
    // Combine and deduplicate files
    const allFiles = [...userFiles];
    const existingIds = new Set(userFiles.map(f => f.id));
    
    for (const file of permissionFiles) {
      if (!existingIds.has(file.id)) {
        allFiles.push(file);
      }
    }
    
    console.log(`✅ Total files returned: ${allFiles.length}`);
    res.json({ files: allFiles });
  } catch (err) {
    console.error("Error in getFiles:", err);
    next(err);
  }
};

const updateFileDetails = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    const { name } = req.body;

    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "edit";

    const updatedFile = await updateFile(fileId, { name });
    res.json(updatedFile);
  } catch (err) {
    console.error("Error in updateFileDetails:", err);
    next(err);
  }
};

const deleteFileById = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);

    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "delete";

    await deleteFile(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error in deleteFileById:", err);
    next(err);
  }
};

const toggleFileFavouriteController = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);

    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "edit";

    const result = await toggleFileFavourite(fileId);
    res.json(result);
  } catch (err) {
    console.error("Error in toggleFileFavouriteController:", err);
    next(err);
  }
};

const getFavouriteFilesController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const files = await getFavouriteFiles(userId);
    res.json({ files });
  } catch (err) {
    console.error("Error in getFavouriteFilesController:", err);
    next(err);
  }
};

const getTrashFilesController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const files = await getTrashFiles(userId);
    res.json({ files });
  } catch (err) {
    console.error("Error in getTrashFilesController:", err);
    next(err);
  }
};

const restoreFileController = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    const result = await restoreFile(fileId);
    res.json(result);
  } catch (err) {
    console.error("Error in restoreFileController:", err);
    next(err);
  }
};

const permanentDeleteFileController = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    const result = await permanentDeleteFile(fileId);
    res.json(result);
  } catch (err) {
    console.error("Error in permanentDeleteFileController:", err);
    next(err);
  }
};

module.exports = {
  uploadFolderFiles,
  downloadFile,
  getFiles,
  updateFileDetails,
  deleteFileById,
  uploadFiles,
  toggleFileFavouriteController,
  getFavouriteFilesController,
  getTrashFilesController,
  restoreFileController,
  permanentDeleteFileController,
};
