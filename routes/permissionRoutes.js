const express = require("express");
const { assignPermission } = require("../controllers/permissionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, assignPermission);

module.exports = router;
