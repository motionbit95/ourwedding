import {
  Button,
  Col,
  Flex,
  message,
  Popover,
  Segmented,
  Space,
  Table,
  Upload,
} from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL;

const ADDITIONAL_OPTION_MAP = {
  film: "필름",
  person: "인원추가",
  edit: "합성",
};

const GRADE_WORK_DAYS = {
  "S 샘플": 4,
  "1 씨앗": 7,
  "2 새싹": 4,
  "3 나무": 2,
  "# 숲": 0.125, // 3시간 = 0.125일
};

function FileSend() {
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

    setLoading({ isLoading: true, type: "1차보정-업로드" });
    setSelectOrder(order);

    if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      setLoading({ isLoading: false, type: "1차보정-업로드" });
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
    const downloadLinkAddr = file_.map((f) => f.downloadLink);

    console.log(downloadLinkAddr);

    const order_ = {
      ...selectOrder,
      photoCount: photoList.length,
      firstWorkDownload: downloadLinkAddr,
      division: "1차보정완료",
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
    setLoading({ isLoading: false, type: "1차보정-업로드" });

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
      title: "전송여부",
      dataIndex: "send",
      key: "send",
      align: "center",
      render: (_, record) => {
        return record.send ? "O" : "X";
      },
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
      render: (_, record) => {
        return (
          <Popover
            content={
              <Flex vertical gap={10}>
                <div>
                  <strong>아이디</strong>
                  <div>{record.userId}</div>
                </div>
                <div>
                  <strong>상품주문번호</strong>
                  <div>{record.orderNumber}</div>
                </div>
              </Flex>
            }
          >
            <Button>{record.userName}</Button>
          </Popover>
        );
      },
    },
    {
      title: "날짜(전송날짜)",
      dataIndex: "receivedDate",
      key: "receivedDate",
      align: "center",
      render: (_, record) => {
        const receivedDate = dayjs(record.receivedDate); // 예: '2025-04-19'
        const workDays = GRADE_WORK_DAYS[record.grade] || 0;

        // workDays가 1보다 작으면 시간으로 더하기 (예: 0.125일 = 3시간)
        const sendDate =
          workDays < 1
            ? receivedDate.add(workDays * 24, "hour")
            : receivedDate.add(workDays, "day");

        return (
          <div>
            <div>{receivedDate.format("YYYY-MM-DD")}</div>
            <div>{sendDate.format("YYYY-MM-DD")}</div>
          </div>
        );
      },
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
      title: "뷰탭",
      align: "center",
      render: (_, record) => <Button>뷰탭</Button>,
    },
    {
      title: "1차보정본",
      align: "center",
      render: (_, record) => (
        <>
          {record.division === "1차보정완료" && (
            <Flex vertical gap={"small"}>
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
                    isLoading.type === "1차보정-업로드"
                  }
                >
                  업로드
                </Button>
              </Upload>
            </Flex>
          )}
        </>
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
          <>
            {record.division === "재수정완료" && (
              <Flex vertical gap={"small"}>
                <Button
                  onClick={() => handleDownloadZipFirstWork(record)}
                  loading={
                    record?.id === selectOrder?.id &&
                    isLoading?.isLoading &&
                    isLoading.type === "재수정"
                  }
                >
                  다운로드
                </Button>

                <Button>업로드</Button>
              </Flex>
            )}
          </>
        </Upload>
      ),
    },
    {
      title: "샘플",
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
          <>
            {record.division === "샘플완료" && (
              <Flex vertical gap={"small"}>
                <Button>워터마크 O</Button>

                <Button>워터마크 X</Button>
              </Flex>
            )}
          </>
        </Upload>
      ),
    },
    {
      title: "바로전송",
      align: "center",
      render: (_, record) => <Button>전송</Button>,
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
            options={["전체", "아워웨딩", "테일리티", "새로운거"]}
          />
          <Segmented
            value={dayValue}
            style={{ marginBottom: 8 }}
            // onChange={setDayValue}
            options={["전체", "전송 O", "전송 X"]}
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

export default FileSend;
