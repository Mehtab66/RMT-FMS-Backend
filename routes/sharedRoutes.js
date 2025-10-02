// routes/sharedRoutes.js
const express = require("express");
const {
  createSharedResource,
  getSharedWithMe,
  getSharedByMe,
  getSharedResourceByToken,
  updateSharedResource,
  deleteSharedResource,
  downloadSharedFile,
} = require("../controllers/sharedController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes (require authentication)
router.post("/", authMiddleware, createSharedResource);
router.get("/with-me", authMiddleware, getSharedWithMe);
router.get("/by-me", authMiddleware, getSharedByMe);
router.put("/:shareId", authMiddleware, updateSharedResource);
router.delete("/:shareId", authMiddleware, deleteSharedResource);

// Public routes (accessible via share token)
router.get("/token/:token", getSharedResourceByToken);
router.get("/download/:token", downloadSharedFile);

module.exports = router;
