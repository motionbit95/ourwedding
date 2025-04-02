const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Google Drive 인증 설정
const credentials = require("../config/credentials.json");
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

// ✅ 저장할 폴더 이름 (필요에 따라 변경 가능)
const FOLDER_NAME = "UploadedFiles";

// ✅ 폴더 ID를 가져오거나 없으면 생성하는 함수
const getOrCreateFolder = async () => {
  try {
    // 기존 폴더가 있는지 확인
    const res = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (res.data.files.length > 0) {
      return res.data.files[0].id; // 기존 폴더 ID 반환
    }

    // 폴더가 없으면 생성
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    return folder.data.id; // 새로 생성된 폴더 ID 반환
  } catch (error) {
    console.error("❌ 폴더 확인/생성 실패:", error);
    throw new Error("Google Drive 폴더 생성 실패");
  }
};

// 로컬 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ 파일을 Google Drive에 업로드 후 로컬 파일 삭제
const uploadFile = async (req, res) => {
  console.log("📂 업로드된 파일 정보:", req.file);

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "파일이 없습니다." });
  }

  try {
    const folderId = await getOrCreateFolder(); // 폴더 ID 가져오기 (없으면 생성)

    console.log(folderId);

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    const fileMetadata = {
      name: req.file.filename,
      parents: [folderId], // 지정한 폴더에 업로드
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    console.log(file);

    // ✅ 업로드 성공 후 파일 삭제 (비동기 방식)
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("❌ 파일 삭제 실패:", err);
      } else {
        console.log("🗑️ 파일 삭제 완료:", filePath);
      }
    });

    res.json({
      success: true,
      fileId: file.data.id,
      viewLink: file.data.webViewLink,
      downloadLink: file.data.webContentLink,
    });
  } catch (error) {
    console.error("❌ 파일 업로드 실패:", error);
    res.status(500).json({ success: false, message: "파일 업로드 실패" });
  }
};

module.exports = { upload, uploadFile };
