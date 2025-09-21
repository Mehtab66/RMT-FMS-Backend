const { cloudinary } = require("..//config/cloudinary");
const { knex } = require("../knexfile");
const { ensureFolderPath } = require("./folderService");

const uploadFile = async (file, folderId, userId) => {
  const cloudinaryPath = folderId
    ? `rmt/folder_${folderId}/${file.originalname}`
    : `rmt/${file.originalname}`;
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: cloudinaryPath }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(file.buffer);
  });

  const [fileId] = await knex("files").insert({
    name: file.originalname,
    folder_id: folderId,
    cloudinary_public_id: result.public_id,
    cloudinary_url: result.secure_url,
    created_by: userId,
  });
  return { id: fileId, name: file.originalname, url: result.secure_url };
};

const uploadFolder = async (files, parentId, userId) => {
  const uploadedFiles = [];
  for (const file of files) {
    const relativePath = file.originalname;
    const pathParts = relativePath.split("/").slice(0, -1);
    const fileName = relativePath.split("/").pop();
    const folderPath = pathParts.join("/");

    const finalFolderId = folderPath
      ? await ensureFolderPath(folderPath, parentId, userId)
      : parentId;

    const uploadedFile = await uploadFile(
      { ...file, originalname: fileName },
      finalFolderId,
      userId
    );
    uploadedFiles.push(uploadedFile);
  }
  return uploadedFiles;
};

const getFile = async (id) => {
  const file = await knex("files").where({ id }).first();
  if (!file) throw new Error("File not found");
  return file;
};

module.exports = { uploadFile, uploadFolder, getFile };
