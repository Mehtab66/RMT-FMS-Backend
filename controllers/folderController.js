const { createFolder, getFolder } = require("../services/folderService");

const createfolder = async (req, res, next) => {
  try {
    const { name, parent_id } = req.body;
    req.resourceType = "folder";
    req.resourceId = parent_id || null;
    req.action = "create";
    const folder = await createFolder(name, parent_id, req.user.id);
    res.json(folder);
  } catch (err) {
    next(err);
  }
};

const getfolder = async (req, res, next) => {
  try {
    req.resourceType = "folder";
    req.resourceId = parseInt(req.params.id);
    req.action = "read";
    const folder = await getFolder(req.params.id);
    res.json(folder);
  } catch (err) {
    next(err);
  }
};

module.exports = { createfolder, getfolder };
