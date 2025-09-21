const express = require("express");
const { createfolder, getfolder } = require("../controllers/folderController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/permissionMiddleware");

const router = express.Router();

router.post("/", authMiddleware, checkPermission, createfolder);
router.get("/:id", authMiddleware, checkPermission, getfolder);

module.exports = router;
