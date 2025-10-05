// routes/fileRoutes.js - Remove express-fileupload and use only Multer
const express = require("express");
const multer = require("multer");
const {
  uploadFiles,
  uploadFolderWithFiles,
  downloadFile,
  getFiles,
  updateFileDetails,
  deleteFileById,
  toggleFileFavouriteController,
  getFavouriteFilesController,
  getTrashFilesController,
  restoreFileController,
  permanentDeleteFileController,
} = require("../controllers/fileController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");
const path = require("path"); // Add this if missing
const fs = require("fs"); // Add this if missing
const router = express.Router();
const db = require("../config/db");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure Multer for file uploads
// Use Disk Storage - More reliable than memory storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename but add unique suffix to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    // Use original name with unique suffix to avoid conflicts
    cb(null, `${baseName}_${uniqueSuffix}${fileExt}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 100, fields: 10, parts: 150 },
});

// Multer configuration that preserves folder structure
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024, files: 200, fields: 10, parts: 300 },
});

// Regular file upload
router.post(
  "/upload",
  authMiddleware,
  uploadMultiple.array("files", 100),
  (req, res, next) => {
    req.resourceType = "folder";
    req.resourceId = req.body.folder_id || null;
    req.action = "create";
    next();
  },
  checkPermission,
  uploadFiles
);

// Middleware to set resource info for uploads
const setUploadResourceInfo = (req, res, next) => {
  req.resourceType = "folder"; // Uploads are treated as folder operations
  req.resourceId = req.body.folder_id ? parseInt(req.body.folder_id) : null;
  req.action = "create";
  next();
};

// Folder upload - same endpoint but different handling
// Folder upload - Add Multer middleware to process the files with logging
router.post(
  "/upload-folder", 
  authMiddleware,
  // Add detailed logging middleware
  (req, res, next) => {
    console.log("🔍 [Multer Debug] Starting upload-folder request");
    console.log("🔍 [Multer Debug] Headers:", {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'authorization': req.headers['authorization'] ? 'present' : 'missing'
    });
    console.log("🔍 [Multer Debug] Body fields:", Object.keys(req.body));
    console.log("🔍 [Multer Debug] Query params:", req.query);
    next();
  },
  
  // Multer middleware with error handling
  (req, res, next) => {
    upload.array("files", 200)(req, res, function(err) {
      if (err) {
        console.error("❌ [Multer Error]", err);
        console.error("❌ [Multer Error] Details:", {
          code: err.code,
          field: err.field,
          message: err.message
        });
        return res.status(400).json({
          message: "File upload failed",
          error: err.message
        });
      }
      console.log("✅ [Multer Success] Files processed:", {
        fileCount: req.files ? req.files.length : 0,
        files: req.files ? req.files.map(f => ({
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          filename: f.filename
        })) : 'no files'
      });
      console.log("✅ [Multer Success] Body after Multer:", Object.keys(req.body));
      next();
    });
  },
  
  uploadFolderWithFiles
);

// Middleware to set resource info for permission checking
const setFileResourceInfo = (req, res, next) => {
  const fileId = parseInt(req.params.id);
  req.resourceType = "file";
  req.resourceId = fileId;

  // Set action based on HTTP method and path
  if (req.method === "GET" && req.path.includes("/download")) {
    req.action = "download";
  } else if (req.method === "GET") {
    req.action = "read";
  } else if (req.method === "PUT") {
    req.action = "edit";
  } else if (req.method === "DELETE") {
    req.action = "delete";
  } else if (req.method === "POST" && req.path.includes("/favourite/toggle")) {
    req.action = "edit";
  }

  next();
};

// Other routes remain the same...
router.get(
  "/download/:id",
  authMiddleware,
  setFileResourceInfo,
  checkPermission,
  downloadFile
);
router.get("/", authMiddleware, getFiles);
router.put(
  "/:id",
  authMiddleware,
  setFileResourceInfo,
  checkPermission,
  updateFileDetails
);
router.delete(
  "/:id",
  authMiddleware,
  setFileResourceInfo,
  checkPermission,
  deleteFileById
);

// Favourites and Trash routes
router.post(
  "/:id/favourite/toggle",
  authMiddleware,
  setFileResourceInfo,
  checkPermission,
  toggleFileFavouriteController
);
router.get("/favourites", authMiddleware, getFavouriteFilesController);
router.get("/trash", authMiddleware, getTrashFilesController);
router.post("/:id/restore", authMiddleware, restoreFileController);
router.delete("/:id/permanent", authMiddleware, permanentDeleteFileController);

// Favourites navigation routes (with context support)
router.get("/favourites/navigate", authMiddleware, (req, res, next) => {
  // Force context to favourites for this route
  req.query.context = "favourites";
  getFiles(req, res, next);
});

// General navigation route that can handle both dashboard and favourites context
router.get("/navigate", authMiddleware, getFiles);

router.get("/root", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get root files created by user
    const userFiles = await db("files")
      .whereNull("folder_id")
      .where("created_by", userId)
      .andWhere("is_deleted", false)
      .select("*")
      .orderBy("created_at", "desc");

    // Get root files user has permission to access
    const permissionFiles = await db("files")
      .join("permissions", function () {
        this.on("files.id", "=", "permissions.resource_id").andOn(
          "permissions.resource_type",
          "=",
          db.raw("'file'")
        );
      })
      .whereNull("files.folder_id")
      .where("permissions.user_id", userId)
      .where("permissions.can_read", true)
      .andWhere("files.is_deleted", false)
      .select("files.*")
      .orderBy("files.created_at", "desc");

    // Combine and deduplicate files
    const allFiles = [...userFiles];
    const existingIds = new Set(userFiles.map((f) => f.id));

    for (const file of permissionFiles) {
      if (!existingIds.has(file.id)) {
        allFiles.push(file);
      }
    }

    res.json({ files: allFiles });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
