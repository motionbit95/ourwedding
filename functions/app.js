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
  storageBucket: "ourwedding-cc953.firebasestorage.app",
});

// 📌 Swagger UI 설정 ("/docs" 경로에서 문서 확인 가능)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 📌 라우터 설정
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/order", orderRoutes);
app.use("/", require("./routes/downloader"));

const { uploadByUrlHandler } = require("./routes/uploader");

// app.post("/upload", upload.single("file"), uploadFile); // multer 미들웨어 사용
// 실제 엔드포인트
app.post("/upload", uploadByUrlHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
