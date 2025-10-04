// routes/permissionRoutes.js
const express = require("express");
const {
  assignPermission,
  getResourcePermissions,
  getUserPermissions,
  removePermission,
} = require("../controllers/permissionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/assign", authMiddleware, assignPermission);
router.get("/resource", authMiddleware, getResourcePermissions);
router.get("/user", authMiddleware, getUserPermissions);
router.delete("/remove", authMiddleware, removePermission);

module.exports = router;
