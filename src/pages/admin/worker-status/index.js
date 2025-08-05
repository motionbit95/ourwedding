import {
  Button,
  Checkbox,
  Col,
  Flex,
  Image,
  message,
  Modal,
  Segmented,
  Space,
  Table,
  Tag,
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
      firstWorkDownload: downloadLinkAddr,
      division: "1차보정완료",
      step: "1차보정완료",
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
    try {
      setLoading({ isLoading: true, type: "원본" });
      setSelectOrder(record);
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

  const getOrders = async (company, day) => {
    try {
      const response = await axios.get(`${API_URL}/order/filter`, {
        params: {
          company,
          day,
          step: ["1차보정완료", "재수정완료", "샘플완료", "작업중"],
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

  const handleReservation = async (order) => {
    const order_ = {
      division: "전송예약",
    };

    console.log(order_, order.id);

    try {
      const { data } = await axios.put(
        `${API_URL}/order/${order.id}`, // ✅ 여기에 실제 API 엔드포인트 입력
        order_,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        alert(`✅ 예약이 성공적으로 접수되었습니다.`);
        getOrders(alignValue, dayValue);
      } else {
        alert("❌ 주문 저장 실패");
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("🚨 서버 오류");
      setLoading(false);
    }
  };

  const handleSampleReservation = async (order, isWatermark) => {
    const order_ = {
      watermark: isWatermark,
      division: "전송예약",
    };

    console.log(order_, order.id);

    try {
      const { data } = await axios.put(
        `${API_URL}/order/${order.id}`, // ✅ 여기에 실제 API 엔드포인트 입력
        order_,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        alert(`✅ 예약이 성공적으로 접수되었습니다.`);
        getOrders(alignValue, dayValue);
      } else {
        alert("❌ 주문 저장 실패");
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("🚨 서버 오류");
      setLoading(false);
    }
  };

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
      className: "highlight-header",
      render: (_, record) => <ViewTabModal record={record} />,
    },
    {
      title: "1차보정본",
      align: "center",
      className: "highlight-header",
      render: (_, record) => (
        <>
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
              type={
                record.preworkDownload && record.preworkDownload.length > 0
                  ? "primary"
                  : "default"
              }
              loading={
                record?.id === selectOrder?.id &&
                isLoading?.isLoading &&
                isLoading.type === "1차보정"
              }
            >
              업로드
            </Button>
          </Upload>
        </>
      ),
    },
    {
      title: "전송예약",
      align: "center",
      className: "highlight-header",
      render: (_, record) =>
        record.label === "샘플" ? (
          <Flex vertical gap={"small"}>
            <Button onClick={() => handleSampleReservation(record, true)}>
              워터마크 O
            </Button>
            <Button onClick={() => handleSampleReservation(record, false)}>
              워터마크 X
            </Button>
          </Flex>
        ) : (
          <Button onClick={() => handleReservation(record)}>예약</Button>
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
    </div>
  );
}

export function ViewTabModal({ record }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);

  const [selectedImages, setSelectedImages] = useState([]);

  /**
   * arr1과 arr2를 파일 번호 기준으로 하나의 배열로 그룹화하여 반환합니다.
   * 예: [ [{...1.jpg}, {...1-1.jpg}], [{...2.jpg}, {...2-1.jpg}] ]
   */
  function groupFilesByNumber(arr1, arr2) {
    const extractBaseNumber = (filename) => {
      const match = filename.match(/(\d+)(?:-\d+)?\.\w+$/);
      return match ? match[1] : null;
    };

    const allFiles = [...arr1, ...arr2];

    const grouped = {};

    allFiles.forEach((file) => {
      const base = extractBaseNumber(file.originalFileName);
      if (!base) return;

      if (!grouped[base]) {
        grouped[base] = [];
      }

      grouped[base].push(file);
    });

    return Object.values(grouped);
  }

  const toggleImageSelection = (img) => {
    setSelectedImages((prev) => {
      const exists = prev.find((i) => i.downloadLink === img.downloadLink);
      return exists
        ? prev.filter((i) => i.downloadLink !== img.downloadLink)
        : [...prev, img];
    });
  };

  const handleOpen = () => {
    const grouped =
      record.label === "신규"
        ? groupFilesByNumber(
            record.photoDownload,
            record.preworkDownload ? record.preworkDownload : []
          )
        : groupFilesByNumber(
            record.photoDownload,
            record.firstWorkDownload ? record.preworkDownload : []
          );
    const flat = grouped.flat(); // 2차원 → 1차원 배열로
    setSelectedImg(flat[0]); // 첫 이미지 기본 선택
    setImages(flat);
    setOpen(true);
  };

  const getFileIdFromLink = (link) => {
    const match = link.match(/id=([^&]+)/);
    return match ? match[1] : null;
  };

  const [loading, setLoading] = useState(false);
  const handleDownloadZip = async (photoDownload) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/download-zip`,
        {
          photoDownload,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const filename = `${record.userName}_${record.orderNumber}_선택사진.zip`;
      saveAs(blob, filename);
      setLoading(false);
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen}>뷰탭</Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={
          <Space>
            <Button>닫기</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleDownloadZip(selectedImages)}
            >
              선택한 사진 다운로드
            </Button>
          </Space>
        }
        width="100%"
      >
        <Flex style={{ height: "80vh" }}>
          {/* 왼쪽 큰 이미지 */}
          <div
            style={{
              flex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedImg && (
              <iframe
                src={`https://drive.google.com/file/d/${getFileIdFromLink(
                  selectedImg.downloadLink
                )}/preview`}
                width="100%"
                height="100%"
                style={{
                  border: "1px solid #ccc",
                  marginBottom: 8,
                  cursor: "pointer",
                }}
              />
            )}
          </div>

          {/* 오른쪽 썸네일 목록 */}
          <Flex vertical>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                background: "#f5f5f5",
                borderLeft: "1px solid #ccc",
                // display: "grid",
                // gridTemplateColumns: "1fr 1fr", // 2열
                gap: "10px",
                gridAutoRows: "120px", // 고정 높이 설정
              }}
            >
              {images.map((img, idx) => {
                const isChecked = selectedImages.some(
                  (i) => i.downloadLink === img.downloadLink
                );
                return (
                  <Space
                    style={{ alignItems: "flex-start", position: "relative" }}
                  >
                    {/* <Tag
                      style={{
                        position: "absolute",
                        zIndex: 99,
                        right: 0,
                        top: 8,
                      }}
                    >
                      {idx % 2 === 0 ? "원본" : "보정본"}
                    </Tag> */}
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleImageSelection(img)}
                    />
                    <Image
                      key={idx}
                      src={`https://drive.google.com/thumbnail?id=${getFileIdFromLink(
                        img.downloadLink
                      )}`}
                      alt={img.originalFileName}
                      style={{
                        width: "100%",
                        height: "120px",
                        border:
                          selectedImg?.downloadLink === img.downloadLink
                            ? "2px solid #1890ff"
                            : "1px solid #ccc",
                        cursor: "pointer",
                        objectFit: "cover", // 이미지 비율 유지하며 채움
                        objectPosition: "center", // 중앙 기준으로 자름
                      }}
                      onClick={() => setSelectedImg(img)}
                      preview={false}
                    />
                  </Space>
                );
              })}
            </div>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}

export default WorkerStatus;
