const express = require("express");
const router = express.Router();
const axios = require("axios");
const JSZip = require("jszip");

// ✅ /order/download-zip
router.post("/download-zip", async (req, res) => {
  const { photoDownload = [], referenceDownload } = req.body;
  const zip = new JSZip();

  const fetchAndAddFile = async (url, name) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      zip.file(name, response.data);
    } catch (err) {
      console.error("파일 다운로드 실패:", url);
    }
  };

  // 📸 사진들 추가
  await Promise.all(
    photoDownload.map((url, i) => fetchAndAddFile(url, `photo_${i + 1}.jpg`))
  );

  // 🎯 참고 이미지 추가
  if (referenceDownload) {
    await fetchAndAddFile(referenceDownload, `reference.jpg`);
  }

  // 📦 zip 생성
  const zipData = await zip.generateAsync({ type: "nodebuffer" });
  res.set({
    "Content-Disposition": `attachment; filename=download.zip`,
    "Content-Type": "application/zip",
  });
  res.send(zipData);
});

module.exports = router;
