const express = require("express");
const { login, createUser } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/users", authMiddleware, createUser);

module.exports = router;
