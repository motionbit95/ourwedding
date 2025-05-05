import { Button, Flex, message, Segmented, Space, Table, Upload } from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import qs from "qs";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { saveAs } from "file-saver";
import { BsDownload, BsUpload } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ADDITIONAL_OPTION_MAP = {
  film: "필름",
  person: "인원추가",
  edit: "합성",
  skin: "피부",
  body: "체형(+얼굴)",
  filter: "필터",
  background: "배경 보정",
  retouch: "리터치",
};

function WorkList() {
  const navigate = useNavigate();
  const [alignValue, setAlignValue] = React.useState("전체");
  const [dayValue, setDayValue] = React.useState("전체");
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

  const uploadTimer = useRef(null);

  const handlePhotoUpload = ({ file, fileList }, order) => {
    if (!order) return;

    setLoading({ isLoading: true, type: "업로드" });
    setSelectOrder(order);

    if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      setLoading({ isLoading: false, type: "업로드" });
    }

    // 디바운스 처리로 여러 번 호출 방지
    if (uploadTimer.current) clearTimeout(uploadTimer.current);

    uploadTimer.current = setTimeout(() => {
      const allDone = fileList.every((f) => f.status === "done");
      if (allDone) {
        setPhotoList(fileList); // 여기서 한 번만 처리
        console.log("최종 order :", order);
        // 여기서 handleUpload 호출해도 됨
        // handleUpload();
      }
    }, 300); // 300ms 후 모든 업로드 완료됐을 때 한 번만 실행
  };

  useEffect(() => {
    if (photoList && photoList.length > 0) {
      handleUpload();
    }
  }, [photoList]);

  const handleUpload = async () => {
    const file_ = await uploadFiles(
      photoList,
      selectOrder.userName,
      selectOrder.userId
    );
    const downloadLinkAddr = file_.map((f) => ({
      originalFileName: f.originalFileName,
      downloadLink: f.downloadLink,
      viewLink: f.viewLink,
    }));

    console.log(downloadLinkAddr);

    const order_ = {
      ...selectOrder,
      photoCount: photoList.length,
      firstWorkDownload: downloadLinkAddr,
      division: selectOrder.label === "신규" ? "1차보정완료" : "재수정완료",
    };

    const { data } = await axios.put(
      `${API_URL}/order/${selectOrder.id}`, // ✅ 여기에 실제 API 엔드포인트 입력
      order_,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log(data);
    // ✅ 성공 메시지
    showMessage("success", "업로드가 완료되었습니다.");

    // ✅ 로딩 해제
    setLoading({ isLoading: false, type: "업로드" });

    // ✅ 1초 후 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const uploadFiles = async (fileList, userName, userId) => {
    try {
      const uploadPromises = fileList.map(async (file, index) => {
        const fileObj = file.originFileObj;
        const fileExtension = fileObj.name.substring(
          fileObj.name.lastIndexOf(".")
        );
        const rawFileName = `${
          selectOrder.company
        }_선작업_${userName}_${userId}_${index + 1}${fileExtension}`;
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
    setLoading({ isLoading: true, type: "원본" });
    if (!record) return;
    setSelectOrder(record);
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
      setLoading({ isLoading: false, type: "원본" });
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
      setLoading({ isLoading: false, type: "원본" });
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

      console.log("📦 워커 주문 리스트:", orderList);
      setOrders(orderList);
    } catch (error) {
      console.error("주문 불러오기 실패:", error);
    }
  };

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

  const columns = [
    {
      title: "이름(고객명)",
      align: "center",
      dataIndex: "userName",
      key: "userName",
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
      title: "보정장수",
      align: "center",
      key: "photoInfo",
      render: (_, record) => {
        const count = record.photoDownload.length || "0";

        return `${count}장`;
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
            isLoading?.isLoading &&
            isLoading.type === "원본"
          }
          // icon={<BsDownload />}
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
            isLoading?.isLoading &&
            isLoading.type === "선작업"
          }
          // icon={<BsDownload />}
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "1차보정본/재수정본",
      align: "center",
      render: (_, record) => (
        <Button
          disabled={!(record.firstWorkDownload || record.secondWorkDownload)}
          onClick={() => handleDownloadZipFirstWork(record)}
          loading={
            record?.id === selectOrder?.id &&
            isLoading?.isLoading &&
            isLoading.type === "1차보정"
          }
          // icon={<BsDownload />}
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "업로드",
      align: "center",
      render: (_, record) => (
        <Upload
          accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
          multiple
          onChange={(info) => handlePhotoUpload(info, record)} // order를 인자로 넘김
          fileList={photoList}
          showUploadList={false}
          customRequest={customUpload}
          beforeUpload={(file) => {
            const isValidType = [
              ".raw",
              ".jpeg",
              ".jpg",
              ".cr2",
              ".cr3",
              ".heic",
            ].some((ext) => file.name.toLowerCase().endsWith(ext));
            if (!isValidType) {
              showMessage("error", "지원하지 않는 파일 형식입니다");
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
        >
          <Button
            loading={
              record?.id === selectOrder?.id &&
              isLoading?.isLoading &&
              isLoading.type === "업로드"
            }
            // icon={<BsUpload />}
          >
            업로드
          </Button>
        </Upload>
      ),
    },
  ];

  return (
    <div style={{ margin: "0 auto", padding: "20px" }}>
      <Flex style={{ justifyContent: "flex-end" }}>
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
        </Space>
      </Flex>

      <div style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={orders} // 이제 순수 order 객체 배열!
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

export default WorkList;
