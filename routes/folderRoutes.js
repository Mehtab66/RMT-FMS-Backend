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
const db = require("../config/db");
const router = express.Router();

// ✅ CORRECT ORDER: Specific routes first, dynamic routes last

// Folder CRUD operations
router.post("/", authMiddleware, checkPermission, createfolder);
router.get("/", authMiddleware, getFolders);

// ✅ Add /root route BEFORE /:id
router.get("/root", authMiddleware, async (req, res, next) => {
  console.log("into the get root folders");

  try {
    const folders = await db("folders")
      .whereNull("parent_id")
      .select("*")
      .orderBy("created_at", "desc");

    console.log(`Found ${folders.length} root folders`);
    res.json({ folders });
  } catch (err) {
    console.log("error in getting root folders", err);
    next(err);
  }
});

router.get("/tree/structure", authMiddleware, getFolderTreeStructure);

// ⚠️ Dynamic routes should come AFTER specific routes
router.get("/:id", authMiddleware, checkPermission, getfolder);
router.put("/:id", authMiddleware, checkPermission, updateFolderDetails);
router.delete("/:id", authMiddleware, checkPermission, deleteFolderById);

module.exports = router;
