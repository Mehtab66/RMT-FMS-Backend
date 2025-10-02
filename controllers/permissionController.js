// controllers/permissionController.js
const db = require("../config/db");

const assignPermission = async (req, res, next) => {
  try {
    const {
      user_id,
      resource_id,
      resource_type,
      can_read,
      can_create,
      can_edit,
      can_download,
      can_delete,
      inherit,
      expires_at,
    } = req.body;

    // Check if user is super_admin OR owns the resource
    let isAuthorized = req.user.role === "super_admin";

    if (!isAuthorized) {
      // Check if user owns the resource
      if (resource_type === "file") {
        const file = await db("files")
          .where({ id: resource_id, created_by: req.user.id })
          .first();
        isAuthorized = !!file;
      } else if (resource_type === "folder") {
        const folder = await db("folders")
          .where({ id: resource_id, created_by: req.user.id })
          .first();
        isAuthorized = !!folder;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        error: "Not authorized to set permissions for this resource",
      });
    }

    // Check if permission already exists
    const existingPerm = await db("permissions")
      .where({
        user_id,
        resource_id,
        resource_type,
      })
      .first();

    let permId;

    if (existingPerm) {
      // Update existing permission
      [permId] = await db("permissions").where({ id: existingPerm.id }).update({
        can_read,
        can_create,
        can_edit,
        can_download,
        can_delete,
        inherit,
        expires_at,
        updated_at: new Date(),
      });
      permId = existingPerm.id;
    } else {
      // Create new permission
      [permId] = await db("permissions").insert({
        user_id,
        resource_id,
        resource_type,
        can_read,
        can_create,
        can_edit,
        can_download,
        can_delete,
        inherit,
        expires_at,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    res.json({
      id: permId,
      message: "Permission assigned successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getResourcePermissions = async (req, res, next) => {
  try {
    const { resource_id, resource_type } = req.query;

    const permissions = await db("permissions")
      .where({ resource_id, resource_type })
      .join("users", "permissions.user_id", "users.id")
      .select("permissions.*", "users.username", "users.role");

    res.json({ permissions });
  } catch (err) {
    next(err);
  }
};

const removePermission = async (req, res, next) => {
  try {
    const { permission_id } = req.body;

    await db("permissions").where({ id: permission_id }).del();

    res.json({ message: "Permission removed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  assignPermission,
  getResourcePermissions,
  removePermission,
};
