import {
  Button,
  Flex,
  message,
  Modal,
  Popover,
  Segmented,
  Space,
  Table,
  Upload,
} from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import { BsCheck, BsX } from "react-icons/bs";

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

function ReOrder() {
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

  const handlePhotoUpload = async ({ file, fileList }, order) => {
    setLoading({ isLoading: true, type: "재수정" });
    if (!order) return;
    setSelectOrder(order);
    if (file.status === "done") {
      console.log("order :", order);

      const file_ = await uploadFiles(fileList, order.userName, order.userId);
      const downloadLinkAddr = file_.map((f) => ({
        originalFileName: f.originalFileName,
        downloadLink: f.downloadLink,
        viewLink: f.viewLink,
      }));

      console.log(downloadLinkAddr);

      const order_ = {
        ...order,
        photoCount: photoList.length,
        reWorkDownload: downloadLinkAddr,
        division: "재수정완료",
        step: "재수정완료",
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
        params: { company, day, step: "재수정" },
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (!selectedWorker) {
      message.warning("작업자를 선택해주세요.");
      return;
    }

    console.log("선택된 작업자:", selectedWorker);
    // 여기서 원하는 동작 실행 (예: 서버 전송, state 업데이트 등)
    console.log(selectOrder);

    axios
      .put(`${API_URL}/order/${selectOrder.id}`, { worker: selectedWorker })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });

    setIsModalOpen(false); // 모달 닫기
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    const getWorkers = async () => {
      try {
        const { data: workData } = await axios.get(`${API_URL}/work`);
        const workEntries = Object.entries(workData);

        // worker_id 기준으로 그룹화 및 총 photo_count 계산
        const photoCountByWorker = {};
        for (const [_, work] of workEntries) {
          const { worker_id, photo_count = 0 } = work;
          if (!photoCountByWorker[worker_id]) {
            photoCountByWorker[worker_id] = 0;
          }
          photoCountByWorker[worker_id] += photo_count;
        }

        const uniqueWorkerIds = Object.keys(photoCountByWorker);

        // 관리자 정보 요청
        const workerPromises = uniqueWorkerIds.map((id) =>
          axios.get(`${API_URL}/admin/${id}`).then((res) => res.data.admin)
        );
        const adminInfos = await Promise.all(workerPromises);

        // 최종 결과 조합
        const result = uniqueWorkerIds.map((worker_id, idx) => ({
          worker_id,
          admin_name: adminInfos[idx].admin_name,
          photo_total: photoCountByWorker[worker_id],
        }));

        console.log("작업자별 총 사진 수:", result);
        setWorkers(result);
      } catch (error) {
        console.error("작업자 정보 조회 실패:", error);
      }
    };

    getWorkers();
  }, []);

  const columns = [
    {
      title: "작업자 지정",
      align: "center",
      render: (_, record) =>
        record.worker ? (
          <Popover
            content={
              <div style={{ whiteSpace: "pre-line" }}>
                {`${record.worker?.admin_name}(${record.worker?.worker_id})`}
              </div>
            }
            title="작업자"
          >
            <Button
              type={record.worker ? "primary" : "default"}
              onClick={() => {
                setSelectOrder(record);
                showModal();
              }}
              icon={<BsCheck />}
            ></Button>
          </Popover>
        ) : (
          <Button
            type={record.worker ? "primary" : "default"}
            onClick={() => {
              setSelectOrder(record);
              showModal();
            }}
            icon={<BsX />}
          ></Button>
        ),
    },
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
      title: "작업자",
      align: "center",
      className: "highlight-header",
    },
    {
      title: "장수(신규/재수정)(추가결제)",
      key: "photoInfo",
      align: "center",
      className: "highlight-header",
      render: (_, record) => {
        const photoCount = record.photoDownload.length || "0";
        const revisionCount = record.revisionDownload.length || "0";
        const options = Array.isArray(record.additionalOptions)
          ? record.additionalOptions
              .map((opt) => ADDITIONAL_OPTION_MAP[opt] || opt)
              .join(", ")
          : "";

        return options
          ? `${photoCount} / ${revisionCount} (${options})`
          : `${photoCount} / ${revisionCount}`;
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
      render: (_, record) => (
        <Button
          onClick={() => handleDownloadZipOrigin(record)}
          loading={
            record?.id === selectOrder?.id &&
            isLoading?.isLoading &&
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
            isLoading?.isLoading &&
            isLoading.type === "선작업"
          }
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "1차보정본",
      align: "center",
      render: (_, record) => (
        <Button
          onClick={() => handleDownloadZipFirstWork(record)}
          loading={
            record?.id === selectOrder?.id &&
            isLoading?.isLoading &&
            isLoading.type === "1차보정"
          }
        >
          다운로드
        </Button>
      ),
    },
    {
      title: "재수정본",
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
              isLoading.type === "재수정"
            }
          >
            업로드
          </Button>
        </Upload>
      ),
    },
  ];

  return (
    <div style={{ margin: "0 auto", padding: "20px" }}>
      {contextHolder}
      <Flex style={{ justifyContent: "space-between" }}>
        <Space>
          <Segmented
            value={alignValue}
            style={{ marginBottom: 8 }}
            onChange={setAlignValue}
            options={["전체", "아워웨딩", "테일리티", "원츠웨딩"]}
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

      <Modal
        title="작업자 지정"
        open={isModalOpen}
        okText={"확인"}
        cancelText={"취소"}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          rowKey="worker_id"
          rowSelection={{
            type: "radio", // 하나만 선택
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedWorker(selectedRows[0]);
            },
          }}
          columns={[
            {
              title: "ID",
              dataIndex: "worker_id",
              key: "worker_id",
              align: "center",
            },
            {
              title: "이름",
              dataIndex: "admin_name",
              key: "admin_name",
              align: "center",
            },
            {
              title: "장수",
              dataIndex: "photo_total",
              key: "photo_total",
              align: "center",
            },
          ]}
          dataSource={workers}
        />
      </Modal>
    </div>
  );
}

export default ReOrder;
