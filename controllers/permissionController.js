const { knex } = require("../knexfile");

const assignPermission = async (req, res, next) => {
  try {
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ error: "Only super admin can set permissions" });
    }
    const {
      user_id,
      resource_id,
      resource_type,
      can_read,
      can_create,
      can_edit,
      can_download,
      inherit,
    } = req.body;
    const [permId] = await knex("permissions").insert({
      user_id,
      resource_id,
      resource_type,
      can_read,
      can_create,
      can_edit,
      can_download,
      inherit,
    });
    res.json({ id: permId });
  } catch (err) {
    next(err);
  }
};

module.exports = { assignPermission };
