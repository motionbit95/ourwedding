const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument } = require("./config/swagger");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

const serviceAccount = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
};
// Firebase 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ourwedding-cc953-default-rtdb.firebaseio.com",
});

// 📌 Swagger UI 설정 ("/docs" 경로에서 문서 확인 가능)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 📌 라우터 설정
const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);

const { uploadFile, upload } = require("./routes/uploader");

app.post("/upload", upload.single("file"), uploadFile);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
