const { knex } = require("../knexfile");

const ensureFolderPath = async (path, parentId, userId) => {
  const parts = path.split("/").filter((p) => p);
  let currentParentId = parentId;
  let folderId;

  for (const name of parts) {
    let folder = await knex("folders")
      .where({ name, parent_id: currentParentId })
      .first();
    if (!folder) {
      [folderId] = await knex("folders").insert({
        name,
        parent_id: currentParentId,
        created_by: userId,
      });
      folder = { id: folderId, name };
    }
    currentParentId = folder.id;
  }
  return currentParentId;
};

const createFolder = async (name, parentId, userId) => {
  const [folderId] = await knex("folders").insert({
    name,
    parent_id: parentId,
    created_by: userId,
  });
  return { id: folderId, name, parent_id: parentId };
};

const getFolder = async (id) => {
  const folder = await knex("folders").where({ id }).first();
  if (!folder) throw new Error("Folder not found");
  return folder;
};

module.exports = { ensureFolderPath, createFolder, getFolder };
