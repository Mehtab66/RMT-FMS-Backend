// controllers/fileController.js
const {
  uploadFile,
  uploadFolder,
  getFile,
  getUserFiles,
  updateFile,
  deleteFile,
  getFileById,
} = require("../services/fileService");
const knex=require("../config/db");
const uploadFiles = async (req, res, next) => {
  try {
    const { folder_id } = req.body;
    const userId = req.user.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const trx = await knex.transaction();
    try {
      const uploaded = [];
      for (const file of req.files) {
        const fileUrl = `/api/files/${file.filename}/download`;
        const [fileId] = await trx("files").insert({
          name: file.originalname,
          original_name: file.originalname,
          folder_id: folder_id || null,
          file_path: file.path,
          file_url: fileUrl,
          mime_type: file.mimetype,
          size: file.size,
          created_by: userId,
          created_at: new Date(),
          updated_at: new Date(),
        });
        uploaded.push({
          id: fileId,
          name: file.originalname,
          url: `/api/files/${fileId}/download`,
          size: file.size,
          mime_type: file.mimetype,
        });
      }
      await trx.commit();
      res.json({ message: "Files uploaded successfully", files: uploaded });
    } catch (err) {
      await trx.rollback();
      console.error("DB insert error:", err);
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      throw err;
    }
  } catch (err) {
    console.error("Upload error:", err);
    next(err);
  }
};

const uploadFolderFiles = async (req, res, next) => {
  console.log(
    "Upload folder files controller - Files received:",
    req.files?.length
  );
  console.log("Body received:", req.body);

  try {
    const { parent_id } = req.body;

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log("Processing", files.length, "files");
    const uploadedFiles = await uploadFolder(files, parent_id, req.user.id);

    res.json({ files: uploadedFiles });
  } catch (err) {
    console.error("Error in uploadFolderFiles:", err);
    next(err);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "download";

    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if file exists in local storage
    if (!file.file_path || !require("fs").existsSync(file.file_path)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set appropriate headers for download
    res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.original_name || file.name}"`
    );

    // Stream the file
    const fileStream = require("fs").createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error in downloadFile:", err);
    next(err);
  }
};

const getFiles = async (req, res, next) => {
  try {
    const { folder_id } = req.query;
    const files = await getUserFiles(req.user.id, folder_id);
    res.json({ files });
  } catch (err) {
    console.error("Error in getFiles:", err);
    next(err);
  }
};

const updateFileDetails = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);
    const { name } = req.body;

    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "edit";

    const updatedFile = await updateFile(fileId, { name });
    res.json(updatedFile);
  } catch (err) {
    console.error("Error in updateFileDetails:", err);
    next(err);
  }
};

const deleteFileById = async (req, res, next) => {
  try {
    const fileId = parseInt(req.params.id);

    req.resourceType = "file";
    req.resourceId = fileId;
    req.action = "delete";

    await deleteFile(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error in deleteFileById:", err);
    next(err);
  }
};

module.exports = {
  uploadFolderFiles,
  downloadFile,
  getFiles,
  updateFileDetails,
  deleteFileById,
  uploadFiles,
};
