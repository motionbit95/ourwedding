const { google } = require("googleapis");
const multer = require("multer");
const { Readable } = require("stream");
const admin = require("firebase-admin");
const path = require("path");

const bucket = admin.storage().bucket(); // Firebase Storage 버킷

const auth = new google.auth.GoogleAuth({
  keyFile: "./config/credentials.json", // 실제 인증 파일 경로 설정 필요
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

const getOrCreateFolder = async () => {
  const FOLDER_NAME = "UploadedFiles";
  try {
    const res = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });
    if (res.data.files.length > 0) return res.data.files[0].id;
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });
    return folder.data.id;
  } catch (error) {
    console.error("❌ 최상위 폴더 생성 실패:", error);
    throw new Error("Google Drive 최상위 폴더 생성 실패");
  }
};

const getOrCreateDriveFolder = async (parentId, folderName) => {
  try {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });
    if (res.data.files.length > 0) return res.data.files[0].id;
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });
    return folder.data.id;
  } catch (error) {
    console.error(`❌ 폴더 생성 실패 (${folderName}):`, error);
    throw new Error(`Google Drive 폴더 생성 실패: ${folderName}`);
  }
};

const upload = multer({ storage: multer.memoryStorage() });

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const uploadFile = async (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "파일이 없습니다." });
  }

  try {
    // 1. Firebase Storage에 파일 업로드
    const fileName = path.basename(req.file.originalname);
    const file = bucket.file(fileName);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    // 2. Google Drive에 업로드할 폴더 ID 생성
    const rootFolderId = await getOrCreateFolder();
    const fileParts = decodeURIComponent(req.file.originalname).split("_");
    if (fileParts.length < 5) throw new Error("잘못된 파일명 형식입니다.");

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

    // 3. 구글 드라이브에 파일 업로드
    const fileMetadata = {
      name: decodeURIComponent(req.file.originalname),
      parents: [userFolderId],
    };
    const media = {
      mimeType: req.file.mimetype,
      body: bufferToStream(req.file.buffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log(response.data);

    // 4. Firebase Storage에서 파일 삭제
    await file.delete();

    res.json({
      success: true,
      fileId: response.data.id,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink,
    });
  } catch (error) {
    console.error("❌ 파일 업로드 실패:", error);
    res.status(500).json({
      success: false,
      message: "파일 업로드 실패",
      error: error.message,
    });
  }
};

module.exports = { upload, uploadFile };
