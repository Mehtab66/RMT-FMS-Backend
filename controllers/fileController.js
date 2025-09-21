const {
  uploadFile,
  uploadFolder,
  getFile,
} = require("../services/fileService");

const uploadSingleFile = async (req, res, next) => {
  try {
    const { folder_id } = req.body;
    req.resourceType = "folder";
    req.resourceId = folder_id || null;
    req.action = "create";
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const uploadedFile = await uploadFile(file, folder_id, req.user.id);
    res.json(uploadedFile);
  } catch (err) {
    next(err);
  }
};

const uploadFolderFiles = async (req, res, next) => {
  try {
    const { parent_id } = req.body;
    req.resourceType = "folder";
    req.resourceId = parent_id || null;
    req.action = "create";
    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });
    const uploadedFiles = await uploadFolder(files, parent_id, req.user.id);
    res.json({ files: uploadedFiles });
  } catch (err) {
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    req.resourceType = "file";
    req.resourceId = parseInt(req.params.id);
    req.action = "download";
    const file = await getFile(req.params.id);
    res.json({ url: file.cloudinary_url });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadSingleFile, uploadFolderFiles, downloadFile };
