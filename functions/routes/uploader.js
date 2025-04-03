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

const getOrCreateFolder = async () => {
  const FOLDER_NAME = "UploadedFiles"; // 최상위 폴더 이름

  try {
    // ✅ 기존 폴더가 있는지 확인
    const res = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (res.data.files.length > 0) {
      console.log(`📁 기존 폴더 (${FOLDER_NAME}) ID:`, res.data.files[0].id);
      return res.data.files[0].id; // 기존 폴더 ID 반환
    }

    // ✅ 폴더가 없으면 새로 생성
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    console.log(`📂 새 폴더 생성됨 (${FOLDER_NAME}) ID:`, folder.data.id);
    return folder.data.id; // 새로 생성된 폴더 ID 반환
  } catch (error) {
    console.error("❌ 최상위 폴더 확인/생성 실패:", error);
    throw new Error("Google Drive 최상위 폴더 생성 실패");
  }
};

// ✅ Google Drive에 폴더를 생성하는 함수
const getOrCreateDriveFolder = async (parentId, folderName) => {
  try {
    // 기존 폴더가 있는지 확인
    const res = await drive.files.list({
      q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
    });

    if (res.data.files.length > 0) {
      return res.data.files[0].id; // 기존 폴더 ID 반환
    }

    // 폴더가 없으면 생성
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: "id",
    });

    return folder.data.id; // 새로 생성된 폴더 ID 반환
  } catch (error) {
    console.error(`❌ 폴더 생성 실패 (${folderName}):`, error);
    throw new Error(`Google Drive 폴더 생성 실패: ${folderName}`);
  }
};

// 로컬 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ 업로드 기본 경로 설정
    const baseUploadPath = path.join(__dirname, "../uploads");

    // ✅ 파일명 디코딩
    const decodedFileName = decodeURIComponent(file.originalname);

    // ✅ 파일명에서 폴더명과 파일명 분리
    const fileParts = decodedFileName.split("_"); // ["아워웨딩", "신규", "박수정", "krystal", "1.jpg"]

    if (fileParts.length < 5) {
      return cb(new Error("잘못된 파일명 형식입니다."), null);
    }

    // ✅ 폴더 구조 추출
    const mainFolder = fileParts[0]; // "아워웨딩"
    const subFolder = fileParts[1]; // "신규"
    const userFolder = `${fileParts[2]}_${fileParts[3]}`; // "박수정_krystal"

    // ✅ 최종 저장 경로 설정 (예: uploads/아워웨딩/신규/박수정_krystal)
    const uploadPath = path.join(
      baseUploadPath,
      mainFolder,
      subFolder,
      userFolder
    );

    // 폴더가 없으면 생성
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // 파일 저장 폴더 설정
  },
  filename: (req, file, cb) => {
    // ✅ 파일명 디코딩
    const decodedFileName = decodeURIComponent(file.originalname);

    // ✅ 원본 파일명에서 마지막 부분(예: "1.jpg")만 추출
    const fileParts = decodedFileName.split("_");
    const finalFileName = fileParts[fileParts.length - 1]; // "1.jpg"

    cb(null, finalFileName); // 최종 파일명 설정
  },
});

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error("❌ 폴더 삭제 실패:", err);
      } else {
        console.log("🗑️ 폴더 삭제 완료:", folderPath);
      }
    });
  }
};

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
    // 1️⃣ 기본 폴더 (UploadedFiles) 가져오기 or 생성
    const rootFolderId = await getOrCreateFolder(); // 최상위 폴더 ID

    // 2️⃣ "아워웨딩" 폴더 생성
    const companyFolderId = await getOrCreateDriveFolder(
      rootFolderId,
      "아워웨딩"
    );

    // 2️⃣ "신규" 폴더 생성
    const newFolderId = await getOrCreateDriveFolder(companyFolderId, "신규");

    // 3️⃣ 사용자 폴더 생성 (예: "박수정_krystal")
    const decodedFileName = decodeURIComponent(req.file.originalname);
    const fileParts = decodedFileName.split("_"); // 파일명 분리
    const userFolderName = `${fileParts[2]}_${fileParts[3]}`; // "박수정_krystal"
    const userFolderId = await getOrCreateDriveFolder(
      newFolderId,
      userFolderName
    );

    // 4️⃣ 파일명 추출 (예: "1.jpg")
    const finalFileName = fileParts[fileParts.length - 1]; // "1.jpg"

    // 5️⃣ 파일 업로드
    const filePath = req.file.path; // ✅ multer가 저장한 실제 파일 경로 사용
    const fileMetadata = {
      name: decodedFileName,
      parents: [userFolderId], // 사용자 폴더에 저장
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath), // ✅ 파일을 다시 읽을 때 정확한 경로 사용
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    // ✅ 업로드 성공 후 폴더 삭제
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("❌ 파일 삭제 실패:", err);
      } else {
        console.log("🗑️ 파일 삭제 완료:", filePath);

        // 📂 파일이 있는 폴더도 삭제
        const folderPath = path.dirname(filePath); // 파일이 있는 폴더 경로
        deleteFolderRecursive(folderPath);
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
