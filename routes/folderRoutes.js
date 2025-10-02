// routes/folderRoutes.js - Remove express-fileupload
const express = require("express");
const {
  createfolder,
  getfolder,
  getFolders,
  updateFolderDetails,
  deleteFolderById,
  getFolderTreeStructure,
} = require("../controllers/folderController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

// Remove the fileUpload middleware from here
// Folder CRUD operations (no file uploads in these routes)
router.post("/", authMiddleware, checkPermission, createfolder);
router.get("/", authMiddleware, getFolders);
router.get("/:id", authMiddleware, checkPermission, getfolder);
router.put("/:id", authMiddleware, checkPermission, updateFolderDetails);
router.delete("/:id", authMiddleware, checkPermission, deleteFolderById);
router.get("/tree/structure", authMiddleware, getFolderTreeStructure);

module.exports = router;
