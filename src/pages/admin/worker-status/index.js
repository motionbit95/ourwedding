import {
  Button,
  Col,
  Flex,
  message,
  Segmented,
  Space,
  Table,
  Upload,
} from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import qs from "qs";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";

const API_URL = process.env.REACT_APP_API_URL;

const ADDITIONAL_OPTION_MAP = {
  film: "필름",
  person: "인원추가",
  edit: "합성",
};

function WorkerStatus() {
  const [alignValue, setAlignValue] = React.useState("전체");
  const [dayValue, setDayValue] = React.useState("전체");
  const [stateValue, setStateValue] = React.useState("전체");
  const [orders, setOrders] = React.useState([]);

  const [isLoading, setLoading] = useState();
  const [selectOrder, setSelectOrder] = useState();

  const [photoList, setPhotoList] = useState();

  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = useCallback(
    (type, content) => {
      messageApi.open({
        type,
        content,
      });
    },
    [messageApi]
  );

  const customUpload = ({ file, onSuccess }) => {
    onSuccess("ok"); // 강제로 성공 처리
  };

  const handlePhotoUpload = async ({ file, fileList }, order) => {
    setLoading({ isLoading: true, type: "재수정" });
    if (!order) return;
    setSelectOrder(order);
    if (file.status === "done") {
      console.log("order :", order);

      const file_ = await uploadFiles(fileList, order.userName, order.userId);
      const downloadLinkAddr = file_.map((f) => f.downloadLink);

      console.log(downloadLinkAddr);

      const order_ = {
        ...order,
        photoCount: photoList.length,
        reWorkDownload: downloadLinkAddr,
        division: "재수정완료",
      };

      const { data } = await axios.put(
        `${API_URL}/order/${order.id}`, // ✅ 여기에 실제 API 엔드포인트 입력
        order_,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log(data);
      setLoading({ isLoading: false, type: "1차보정" });
      showMessage(
        "success",
        `${file.name} 사진이 성공적으로 업로드되었습니다.`
      );

      // 약간의 딜레이 후 새로고침 (사용자에게 메시지가 보이도록)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      setLoading({ isLoading: false, type: "재수정" });
    }
    setPhotoList(fileList);
  };

  const uploadFiles = async (fileList, userName, userId) => {
    try {
      const uploadPromises = fileList.map(async (file, index) => {
        const fileObj = file.originFileObj;
        const fileExtension = fileObj.name.substring(
          fileObj.name.lastIndexOf(".")
        );
        const rawFileName = `아워웨딩_선작업_${userName}_${userId}_${
          index + 1
        }${fileExtension}`;
        const encodedFileName = encodeURIComponent(rawFileName);

        const storageRef = ref(storage, `temp/${encodedFileName}`);

        // 1. Firebase Storage에 업로드
        await uploadBytes(storageRef, fileObj);

        // 2. 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(storageRef);

        // 3. 백엔드에 전송 (URL 방식)
        const res = await axios.post(`${API_URL}/upload`, {
          fileUrl: downloadURL,
          originalFileName: encodedFileName,
        });

        // 4. 업로드 성공 시 Firebase Storage 파일 삭제
        await deleteObject(storageRef);
        console.log("📤 파일 업로드 및 삭제 성공:", res.data);

        return res.data;
      });

      const results = await Promise.all(uploadPromises);
      console.log("📤 모든 파일 업로드 완료:", results);
      return results;
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error.message);
      throw error;
    }
  };

  const handleDownloadZipOrigin = async (record) => {
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
      const filename = `${record.userName}_${record.orderNumber}_원본.zip`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
    }
  };

  const handleDownloadZipPre = async (record) => {
    setLoading({ isLoading: true, type: "선작업" });
    setSelectOrder(record);
    try {
      const response = await axios.post(
        `${API_URL}/download-zip`,
        {
          photoDownload: record.preDownload,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const filename = `${record.userName}_${record.orderNumber}_선작업.zip`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
    }
    setLoading({ isLoading: false, type: "선작업" });
  };

  const handleDownloadZipFirstWork = async (record) => {
    setLoading({ isLoading: true, type: "1차보정" });
    setSelectOrder(record);
    try {
      const response = await axios.post(
        `${API_URL}/download-zip`,
        {
          photoDownload: record.firstWorkDownload,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const filename = `${record.userName}_${record.orderNumber}_1차보정.zip`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
    }
    setLoading({ isLoading: false, type: "1차보정" });
  };

  const getOrders = async (company, day) => {
    try {
      const response = await axios.get(`${API_URL}/order/filter`, {
        params: {
          company,
          day,
          step: ["1차보정완료", "재수정완료", "샘플완료"],
        },
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }), // ✅ 핵심
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
      title: "날짜",
      dataIndex: "receivedDate",
      key: "receivedDate",
      align: "center",
    },

    {
      title: "장수(신규/재수정)(추가결제)",
      key: "photoInfo",
      align: "center",
      render: (_, record) => {
        const photoCount = record.photoDownload?.length || "0";
        const revisionCount = record.revisionDownload?.length || "0";
        const options = Array.isArray(record.additionalOptions)
          ? record.additionalOptions
              .map((opt) => ADDITIONAL_OPTION_MAP[opt] || opt)
              .join(", ")
          : "";

        return options ? `${photoCount}장 (${options})` : `${photoCount}장`;
      },
    },
    {
      title: "원본",
      align: "center",
      render: (_, record) => (
        <Button
          onClick={() => handleDownloadZipOrigin(record)}
          loading={
            record?.id === selectOrder?.id &&
            isLoading.isLoading &&
            isLoading.type === "원본"
          }
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "선작업본",
      align: "center",
      render: (_, record) => (
        <Button
          onClick={() => handleDownloadZipPre(record)}
          loading={
            record?.id === selectOrder?.id &&
            isLoading.isLoading &&
            isLoading.type === "선작업"
          }
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "뷰탭",
      align: "center",
      render: (_, record) => <Button>뷰탭</Button>,
    },
    {
      title: "1차보정본",
      align: "center",
      render: (_, record) => (
        <>
          <Button>업로드</Button>
        </>
      ),
    },
    {
      title: "전송예약",
      align: "center",
      render: (_, record) =>
        record.label === "샘플" ? (
          <Flex vertical gap={"small"}>
            <Button>워터마크 O</Button>
            <Button>워터마크 X</Button>
          </Flex>
        ) : (
          <Button>예약</Button>
        ),
    },
  ];

  return (
    <div style={{ margin: "0 auto", padding: "20px" }}>
      {contextHolder}
      <Flex style={{ justifyContent: "space-between" }}>
        <Space>
          <Segmented
            value={stateValue}
            style={{ marginBottom: 8 }}
            // onChange={setDayValue}
            options={["전체", "작업 O", "작업 X"]}
          />
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
              backgroundColor: "rgba(244, 251, 255, 1)",
            }}
          />
          <div>신규</div>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(248, 236, 236, 1) ",
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
          rowClassName={
            (record) =>
              record.label === "샘플"
                ? "sample-row"
                : record.label === "신규"
                ? "new-row "
                : "revision-row " // 재수정
          }
          scroll={{ x: "max-content" }} // 👉 가로 스크롤
        />
      </div>

      <style jsx>{`
        .sample-row {
          background-color: rgba(234, 244, 233, 1) !important;
        }

        .new-row {
          background-color: rgba(244, 251, 255, 1) !important;
        }

        .revision-row {
          background-color: rgba(248, 236, 236, 1) !important;
        }

        th.highlight-header {
          background-color: rgba(255, 250, 215, 1) !important;
        }
      `}</style>
    </div>
  );
}

export default WorkerStatus;
