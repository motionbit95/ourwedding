const { google } = require("googleapis");
const admin = require("firebase-admin");
const { Readable } = require("stream");
const path = require("path");
const axios = require("axios");

const bucket = admin.storage().bucket();

const auth = new google.auth.GoogleAuth({
  keyFile: "./config/credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const getOrCreateFolder = async () => {
  const FOLDER_NAME = "UploadedFiles";
  const res = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });
  if (res.data.files.length > 0) return res.data.files[0].id;

  const folder = await drive.files.create({
    resource: {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });
  return folder.data.id;
};

const getOrCreateDriveFolder = async (parentId, folderName) => {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });
  if (res.data.files.length > 0) return res.data.files[0].id;

  const folder = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return folder.data.id;
};

const uploadByUrlHandler = async (req, res) => {
  try {
    const { fileUrl, originalFileName } = req.body;
    if (!fileUrl || !originalFileName) {
      return res
        .status(400)
        .json({
          success: false,
          message: "fileUrl 또는 originalFileName이 필요합니다.",
        });
    }

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const fileName = decodeURIComponent(originalFileName);
    const tempFile = bucket.file(fileName);

    await tempFile.save(buffer);

    const fileParts = fileName.split("_");
    if (fileParts.length < 5) throw new Error("잘못된 파일명 형식입니다.");

    const rootFolderId = await getOrCreateFolder();
    const mainFolderId = await getOrCreateDriveFolder(
      rootFolderId,
      fileParts[0]
    );
    const subFolderId = await getOrCreateDriveFolder(
      mainFolderId,
      fileParts[1]
    );
    const userFolderId = await getOrCreateDriveFolder(
      subFolderId,
      `${fileParts[2]}_${fileParts[3]}`
    );

    const gDriveRes = await drive.files.create({
      resource: {
        name: fileName,
        parents: [userFolderId],
      },
      media: {
        mimeType:
          response.headers["content-type"] || "application/octet-stream",
        body: bufferToStream(buffer),
      },
      fields: "id, webViewLink, webContentLink",
    });

    await tempFile.delete();

    res.json({
      success: true,
      fileId: gDriveRes.data.id,
      viewLink: gDriveRes.data.webViewLink,
      downloadLink: gDriveRes.data.webContentLink,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadByUrlHandler };
