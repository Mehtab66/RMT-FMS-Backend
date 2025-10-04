// middlewares/permissionMiddleware.js
const knex = require("../config/db");

const checkPermission = async (req, res, next) => {
  const { resourceId, resourceType, action } = req;
  
  console.log(`🔐 Permission check: User ${req.user.id} (${req.user.role}) trying to ${action} ${resourceType} ${resourceId}`);

  // For uploads (create action), allow if user is authenticated
  if (action === "create") {
    console.log(`✅ Upload/create action allowed for user ${req.user.id}`);
    return next();
  }

  // Allow download if user has download permission
  if (action === "download") {
    // Check if user owns the resource
    if (resourceType === "folder" && resourceId) {
      const folder = await knex("folders").where({ id: resourceId }).first();
      if (folder && folder.created_by === req.user.id) {
        console.log(`✅ User owns folder, download allowed`);
        return next();
      }
    }
    
    if (resourceType === "file" && resourceId) {
      const file = await knex("files").where({ id: resourceId }).first();
      if (file && file.created_by === req.user.id) {
        console.log(`✅ User owns file, download allowed`);
        return next();
      }
    }
  }

  // Super admin has all permissions
  if (req.user.role === "super_admin") {
    console.log(`✅ Super admin access granted`);
    return next();
  }

  // If no resource info provided, deny access
  if (!resourceId || !resourceType || !action) {
    return res.status(403).json({ error: "Permission denied - missing resource information" });
  }

  // Check if user owns the resource - owners have all permissions
  if (resourceType === "file" && resourceId) {
    const file = await knex("files").where({ id: resourceId }).first();
    if (file && file.created_by === req.user.id) {
      console.log(`✅ User owns file, access granted`);
      return next();
    }
  }

  if (resourceType === "folder" && resourceId) {
    const folder = await knex("folders").where({ id: resourceId }).first();
    if (folder && folder.created_by === req.user.id) {
      console.log(`✅ User owns folder, access granted`);
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
    
  console.log(`🔍 Direct permission check:`, permission ? `Found permission (can_read: ${permission.can_read}, can_download: ${permission.can_download})` : 'No direct permission found');

  // Check inheritance for folders
  if (!permission && resourceType === "folder") {
    let currentId = resourceId;
    while (currentId) {
      const parentPerm = await knex("permissions")
        .where({
          user_id: req.user.id,
          resource_id: currentId,
          resource_type: "folder",
        })
        .first();

      if (parentPerm) {
        permission = parentPerm;
        break;
      }

      const folder = await knex("folders").where({ id: currentId }).first();
      currentId = folder?.parent_id;
    }
  }

  // Check if permission exists and action is allowed
  if (permission) {
    // Map actions to permission fields
    let hasPermission = false;
    if (action === "read" || action === "view") {
      hasPermission = permission.can_read;
    } else if (action === "download") {
      hasPermission = permission.can_download;
    } else if (action === "create") {
      hasPermission = permission.can_read; // Can create if can read
    } else if (action === "edit" || action === "update") {
      hasPermission = permission.can_read; // Can edit if can read
    } else if (action === "delete") {
      hasPermission = permission.can_read; // Can delete if can read
    }

    console.log(`🎯 Action: ${action}, Has permission: ${hasPermission}`);
    
    if (hasPermission) {
      console.log(`✅ Permission granted for ${action}`);
      return next();
    }
  }

  console.log(`❌ Permission denied for ${action} on ${resourceType} ${resourceId}`);
  res.status(403).json({ error: "Permission denied" });
};

module.exports = checkPermission;
