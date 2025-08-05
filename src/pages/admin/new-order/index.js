import {
  Button,
  DatePicker,
  Flex,
  Form,
  message,
  Modal,
  Popover,
  Segmented,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import qs from "qs";
import dayjs from "dayjs";

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

const { Option } = Select;

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

function NewOrder() {
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

  const handleDownloadZip = async (record) => {
    try {
      setSelectOrder(record);
      setLoading({ isLoading: true, type: "원본" });
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
      setLoading({ isLoading: false, type: "원본" });
      saveAs(blob, filename);
    } catch (error) {
      console.error("ZIP 다운로드 실패:", error);
      setLoading({ isLoading: false, type: "원본" });
    }
  };

  const customUpload = ({ file, onSuccess }) => {
    onSuccess("ok"); // 강제로 성공 처리
  };

  const uploadTimer = useRef(null);

  const handlePhotoUpload = ({ file, fileList }, order) => {
    if (!order) return;

    setLoading({ isLoading: true, type: "선작업" });
    setSelectOrder(order);

    if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
      setLoading({ isLoading: false, type: "선작업" });
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

  // Constants
  const GRADES = {
    원츠웨딩: [
      ["샘플", "4일"],
      ["~4일까지", "4일"],
      ["~48시간안에", "48시간"],
      ["당일 6시간 안에(3장이상부터)", "6시간"],
    ],
    아워웨딩: [
      ["S 샘플", "4일이내"],
      ["1 씨앗", "7일이내"],
      ["2 새싹", "4일이내"],
      ["3 나무", "2일이내"],
      ["# 숲", "3시간이내"],
    ],
    테일리티: [
      ["~4일", "기본"],
      ["~48시간", "추가금 : 1500원"],
    ],
  };

  // 등급에서 기간 가져오기
  const getDurationByGrade = (company, grade) => {
    const found = GRADES[company].find(([g]) => g === grade);
    return found?.[1];
  };

  // 기간으로 deadline 구하기
  const getDeadline = (duration) => {
    const now = dayjs();

    if (!duration) return "알 수 없음";

    if (duration.includes("일")) {
      const days = parseInt(duration);
      return now.add(days, "day").format("YYYY-MM-DD");
    } else if (duration.includes("시간")) {
      const hours = parseInt(duration);
      return now.add(hours, "hour").format("YYYY-MM-DD HH:mm");
    }
    return "알 수 없음";
  };

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

    const duration = getDurationByGrade(selectOrder.company, selectOrder.grade);
    const deadline = getDeadline(duration);

    const order_ = {
      ...selectOrder,
      photoCount: photoList.length,
      firstWorkDownload: downloadLinkAddr,
      division: selectOrder.label === "샘플" ? "샘플완료" : "선작업",
      step:
        selectOrder.label === "샘플"
          ? "작업 진행중"
          : selectOrder.label === "신규"
          ? `1차보정본 작업중 ${deadline}`
          : `재수정 작업중 ${deadline}`,
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
    showMessage("success", "선작업이 완료되었습니다.");

    // ✅ 로딩 해제
    setLoading({ isLoading: false, type: "선작업" });

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

  const getOrders = async (company, day) => {
    try {
      const response = await axios.get(`${API_URL}/order/filter`, {
        params: { company, day, step: ["주문접수완료"] },
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const handleEditClick = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      deadline: dayjs(record.deadline),
      grade: record.grade,
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const { data } = await axios.put(
        `${API_URL}/order/${editingRecord.id}`, // ✅ 여기에 실제 API 엔드포인트 입력
        {
          ...editingRecord,
          deadline: form
            .getFieldValue("deadline")
            .format("YYYY-MM-DD hh:mm:ss"),
          grade: form.getFieldValue("grade"),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert("❌ 주문 저장 실패");
      }
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("🚨 서버 오류");
    }

    form.validateFields().then(async (values) => {
      const updated = orders.map((order) =>
        order.id === editingRecord.id
          ? {
              ...order,
              deadline: values.deadline.format("YYYY-MM-DD hh:mm:ss"),
              grade: values.grade,
            }
          : order
      );
      setOrders(updated);

      setIsModalOpen(false);
    });
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
      title: "요청사항",
      align: "center",
      render: (_, record) => (
        <Popover
          content={
            <div style={{ whiteSpace: "pre-line" }}>{record.comment}</div>
          }
          title="요청사항"
        >
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
        </Popover>
      ),
    },
    {
      title: "원본",
      align: "center",
      className: "highlight-header",
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => handleDownloadZip(record)}
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
      className: "highlight-header",
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
            size="small"
            loading={
              record?.id === selectOrder?.id &&
              isLoading?.isLoading &&
              isLoading.type === "선작업"
            }
          >
            업로드
          </Button>
        </Upload>
      ),
    },
    // {
    //   title: "수정",
    //   key: "action",
    //   align: "center",
    //   render: (_, record) => (
    //     <Button size="small" onClick={() => handleEditClick(record)}>
    //       수정
    //     </Button>
    //   ),
    // },
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

      <Modal
        open={isModalOpen}
        title="항목 수정"
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        okText="확인"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="deadline"
            label="날짜"
            rules={[{ required: true, message: "날짜를 선택해주세요" }]}
          >
            <DatePicker
              format="YYYY-MM-DD hh:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="grade"
            label="등급"
            rules={[{ required: true, message: "등급을 선택해주세요" }]}
          >
            <Select placeholder="등급 선택">
              {GRADES[editingRecord?.company]?.map(([grade, time]) => (
                <Select.Option key={grade} value={grade}>
                  {`${grade}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

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

export default NewOrder;
