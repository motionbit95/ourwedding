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
import React, { useCallback, useEffect, useRef, useState } from "react";

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

function PreWork() {
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

    setLoading({ isLoading: true, type: "1차보정" });
    setSelectOrder(order);

    if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      setLoading({ isLoading: false, type: "1차보정" });
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
      preworkDownload: downloadLinkAddr,
      division: selectOrder.label === "샘플" ? "샘플완료" : "1차보정완료",
      step: selectOrder.label === "샘플" ? "샘플완료" : "1차보정완료",
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
    showMessage("success", "1차보정이 완료되었습니다.");

    // ✅ 로딩 해제
    setLoading({ isLoading: false, type: "1차보정" });

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
        }_1차보정_${userName}_${userId}_${index + 1}${fileExtension}`;
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
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
    }
    setLoading({ isLoading: false, type: "원본" });
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

  const getOrders = async (company, day) => {
    try {
      const response = await axios.get(`${API_URL}/order/filter`, {
        params: { company, day, step: "선작업" },
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
    // {
    //   title: "작업자 지정",
    //   align: "center",
    //   render: (_, record) =>
    //     record.worker ? (
    //       <Popover
    //         content={
    //           <div style={{ whiteSpace: "pre-line" }}>
    //             {`${record.worker?.admin_name}(${record.worker?.worker_id})`}
    //           </div>
    //         }
    //         title="작업자"
    //       >
    //         <Button
    //           type={record.worker ? "primary" : "default"}
    //           onClick={() => {
    //             setSelectOrder(record);
    //             showModal();
    //           }}
    //           icon={record.worker ? <BsCheck /> : <BsX />}
    //         ></Button>
    //       </Popover>
    //     ) : (
    //       <Button
    //         type={record.worker ? "primary" : "default"}
    //         onClick={() => {
    //           setSelectOrder(record);
    //           showModal();
    //         }}
    //         icon={record.worker ? <BsCheck /> : <BsX />}
    //       ></Button>
    //     ),
    // },
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
      className: "highlight-header",
    },
    {
      title: "장수(추가결제 여부 및 종류)",
      key: "photoInfo",
      align: "center",
      className: "highlight-header",
      render: (_, record) => {
        const count = record.photoDownload.length || "0";
        const options = Array.isArray(record.additionalOptions)
          ? record.additionalOptions
              .map((opt) => ADDITIONAL_OPTION_MAP[opt] || opt)
              .join(", ")
          : "";

        return options ? `${count}장 (${options})` : `${count}장`;
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
              isLoading.type === "1차보정"
            }
          >
            업로드
          </Button>
        </Upload>
      ),
    },
  ];

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
    // console.log(selectOrder);

    // axios
    //   .put(`${API_URL}/order/${selectOrder.id}`, { worker: selectedWorker })
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    setIsModalOpen(false); // 모달 닫기
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState();

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

  const handleWorker = async () => {
    console.log(selectedOrders, selectedWorker);

    await selectedOrders.map(async (order, index) => {
      axios
        .put(`${API_URL}/order/${order.id}`, {
          worker: selectedWorker,
          division: "작업중",
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    });

    showMessage("success", "작업자를 할당했습니다.");
    getOrders(alignValue, dayValue);
  };
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
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h3>주문 목록</h3>
          <Space>
            <Button
              type={selectedWorker ? "primary" : "default"}
              onClick={() => {
                showModal();
              }}
            >
              {selectedWorker ? selectedWorker?.admin_name : "작업자 선택"}
            </Button>
            <Button disabled={!selectedOrders} onClick={handleWorker}>
              할당하기
            </Button>
          </Space>
        </Space>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.grade === "S 샘플"
              ? "sample-row"
              : record.step === "재수정"
              ? "revision-row"
              : "new-row"
          }
          scroll={{ x: "max-content" }}
          rowSelection={
            selectedWorker
              ? {
                  onChange: (selectedRowKeys, selectedRows) => {
                    console.log("선택된 주문:", selectedRows);
                    setSelectedOrders(selectedRows);
                  },
                }
              : undefined
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

export default PreWork;
