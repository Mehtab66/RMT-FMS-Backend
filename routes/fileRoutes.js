// routes/fileRoutes.js - Remove express-fileupload and use only Multer
const express = require("express");
const multer = require("multer");
const {
  uploadFiles,
  uploadFolderFiles,
  downloadFile,
  getFiles,
  updateFileDetails,
  deleteFileById,
} = require("../controllers/fileController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");
const path = require("path"); // Add this if missing
const fs = require("fs"); // Add this if missing
const router = express.Router();
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
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    cb(null, `${baseName}-${uniqueSuffix}${fileExt}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const uploadMultiple = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 100 * 1024 * 1024,  files: 50,  fields: 10, parts: 60, }, })

// Multer configuration that preserves folder structure
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 100 * 1024 * 1024,  files: 1,  fields: 10,  parts: 20,  }, });

// Regular file upload
router.post( "/upload", authMiddleware, (req, res, next) => { req.resourceType = "folder"; req.resourceId = req.body.folder_id || null; req.action = "create"; next(); }, checkPermission, uploadMultiple.array("files", 20), uploadFiles );

// Folder upload - same endpoint but different handling
router.post(
  "/upload-folder",
  authMiddleware,
  checkPermission,
  upload.array("files", 100), // more files for folders
  uploadFolderFiles
);

// Other routes remain the same...
router.get("/download/:id", authMiddleware, checkPermission, downloadFile);
router.get("/", authMiddleware, getFiles);
router.put("/:id", authMiddleware, checkPermission, updateFileDetails);
router.delete("/:id", authMiddleware, checkPermission, deleteFileById);

module.exports = router;
