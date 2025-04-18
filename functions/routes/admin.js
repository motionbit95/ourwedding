const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = admin.database();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

// 관리자 토큰으로 정보 조회하는 엔드포인트
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      code: -2010,
      message: "Authorization 헤더가 없거나 형식이 올바르지 않습니다.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const { admin_id } = decoded;

    const adminRef = db.ref("admins").child(admin_id);
    const snapshot = await adminRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        code: -2011,
        message: "존재하지 않는 관리자입니다.",
      });
    }

    const adminData = snapshot.val();

    // 민감 정보 제외 후 응답
    const { admin_pw, ...safeData } = adminData;

    res.status(200).json({
      message: "관리자 정보 조회 성공",
      admin: safeData,
    });
  } catch (error) {
    res.status(401).json({
      code: -2012,
      message: "유효하지 않은 토큰입니다.",
    });
  }
});

// 관리자 회원가입 엔드포인트
router.post("/signup", async (req, res) => {
  const {
    admin_id,
    admin_pw,
    admin_permission = "작업자",
    admin_name,
  } = req.body;

  if (!admin_id || !admin_pw || !admin_name) {
    return res.status(400).json({
      code: -2000,
      message: "이름, admin_id와 admin_pw를 입력하세요.",
    });
  }

  try {
    const hashedPw = await bcrypt.hash(admin_pw, 10);
    const adminRef = db.ref("admins").child(admin_id);
    const snapshot = await adminRef.once("value");

    if (snapshot.exists()) {
      return res
        .status(400)
        .json({ code: -2001, message: "이미 존재하는 admin_id입니다." });
    }

    const timestamp = new Date().toISOString();
    await adminRef.set({
      admin_id,
      admin_pw: hashedPw,
      createdAt: timestamp,
      lastActiveAt: timestamp,
      admin_permission,
      admin_name,
    });

    res.status(201).json({ message: "관리자 회원가입 성공" });
  } catch (error) {
    res.status(500).json({
      code: -2002,
      message: "관리자 회원가입 중 서버 오류가 발생했습니다.",
    });
  }
});

// 관리자 로그인 엔드포인트
router.post("/login", async (req, res) => {
  const { admin_id, admin_pw } = req.body;

  if (!admin_id || !admin_pw) {
    return res
      .status(400)
      .json({ code: -2000, message: "admin_id와 admin_pw를 입력하세요." });
  }

  try {
    const adminRef = db.ref("admins").child(admin_id);
    const snapshot = await adminRef.once("value");

    if (!snapshot.exists()) {
      return res
        .status(400)
        .json({ code: -2001, message: "존재하지 않는 admin_id입니다." });
    }

    const adminData = snapshot.val();
    const isMatch = await bcrypt.compare(admin_pw, adminData.admin_pw);

    if (!isMatch) {
      return res
        .status(400)
        .json({ code: -2003, message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign({ admin_id: adminData.admin_id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    const lastActiveAt = new Date().toISOString();
    await adminRef.update({ lastActiveAt });

    res.status(200).json({
      message: "관리자 로그인 성공",
      token,
      lastActiveAt,
      permission: adminData.admin_permission,
    });
  } catch (error) {
    res.status(500).json({
      code: -2004,
      message: "관리자 로그인 처리 중 서버 오류가 발생했습니다.",
    });
  }
});

// 관리자 목록 조회 엔드포인트
router.get("/", async (req, res) => {
  try {
    const adminsRef = db.ref("admins");
    const snapshot = await adminsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({
        code: -2008,
        message: "등록된 관리자가 없습니다.",
      });
    }

    const admins = snapshot.val();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      code: -2009,
      message: "관리자 목록 조회 중 서버 오류가 발생했습니다.",
    });
  }
});

// 관리자 탈퇴 엔드포인트
router.delete("/:admin_id", async (req, res) => {
  const { admin_id } = req.params;

  if (!admin_id) {
    return res
      .status(400)
      .json({ code: -2005, message: "admin_id를 입력하세요." });
  }

  try {
    const adminRef = db.ref("admins").child(admin_id);
    const snapshot = await adminRef.once("value");

    if (!snapshot.exists()) {
      return res
        .status(400)
        .json({ code: -2006, message: "존재하지 않는 admin_id입니다." });
    }

    await adminRef.remove();
    res.status(200).json({ message: "관리자 탈퇴 성공" });
  } catch (error) {
    res.status(500).json({
      code: -2007,
      message: "관리자 탈퇴 처리 중 서버 오류가 발생했습니다.",
    });
  }
});

// 특정 관리자 정보 조회 엔드포인트
router.get("/:admin_id", async (req, res) => {
  const { admin_id } = req.params;

  if (!admin_id) {
    return res
      .status(400)
      .json({ code: -2013, message: "admin_id를 입력하세요." });
  }

  try {
    const adminRef = db.ref("admins").child(admin_id);
    const snapshot = await adminRef.once("value");

    if (!snapshot.exists()) {
      return res
        .status(404)
        .json({ code: -2014, message: "해당 admin_id의 관리자가 없습니다." });
    }

    const adminData = snapshot.val();
    const { admin_pw, ...safeData } = adminData;

    res.status(200).json({
      message: "관리자 정보 조회 성공",
      admin: { id: admin_id, ...safeData },
    });
  } catch (error) {
    res.status(500).json({
      code: -2015,
      message: "관리자 정보 조회 중 서버 오류가 발생했습니다.",
    });
  }
});

module.exports = router;
