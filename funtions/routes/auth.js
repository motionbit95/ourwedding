const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = admin.database();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

// JWT 토큰 검증 미들웨어
function verifyToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      code: -1005,
      message: "토큰이 없습니다. 인증이 필요합니다.",
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET_KEY); // 'Bearer '를 제외한 토큰 부분만 사용
    req.user = decoded; // 디코딩된 사용자 정보를 요청 객체에 저장
    next(); // 인증이 통과되면, 요청을 계속 진행
  } catch (error) {
    return res.status(401).json({
      code: -1006,
      message: "유효하지 않은 토큰입니다.",
    });
  }
}

// 회원가입 엔드포인트
router.post("/signup", async (req, res) => {
  const { user_name, naver_id } = req.body;

  if (!user_name || !naver_id) {
    return res.status(400).json({
      code: -1000,
      message: "이름과 네이버 아이디를 입력하세요.",
    });
  }

  try {
    const userRef = db.ref("users").child(naver_id);
    const snapshot = await userRef.once("value");

    if (snapshot.exists()) {
      return res
        .status(400)
        .json({ code: -1002, message: "이미 존재하는 네이버 아이디입니다." });
    }

    const timestamp = new Date().toISOString();

    await userRef.set({
      user_name,
      naver_id,
      createdAt: timestamp,
      lastActiveAt: timestamp,
    });

    res.status(201).json({ message: "회원가입 성공" });
  } catch (error) {
    res
      .status(500)
      .json({ code: -100, message: "회원가입 중 서버 오류가 발생했습니다." });
  }
});

// 로그인 엔드포인트
router.post("/login", async (req, res) => {
  const { user_name, naver_id } = req.body;

  if (!user_name || !naver_id) {
    return res.status(400).json({
      code: -1000,
      message: "이름과 네이버 아이디를 입력하세요.",
    });
  }

  try {
    const userRef = db.ref("users").child(naver_id);
    const snapshot = await userRef.once("value");

    if (!snapshot.exists()) {
      return res.status(400).json({
        code: -1001,
        message: "존재하지 않는 네이버 아이디입니다.",
      });
    }

    const userData = snapshot.val();
    console.log(user_name, userData.user_name);
    const isMatch = user_name === userData.user_name;

    if (!isMatch) {
      return res.status(400).json({
        code: -1003,
        message: "유저 이름이 일치하지 않습니다.",
      });
    }

    const token = jwt.sign({ naver_id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    console.log(token);

    const lastActiveAt = new Date().toISOString();
    await userRef.update({ lastActiveAt });

    res.status(200).json({ message: "로그인 성공", token, lastActiveAt });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: -100,
      message: "로그인 처리 중 서버 오류가 발생했습니다.",
    });
  }
});

// 토큰 검증 API 엔드포인트
router.post("/verify-token", verifyToken, (req, res) => {
  // verifyToken 미들웨어가 토큰을 검증하고, 유효하면 다음 코드 실행
  res.status(200).json({
    message: "토큰 검증 성공",
    user: req.user, // 토큰에서 디코드된 사용자 정보
  });
});

module.exports = router;
