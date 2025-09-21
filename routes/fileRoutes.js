const express = require("express");
const multer = require("multer");
const {
  uploadSingleFile,
  uploadFolderFiles,
  downloadFile,
} = require("../controllers/fileController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  checkPermission,
  upload.single("file"),
  uploadSingleFile
);
router.post(
  "/upload-folder",
  authMiddleware,
  checkPermission,
  upload.array("files"),
  uploadFolderFiles
);
router.get("/:id/download", authMiddleware, checkPermission, downloadFile);

module.exports = router;
