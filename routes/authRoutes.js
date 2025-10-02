const express = require("express");
const { login, createUser } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const knex = require("../config/db");

const router = express.Router();

router.post("/login", login);
router.post("/users", createUser);
router.get("/users", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Only super admin can view users" });
    }
    const users = await knex("users").select("id", "username", "role");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
