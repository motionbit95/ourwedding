import { Button, Flex, Segmented, Space, Table } from "antd";
import axios from "axios";
import React, { useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const ADDITIONAL_OPTION_MAP = {
  film: "필름",
  person: "인원추가",
  edit: "합성",
};

function OrderPage() {
  const [alignValue, setAlignValue] = React.useState("전체");
  const [dayValue, setDayValue] = React.useState("전체");
  const [orders, setOrders] = React.useState([]);

  const getOrders = async (company, day) => {
    try {
      const response = await axios.get(`${API_URL}/order/filter`, {
        params: { company, day },
      });

      const data = response.data.orders;

      // 배열이면 그대로, 객체면 변환
      const orderList = Array.isArray(data)
        ? data
        : Object.entries(data || {}).map(([id, order]) => ({
            id,
            ...order,
          }));

      console.log(orderList);
      setOrders(orderList);
    } catch (error) {
      console.error("주문 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    getOrders(alignValue, dayValue);
  }, [alignValue, dayValue]);

  const columns = [
    {
      title: "완료",
      key: "complete",
      align: "center",
      render: (_, record) => <Button>완료</Button>,
      className: "highlight-header",
    },
    {
      title: "업체",
      align: "center",
      dataIndex: "company",
      key: "company",
      className: "highlight-header",
    },
    {
      title: "이름",
      align: "center",
      dataIndex: "userName",
      key: "userName",
      className: "highlight-header",
    },
    {
      title: "아이디",
      align: "center",
      dataIndex: "userId",
      key: "userId",
      className: "highlight-header",
    },
    {
      title: "상품주문번호",
      align: "center",
      dataIndex: "orderNumber",
      key: "orderNumber",
      className: "highlight-header",
    },
    {
      title: "날짜",
      align: "center",
      dataIndex: "receivedDate",
      key: "receivedDate",
    },
    {
      title: "등급",
      align: "center",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "장수(추가결제 여부 및 종류)",
      align: "center",
      key: "photoInfo",
      render: (_, record) => {
        const count = record.photoCount || "0";
        const options = Array.isArray(record.additionalOptions)
          ? record.additionalOptions
              .map((opt) => ADDITIONAL_OPTION_MAP[opt] || opt)
              .join(", ")
          : "";

        return options ? `${count}장 (${options})` : `${count}장`;
      },
    },
  ];

  return (
    <div style={{ margin: "0 auto", padding: "20px" }}>
      <Flex style={{ justifyContent: "space-between" }}>
        <Space>
          <Segmented
            value={alignValue}
            style={{ marginBottom: 8 }}
            onChange={setAlignValue}
            options={["전체", "아워웨딩", "테일리티", "새로운거"]}
          />
          <Segmented
            value={dayValue}
            style={{ marginBottom: 8 }}
            onChange={setDayValue}
            options={["전체", "1일", "3일", "7일"]}
          />
        </Space>

        <Space>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(244, 224, 217, 1)",
            }}
          />
          <div>신규</div>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(242, 229, 203, 1)",
            }}
          />
          <div>재수정</div>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(234, 244, 233, 1)",
            }}
          />
          <div>샘플</div>
        </Space>
      </Flex>

      <div style={{ marginTop: 24 }}>
        <h3>주문 목록</h3>
        <Table
          columns={columns}
          dataSource={orders} // 이제 순수 order 객체 배열!
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.division === "샘플" ? "sample-row" : ""
          }
        />
      </div>

      <style jsx>{`
        .sample-row {
          background-color: rgba(234, 244, 233, 1) !important;
        }

        th.highlight-header {
          background-color: rgba(255, 250, 215, 1) !important;
        }
      `}</style>
    </div>
  );
}

export default OrderPage;
