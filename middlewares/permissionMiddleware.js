// middlewares/permissionMiddleware.js
const { knex } = require("../config/db");

const checkPermission = async (req, res, next) => {
  const { resourceId, resourceType, action } = req;

  // Super admin has all permissions
  if (req.user.role === "super_admin") {
    return next();
  }

  // Check if user owns the resource
  if (resourceType === "file" && resourceId) {
    const file = await knex("files").where({ id: resourceId }).first();
    if (file && file.created_by === req.user.id) {
      return next();
    }
  }

  if (resourceType === "folder" && resourceId) {
    const folder = await knex("folders").where({ id: resourceId }).first();
    if (folder && folder.created_by === req.user.id) {
      return next();
    }
  }

  // Check explicit permissions
  let permission = await knex("permissions")
    .where({
      user_id: req.user.id,
      resource_id: resourceId,
      resource_type: resourceType,
    })
    .first();

  // Check inheritance for folders
  if (!permission && resourceType === "folder") {
    let currentId = resourceId;
    while (currentId) {
      const parentPerm = await knex("permissions")
        .where({
          user_id: req.user.id,
          resource_id: currentId,
          resource_type: "folder",
          inherit: true,
        })
        .first();

      if (parentPerm && parentPerm[`can_${action}`]) {
        permission = parentPerm;
        break;
      }

      const folder = await knex("folders").where({ id: currentId }).first();
      currentId = folder?.parent_id;
    }
  }

  // Check if permission exists and action is allowed
  if (permission && permission[`can_${action}`]) {
    // Check if permission has expired
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
      return res.status(403).json({ error: "Permission has expired" });
    }
    return next();
  }

  res.status(403).json({ error: "Permission denied" });
};

module.exports = checkPermission;
