const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { knex } = require("../knexfile");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await knex("users").where({ username }).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { id: user.id, username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ error: "Only super admin can create users" });
    }
    const { username, password, role } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const [userId] = await knex("users").insert({
      username,
      password_hash,
      role,
    });
    res.json({ id: userId, username, role });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, createUser };
