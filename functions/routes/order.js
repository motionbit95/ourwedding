const express = require("express");
const admin = require("firebase-admin");
const dayjs = require("dayjs");

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
    referenceDownload,
    company,
    division,
    step,
    comment
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
    this.company = company;
    this.division = division;
    this.step = step;
    this.comment = comment || "";
  }
}

// Grade 기준 작업일수 설정
const GRADE_WORK_DAYS = {
  "S 샘플": 4,
  "1 씨앗": 7,
  "2 새싹": 4,
  "3 나무": 2,
  "# 숲": 0.125, // 3시간 = 0.125일
};

// 주문 필터링 API
router.get("/filter", async (req, res) => {
  const { company = "전체", day = "전체", step = "전체" } = req.query;

  console.log(req.query);
  try {
    const db = admin.database();
    const snapshot = await db.ref("orders").once("value");
    const orders = snapshot.val();

    const now = dayjs();
    const dayLimit = day === "전체" ? null : parseInt(day);

    const allowedSteps = ["샘플", "신규", "재수정"];

    const filteredOrders = Object.entries(orders || {})
      .filter(([id, order]) => {
        const orderCompany = order.company;
        const orderGrade = order.grade;
        const orderStep = order.division;
        const receivedDate = dayjs(order.receivedDate);
        const workDays = GRADE_WORK_DAYS[orderGrade];

        if (!receivedDate.isValid() || workDays === undefined) return false;

        const dueDate = receivedDate.add(workDays, "day");
        const remainingDays = dueDate.diff(now, "day", true);

        const matchesCompany = company === "전체" || orderCompany === company;
        const matchesDay =
          dayLimit === null ||
          (remainingDays >= 0 && remainingDays <= dayLimit);

        const matchesStep =
          step === "전체"
            ? allowedSteps.includes(orderStep) // 전체일 경우 허용된 step만 필터
            : orderStep === step;

        return matchesCompany && matchesDay && matchesStep;
      })
      .map(([id, order]) => ({
        id,
        ...order,
      }));

    res.json({ orders: filteredOrders });
  } catch (error) {
    console.error("Error filtering orders:", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

// ✅ 특정 userId의 주문 내역 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.ref("orders").once("value");
    const orders = snapshot.val() || {};

    const userOrders = Object.entries(orders)
      .filter(([_, order]) => order.userId === userId)
      .map(([id, order]) => ({
        id,
        ...order,
      }));

    res.status(200).json({ success: true, orders: userOrders });
  } catch (error) {
    console.error("userId 주문 조회 실패:", error);
    res.status(500).json({ success: false, message: "주문 조회 실패" });
  }
});

// ✅ CREATE (주문 저장)
router.post("/", async (req, res) => {
  console.log(req.body);
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
  console.log(req.params.orderId);
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
