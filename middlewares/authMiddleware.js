const jwt = require("jsonwebtoken");
const knex = require("../config/db");

const authMiddleware = async (req, res, next) => {
  console.log("into the auth midddleware");
  // console.log(req.body);

  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await knex("users").where({ id: decoded.userId }).first();
    // console.log(user);

    if (!user) {
      console.log("no user found");

      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("error in auth middleware", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
