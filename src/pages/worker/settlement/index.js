import React, { useEffect, useState } from "react";
import { Segmented, Table, Tabs } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const onChange = (key) => {
  console.log(key);
};

const columns = [
  {
    title: "신규 / 재수정",
    dataIndex: "label",
  },
  {
    title: "고객명",
    dataIndex: "userName",
  },
  {
    title: "보정장수",
    dataIndex: "photoLength",
    render: (_, record) => {
      return record.label === "신규"
        ? record.firstWorkDownload.length + "장"
        : record.label === "샘플"
        ? record.preDownload.length + "장"
        : record.revisionDownload.length + "장";
    },
  },
];

const Settlement = () => {
  const [alignValue, setAlignValue] = React.useState("center");
  const [orders, setOrders] = useState();
  const [count, setCount] = useState({
    newPhotoTotal: 0,
    revisePhotoTotal: 0,
  });

  const items = [
    {
      key: "1",
      label: "신규",
      children: `이번주 작업한 총 장수 : ${count.newPhotoTotal}`,
    },
    {
      key: "2",
      label: "재수정",
      children: `이번주 작업한 총 장수 : ${count.revisePhotoTotal}`,
    },
  ];

  const getOrders = async (workerId) => {
    try {
      const response = await axios.get(`${API_URL}/order/worker/${workerId}`);

      const data = response.data.orders;

      const orderList = Array.isArray(data)
        ? data
        : Object.entries(data || {}).map(([id, order]) => ({
            id,
            ...order,
          }));

      console.log("📦 워커 주문 리스트:", JSON.stringify(orderList));
      setOrders(orderList);
    } catch (error) {
      console.error("주문 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (orders) {
      fetchTotalCount();
    }
  }, [orders]);

  const fetchTotalCount = () => {
    // 이번 주 날짜 범위 계산
    const startOfWeek = dayjs().startOf("week"); // 일요일
    const endOfWeek = dayjs().endOf("week"); // 토요일

    let newPhotoTotal = 0;
    let revisePhotoTotal = 0;

    orders.forEach((order) => {
      const receivedDate = dayjs(order.receivedDate);
      const isThisWeek =
        receivedDate.isAfter(startOfWeek) && receivedDate.isBefore(endOfWeek);

      if (isThisWeek) {
        if (order.label === "신규") {
          newPhotoTotal += Number(order.firstWorkDownload.length || 0);
        } else if (order.label === "샘플") {
          newPhotoTotal += Number(order.preDownload.length || 0);
        } else if (order.label === "재수정") {
          revisePhotoTotal += Number(order.revisionDownload.length || 0);
        }
      }
    });

    setCount({ newPhotoTotal, revisePhotoTotal });

    console.log("✅ 이번 주 신규 작업 장수:", newPhotoTotal);
    console.log("🔁 이번 주 재수정 장수:", revisePhotoTotal);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem("admin-token"); // 또는 sessionStorage.getItem("token")

        if (!token) {
          console.log("로그인 토큰이 없습니다.");
        }

        const response = await axios.get(`${API_URL}/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        getOrders(response.data.admin.admin_id); // 관리자 정보 반환
      } catch (error) {
        console.error(
          "관리자 정보 조회 실패:",
          error.response?.data || error.message
        );
        navigate("/admin/login");
        throw error;
      }
    };

    fetchAdminInfo();
  }, []);
  return (
    <>
      <Segmented
        value={alignValue}
        style={{ marginBottom: 8 }}
        onChange={setAlignValue}
      />
      <Tabs
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        style={{ marginBottom: "5vh" }}
      />

      <Table columns={columns} dataSource={orders} size="middle" />
    </>
  );
};
export default Settlement;
