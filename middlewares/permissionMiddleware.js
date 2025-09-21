const { knex } = require("../knexfile");

const checkPermission = async (req, res, next) => {
  const { resourceId, resourceType, action } = req;
  let permission = await knex("permissions")
    .where({
      user_id: req.user.id,
      resource_id: resourceId,
      resource_type: resourceType,
    })
    .first();

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

  if (
    req.user.role === "super_admin" ||
    (permission && permission[`can_${action}`])
  ) {
    return next();
  }
  res.status(403).json({ error: "Permission denied" });
};

module.exports = checkPermission;
