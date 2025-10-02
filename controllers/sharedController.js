// controllers/sharedController.js
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const createSharedResource = async (req, res, next) => {
  try {
    const {
      resource_id,
      resource_type,
      shared_with,
      can_edit = false,
      can_download = false,
      can_share = false,
      expires_at = null,
    } = req.body;

    // Validate resource exists
    let resource;
    if (resource_type === "file") {
      resource = await db("files").where({ id: resource_id }).first();
    } else if (resource_type === "folder") {
      resource = await db("folders").where({ id: resource_id }).first();
    }

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Check if user is authorized to share this resource
    const isAuthorized =
      req.user.role === "super_admin" || resource.created_by === req.user.id;
    if (!isAuthorized) {
      return res
        .status(403)
        .json({ error: "Not authorized to share this resource" });
    }

    // Check if shared_with user exists
    const sharedWithUser = await db("users").where({ id: shared_with }).first();
    if (!sharedWithUser) {
      return res.status(404).json({ error: "User to share with not found" });
    }

    // Check if already shared
    const existingShare = await db("shared_resources")
      .where({
        resource_id,
        resource_type,
        shared_with,
      })
      .first();

    if (existingShare) {
      // Update existing share
      const [updatedId] = await db("shared_resources")
        .where({ id: existingShare.id })
        .update({
          can_edit,
          can_download,
          can_share,
          expires_at,
          updated_at: new Date(),
        })
        .returning("id");

      return res.json({
        id: updatedId,
        message: "Share updated successfully",
      });
    }

    // Create new share
    const share_token = uuidv4();

    const [shareId] = await db("shared_resources").insert({
      resource_id,
      resource_type,
      shared_by: req.user.id,
      shared_with,
      share_token,
      can_edit,
      can_download,
      can_share,
      expires_at,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      id: shareId,
      share_token,
      message: "Resource shared successfully",
    });
  } catch (err) {
    next(err);
  }
};

const getSharedWithMe = async (req, res, next) => {
  try {
    const sharedResources = await db("shared_resources")
      .where({ shared_with: req.user.id })
      .join("users", "shared_resources.shared_by", "users.id")
      .leftJoin("files", function () {
        this.on("shared_resources.resource_id", "=", "files.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["file"])
        );
      })
      .leftJoin("folders", function () {
        this.on("shared_resources.resource_id", "=", "folders.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["folder"])
        );
      })
      .select(
        "shared_resources.*",
        "users.username as shared_by_username",
        "files.name as file_name",
        "files.mime_type as file_mime_type",
        "files.size as file_size",
        "folders.name as folder_name"
      )
      .orderBy("shared_resources.created_at", "desc");

    // Format the response
    const formattedShares = sharedResources.map((share) => ({
      id: share.id,
      resource_id: share.resource_id,
      resource_type: share.resource_type,
      shared_by: share.shared_by,
      shared_by_username: share.shared_by_username,
      shared_with: share.shared_with,
      share_token: share.share_token,
      can_edit: share.can_edit,
      can_download: share.can_download,
      can_share: share.can_share,
      expires_at: share.expires_at,
      created_at: share.created_at,
      updated_at: share.updated_at,
      resource_name:
        share.resource_type === "file" ? share.file_name : share.folder_name,
      file_mime_type: share.file_mime_type,
      file_size: share.file_size,
    }));

    res.json(formattedShares);
  } catch (err) {
    next(err);
  }
};

const getSharedByMe = async (req, res, next) => {
  try {
    const sharedResources = await db("shared_resources")
      .where({ shared_by: req.user.id })
      .join("users", "shared_resources.shared_with", "users.id")
      .leftJoin("files", function () {
        this.on("shared_resources.resource_id", "=", "files.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["file"])
        );
      })
      .leftJoin("folders", function () {
        this.on("shared_resources.resource_id", "=", "folders.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["folder"])
        );
      })
      .select(
        "shared_resources.*",
        "users.username as shared_with_username",
        "files.name as file_name",
        "files.mime_type as file_mime_type",
        "files.size as file_size",
        "folders.name as folder_name"
      )
      .orderBy("shared_resources.created_at", "desc");

    // Format the response
    const formattedShares = sharedResources.map((share) => ({
      id: share.id,
      resource_id: share.resource_id,
      resource_type: share.resource_type,
      shared_by: share.shared_by,
      shared_with: share.shared_with,
      shared_with_username: share.shared_with_username,
      share_token: share.share_token,
      can_edit: share.can_edit,
      can_download: share.can_download,
      can_share: share.can_share,
      expires_at: share.expires_at,
      created_at: share.created_at,
      updated_at: share.updated_at,
      resource_name:
        share.resource_type === "file" ? share.file_name : share.folder_name,
      file_mime_type: share.file_mime_type,
      file_size: share.file_size,
    }));

    res.json(formattedShares);
  } catch (err) {
    next(err);
  }
};

const getSharedResourceByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sharedResource = await db("shared_resources")
      .where({ share_token: token })
      .join("users", "shared_resources.shared_by", "users.id")
      .leftJoin("files", function () {
        this.on("shared_resources.resource_id", "=", "files.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["file"])
        );
      })
      .leftJoin("folders", function () {
        this.on("shared_resources.resource_id", "=", "folders.id").andOn(
          "shared_resources.resource_type",
          "=",
          db.raw("?", ["folder"])
        );
      })
      .select(
        "shared_resources.*",
        "users.username as shared_by_username",
        "files.name as file_name",
        "files.file_path as file_path",
        "files.mime_type as file_mime_type",
        "files.size as file_size",
        "folders.name as folder_name"
      )
      .first();

    if (!sharedResource) {
      return res.status(404).json({ error: "Shared resource not found" });
    }

    // Check if share has expired
    if (
      sharedResource.expires_at &&
      new Date(sharedResource.expires_at) < new Date()
    ) {
      return res.status(410).json({ error: "This share link has expired" });
    }

    // Format the response
    const formattedShare = {
      id: sharedResource.id,
      resource_id: sharedResource.resource_id,
      resource_type: sharedResource.resource_type,
      shared_by: sharedResource.shared_by,
      shared_by_username: sharedResource.shared_by_username,
      shared_with: sharedResource.shared_with,
      share_token: sharedResource.share_token,
      can_edit: sharedResource.can_edit,
      can_download: sharedResource.can_download,
      can_share: sharedResource.can_share,
      expires_at: sharedResource.expires_at,
      created_at: sharedResource.created_at,
      updated_at: sharedResource.updated_at,
      resource_name:
        sharedResource.resource_type === "file"
          ? sharedResource.file_name
          : sharedResource.folder_name,
      file_path: sharedResource.file_path,
      file_mime_type: sharedResource.file_mime_type,
      file_size: sharedResource.file_size,
    };

    res.json(formattedShare);
  } catch (err) {
    next(err);
  }
};

const updateSharedResource = async (req, res, next) => {
  try {
    const { shareId } = req.params;
    const { can_edit, can_download, can_share, expires_at } = req.body;

    // Check if share exists and user owns it
    const existingShare = await db("shared_resources")
      .where({ id: shareId, shared_by: req.user.id })
      .first();

    if (!existingShare) {
      return res.status(404).json({ error: "Shared resource not found" });
    }

    // Update the share
    await db("shared_resources").where({ id: shareId }).update({
      can_edit,
      can_download,
      can_share,
      expires_at,
      updated_at: new Date(),
    });

    res.json({ message: "Shared resource updated successfully" });
  } catch (err) {
    next(err);
  }
};

const deleteSharedResource = async (req, res, next) => {
  try {
    const { shareId } = req.params;

    // Check if share exists and user owns it or is super admin
    const existingShare = await db("shared_resources")
      .where({ id: shareId })
      .first();

    if (!existingShare) {
      return res.status(404).json({ error: "Shared resource not found" });
    }

    const canDelete =
      req.user.role === "super_admin" ||
      existingShare.shared_by === req.user.id;
    if (!canDelete) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this share" });
    }

    await db("shared_resources").where({ id: shareId }).del();

    res.json({ message: "Shared resource deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const downloadSharedFile = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sharedResource = await db("shared_resources")
      .where({ share_token: token })
      .join("files", "shared_resources.resource_id", "files.id")
      .where("shared_resources.resource_type", "file")
      .select("shared_resources.*", "files.*")
      .first();

    if (!sharedResource) {
      return res.status(404).json({ error: "Shared file not found" });
    }

    // Check permissions
    if (!sharedResource.can_download) {
      return res
        .status(403)
        .json({ error: "Download not permitted for this file" });
    }

    // Check if share has expired
    if (
      sharedResource.expires_at &&
      new Date(sharedResource.expires_at) < new Date()
    ) {
      return res.status(410).json({ error: "This share link has expired" });
    }

    // Check if file exists
    const fs = require("fs");
    if (!sharedResource.file_path || !fs.existsSync(sharedResource.file_path)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set headers and download file
    res.setHeader(
      "Content-Type",
      sharedResource.mime_type || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${
        sharedResource.original_name || sharedResource.name
      }"`
    );

    const fileStream = fs.createReadStream(sharedResource.file_path);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSharedResource,
  getSharedWithMe,
  getSharedByMe,
  getSharedResourceByToken,
  updateSharedResource,
  deleteSharedResource,
  downloadSharedFile,
};
