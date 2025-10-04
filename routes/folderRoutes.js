const express = require("express");
const {
  createfolder,
  getfolder,
  getFolders,
  updateFolderDetails,
  deleteFolderById,
  getFolderTreeStructure,
  downloadFolder,
  toggleFolderFavouriteController,
  getFavouriteFoldersController,
  getTrashFoldersController,
  restoreFolderController,
  permanentDeleteFolderController,
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
    const userId = req.user.id;
    
    // Get root folders created by user
    const userFolders = await db("folders")
      .whereNull("parent_id")
      .where("created_by", userId)
      .andWhere("is_deleted", false)
      .select("*")
      .orderBy("created_at", "desc");
    
    // Get root folders user has permission to access
    const permissionFolders = await db("folders")
      .join("permissions", function() {
        this.on("folders.id", "=", "permissions.resource_id")
          .andOn("permissions.resource_type", "=", db.raw("'folder'"));
      })
      .whereNull("folders.parent_id")
      .where("permissions.user_id", userId)
      .where("permissions.can_read", true)
      .andWhere("folders.is_deleted", false)
      .select("folders.*")
      .orderBy("folders.created_at", "desc");
    
    // Combine and deduplicate folders
    const allFolders = [...userFolders];
    const existingIds = new Set(userFolders.map(f => f.id));
    
    for (const folder of permissionFolders) {
      if (!existingIds.has(folder.id)) {
        allFolders.push(folder);
      }
    }

    console.log(`Found ${allFolders.length} root folders`);
    res.json({ folders: allFolders });
  } catch (err) {
    console.log("error in getting root folders", err);
    next(err);
  }
});

// Middleware to set resource info for permission checking
const setResourceInfo = (req, res, next) => {
  const folderId = parseInt(req.params.id);
  req.resourceType = "folder";
  req.resourceId = folderId;
  
  // Set action based on HTTP method
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
  
  console.log(`🔧 setResourceInfo: Set resourceType=${req.resourceType}, resourceId=${req.resourceId}, action=${req.action}`);
  next();
};

router.get("/tree/structure", authMiddleware, getFolderTreeStructure);

// Favourites and Trash routes
router.post("/:id/favourite/toggle", authMiddleware, setResourceInfo, checkPermission, toggleFolderFavouriteController);
router.get("/favourites", authMiddleware, getFavouriteFoldersController);
router.get("/trash", authMiddleware, getTrashFoldersController);
router.post("/:id/restore", authMiddleware, restoreFolderController);
router.delete("/:id/permanent", authMiddleware, permanentDeleteFolderController);

// ⚠️ Dynamic routes should come AFTER specific routes
// IMPORTANT: More specific routes must come before general ones

// Favourites navigation routes (with context support)
router.get("/favourites/navigate", authMiddleware, (req, res, next) => {
  // Force context to favourites for this route
  req.query.context = 'favourites';
  getFolders(req, res, next);
});

// General navigation route that can handle both dashboard and favourites context
router.get("/navigate", authMiddleware, getFolders);

// Dynamic routes (must come after specific routes)
router.get("/:id/download", authMiddleware, setResourceInfo, checkPermission, downloadFolder);
router.get("/:id", authMiddleware, setResourceInfo, checkPermission, getfolder);
router.put("/:id", authMiddleware, setResourceInfo, checkPermission, updateFolderDetails);
router.delete("/:id", authMiddleware, setResourceInfo, checkPermission, deleteFolderById);

module.exports = router;
