const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.database();

class Work {
  constructor(worker_id, photo_count) {
    this.worker_id = worker_id;
    this.photo_count = photo_count;
  }
}

// ✅ [CREATE] 작업 생성
router.post("/", async (req, res) => {
  const { worker_id, photo_count } = req.body;

  if (!worker_id || photo_count == null) {
    return res
      .status(400)
      .json({ message: "worker_id와 photo_count를 입력하세요." });
  }

  try {
    const newWorkRef = db.ref("works").push();
    const work = new Work(worker_id, photo_count);
    await newWorkRef.set(work);
    res.status(201).json({ message: "작업 등록 성공", id: newWorkRef.key });
  } catch (error) {
    res.status(500).json({ message: "작업 등록 실패", error: error.message });
  }
});

// ✅ [READ] 전체 작업 조회
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.ref("works").once("value");
    const works = snapshot.val();
    res.status(200).json(works || {});
  } catch (error) {
    res.status(500).json({ message: "작업 조회 실패", error: error.message });
  }
});

// ✅ [READ] 단일 작업 조회
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`works/${id}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "작업을 찾을 수 없습니다." });
    }

    res.status(200).json(snapshot.val());
  } catch (error) {
    res.status(500).json({ message: "작업 조회 실패", error: error.message });
  }
});

// ✅ [UPDATE] 작업 수정
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { worker_id, photo_count } = req.body;

  try {
    const workRef = db.ref(`works/${id}`);
    const snapshot = await workRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "작업을 찾을 수 없습니다." });
    }

    const updatedData = {};
    if (worker_id !== undefined) updatedData.worker_id = worker_id;
    if (photo_count !== undefined) updatedData.photo_count = photo_count;

    await workRef.update(updatedData);

    res.status(200).json({ message: "작업 수정 성공" });
  } catch (error) {
    res.status(500).json({ message: "작업 수정 실패", error: error.message });
  }
});

// ✅ [DELETE] 작업 삭제
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const workRef = db.ref(`works/${id}`);
    const snapshot = await workRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "작업을 찾을 수 없습니다." });
    }

    await workRef.remove();
    res.status(200).json({ message: "작업 삭제 성공" });
  } catch (error) {
    res.status(500).json({ message: "작업 삭제 실패", error: error.message });
  }
});

module.exports = router;
