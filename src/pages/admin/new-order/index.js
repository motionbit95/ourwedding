import { Button, Flex, Segmented, Space, Table } from "antd";
import axios from "axios";
import React, { useEffect } from "react";

import JSZip from "jszip";
import { saveAs } from "file-saver";

const API_URL = process.env.REACT_APP_API_URL;

const ADDITIONAL_OPTION_MAP = {
  film: "필름",
  person: "인원추가",
  edit: "합성",
};

const handleDownloadZip = async (record) => {
  try {
    const response = await axios.post(
      `${API_URL}/download-zip`,
      {
        photoDownload: record.photoDownload,
        referenceDownload: record.referenceDownload,
      },
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/zip" });
    const filename = `${record.userName}_${record.orderNumber}.zip`;
    saveAs(blob, filename);
  } catch (error) {
    console.error("ZIP 다운로드 실패:", error);
  }
};

function NewOrder() {
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
      title: "업체",
      dataIndex: "company",
      key: "company",
      align: "center",
    },
    {
      title: "이름",
      dataIndex: "userName",
      key: "userName",
      align: "center",
    },
    {
      title: "아이디",
      dataIndex: "userId",
      key: "userId",
      align: "center",
    },
    {
      title: "상품주문번호",
      dataIndex: "orderNumber",
      key: "orderNumber",
      align: "center",
    },
    {
      title: "날짜",
      dataIndex: "receivedDate",
      key: "receivedDate",
      align: "center",
    },
    {
      title: "등급",
      dataIndex: "grade",
      key: "grade",
      align: "center",
    },
    {
      title: "장수(추가결제 여부 및 종류)",
      key: "photoInfo",
      align: "center",
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
    {
      title: "요청사항",
      align: "center",
      render: (_, record) => (
        <div
          style={{
            justifySelf: "center",
            borderRadius: "100px",
            width: 20,
            height: 20,
            padding: 0,
            margin: 0,
            border: "none",
            backgroundColor: "rgba(255, 217, 93, 1)",
          }}
        />
      ),
    },
    {
      title: "원본",
      align: "center",
      className: "highlight-header",
      render: (_, record) => (
        <Button onClick={() => handleDownloadZip(record)}>다운로드</Button>
      ),
    },
    {
      title: "선작업본",
      align: "center",
      className: "highlight-header",
      render: (_, record) => <Button>업로드</Button>,
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
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.division === "샘플" ? "sample-row" : ""
          }
          scroll={{ x: "max-content" }} // 👉 가로 스크롤
        />
      </div>

      <style jsx>{`
        .sample-row {
          background-color: rgba(234, 244, 233, 1) !important;
        }

        th.highlight-header {
          background-color: rgba(255, 250, 215, 1) !important;
        }
        .ant-table-wrapper .ant-pagination {
          justify-content: center !important;
        }
      `}</style>
    </div>
  );
}

export default NewOrder;
