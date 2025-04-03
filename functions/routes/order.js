const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.database();

// ✅ Order 클래스 정의
class Order {
  constructor(
    userName,
    userId,
    receivedDate,
    orderNumber,
    grade,
    photoCount,
    additionalOptions,
    photoDownload,
    referenceDownload
  ) {
    this.userName = userName;
    this.userId = userId;
    this.receivedDate = receivedDate;
    this.orderNumber = orderNumber;
    this.grade = grade;
    this.photoCount = photoCount;
    this.additionalOptions = additionalOptions;
    this.photoDownload = photoDownload;
    this.referenceDownload = referenceDownload;
  }
}

// ✅ CREATE (주문 저장)
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(...Object.values(req.body));
    const orderRef = db.ref("orders").push();
    await orderRef.set(newOrder);

    res.status(200).json({ success: true, orderId: orderRef.key });
  } catch (error) {
    res.status(500).json({ success: false, message: "데이터 저장 실패" });
  }
});

// ✅ READ (특정 주문 조회)
router.get("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const snapshot = await db.ref(`orders/${orderId}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: "주문 없음" });
    }

    res.status(200).json({ success: true, order: snapshot.val() });
  } catch (error) {
    res.status(500).json({ success: false, message: "주문 조회 실패" });
  }
});

// ✅ UPDATE (특정 주문 수정)
router.put("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await db.ref(`orders/${orderId}`).update(req.body);

    res.status(200).json({ success: true, message: "주문 수정 성공!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "주문 수정 실패" });
  }
});

// ✅ DELETE (특정 주문 삭제)
router.delete("/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await db.ref(`orders/${orderId}`).remove();

    res.status(200).json({ success: true, message: "주문 삭제 성공!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "주문 삭제 실패" });
  }
});

// ✅ LIST (모든 주문 조회)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.ref("orders").once("value");
    const orders = snapshot.val() || {};

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "주문 목록 조회 실패" });
  }
});

module.exports = router;
