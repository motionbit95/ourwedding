import {
  Button,
  Checkbox,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  message,
} from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdAttachFile } from "react-icons/md";
import { FiFilePlus } from "react-icons/fi";
import { BsCaretRightFill } from "react-icons/bs";
import { LoadingOutlined } from "@ant-design/icons";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { storage } from "../../../firebaseConfig";
import dayjs from "dayjs";

const API_URL = process.env.REACT_APP_API_URL; // ✅ 환경 변수 사용

// Constants
const GRADES = [
  ["S 샘플", "4일이내"],
  ["1 씨앗", "7일이내"],
  ["2 새싹", "4일이내"],
  ["3 나무", "2일이내"],
  ["# 숲", "3시간이내"],
];

const ADDITIONAL_OPTIONS = [
  ["film", "필름 추가", 1500],
  ["person", "인원 추가", 2000],
  ["edit", "합성", 2000],
];

const CAUTION_ITEMS = [
  {
    text: "업로드 후에는 요청사항/파일은 변동 불가능합니다. 그러므로 신중히 업로드 부탁드립니다.",
  },
  {
    text: (
      <>
        요청사항 중 불가능한 사항에 대해서는 작업 중 따로 연락 드리지 않습니다.
        {"\n"}
        <span style={{ fontWeight: "bold", color: "rgba(147, 67, 67, 1)" }}>
          그러므로 요청사항 중 애매한 부분에 대해서는 업로드 전 미리 사진과 함께
          채팅으로 가능 여부 확인 부탁드립니다.
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        1차 보정본과 최근 재수정(모든 재수정 파일 X) 주신 파일은 요청일로부터
        한달 간 [접수 내역]에서 확인이 가능하나, 그 이후엔 파기되며 완성본에
        대해서 책임지지 않습니다. {"\n"}
        <span style={{ fontWeight: "bold", color: "rgba(147, 67, 67, 1)" }}>
          그러므로 모든 재수정과 작업본은 개인적으로 꼭 저장해주시길 바랍니다.
        </span>
      </>
    ),
  },
  {
    text: "샘플 진행 시 사진은 자사 작업물로 귀속되어 마케팅 채널에 활용될 수 있습니다. ( 모자이크 X )",
  },
];

function NewRequest() {
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [selectedValue, setSelectedValue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [photoList, setPhotoList] = useState([]); // 사진 리스트
  const [referenceFileList, setReferenceFileList] = useState([]); // 레퍼런스 파일 리스트

  const [testFile, setTestFile] = useState();
  const [comment, setComment] = useState();
  const [isLoading, setLoading] = useState();

  const updateFile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const storage = getStorage();
      const customName = `아워웨딩_신규_박수정_krystal_테스트.jpg`;
      const fileRef = ref(storage, `temp/${customName}`);

      // 1. Firebase Storage에 업로드
      await uploadBytes(fileRef, file);

      // 2. 다운로드 URL 가져오기
      const fileUrl = await getDownloadURL(fileRef);

      // 3. 백엔드에 전송 (URL 방식)
      const res = await axios.post(`${API_URL}/upload`, {
        fileUrl,
        originalFileName: encodeURIComponent(customName),
      });

      console.log("📤 Google Drive 업로드 성공:", res.data);

      // 4. Firebase Storage에서 삭제
      await deleteObject(fileRef);
      console.log("🗑️ Firebase Storage에서 삭제 완료");
    } catch (error) {
      console.error("❌ 파일 업로드 실패:", error);
    }
  };

  const customUpload = ({ file, onSuccess }) => {
    onSuccess("ok"); // 강제로 성공 처리
  };

  const handlePhotoUpload = useCallback(({ file, fileList }) => {
    if (file.status === "done") {
      showMessage(
        "success",
        `${file.name} 사진이 성공적으로 업로드되었습니다.`
      );
    } else if (file.status === "error") {
      showMessage("error", `${file.name} 사진 업로드에 실패했습니다.`);
    }
    setPhotoList(fileList);
  }, []);

  const handleReferenceUpload = useCallback(({ file, fileList }) => {
    if (file.status === "done") {
      showMessage("success", `${file.name} 참고 사진 파일이 업로드되었습니다.`);
    } else if (file.status === "error") {
      showMessage(
        "error",
        `${file.name} 참고 사진 파일 업로드에 실패했습니다.`
      );
    }
    setReferenceFileList(fileList);
  }, []);

  const [checkedItems, setCheckedItems] = useState([false, false, false]);

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

  const handleCheck = useCallback((index) => {
    setCheckedItems((prev) => {
      const newCheckedItems = [...prev];
      newCheckedItems[index] = !newCheckedItems[index];
      return newCheckedItems;
    });
  }, []);

  const formattedDate = useMemo(() => {
    const now = new Date();

    const datePart = now
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(/\./g, "");

    const timePart = now.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return `${datePart} ${timePart}`;
  }, []);

  const fontSize = useMemo(() => {
    if (screens.xs) return "28px";
    if (screens.sm) return "32px";
    if (screens.md) return "48px";
    if (screens.lg) return "64px";
    return "20px";
  }, [screens]);

  const paddingBlock = useMemo(() => {
    if (screens.xs) return "60px";
    if (screens.sm) return "80px";
    if (screens.md) return "100px";
    if (screens.lg) return "120px";
    return "20px";
  }, [screens]);

  const paddingBox = useMemo(() => {
    if (screens.xs) return "24px";
    if (screens.sm) return "32px";
    if (screens.md) return "40px";
    if (screens.lg) return "48px";
    return "20px";
  }, [screens]);

  // Handlers
  const handleChange = useCallback((checkedValues) => {
    setSelectedValue((prev) =>
      prev.includes(checkedValues)
        ? prev.filter((value) => value !== checkedValues)
        : [...prev, checkedValues]
    );
  }, []);

  const showModal = useCallback(() => setIsModalOpen(true), []);
  const handleOk = useCallback(() => setIsModalOpen(false), []);
  const handleCancel = useCallback(() => setIsModalOpen(false), []);

  const [formData, setFormData] = useState({
    userName: user?.user_name || "",
    userId: user?.naver_id || "",
    receivedDate: formattedDate || "",
    orderNumber: "",
    grade: "",
    photoCount: 0,
    additionalOptions: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, grade: value }));
  };

  const handleCheckboxChange = (checkedValues) => {
    setFormData((prev) => ({ ...prev, additionalOptions: checkedValues }));
  };

  // 등급에서 기간 가져오기
  const getDurationByGrade = (grade) => {
    const found = GRADES.find(([g]) => g === grade);
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

  const handleFormUpload = async () => {
    setLoading(true);
    const file = await uploadFiles(
      photoList,
      formData.userName,
      formData.userId
    );

    const referenceFile = await uploadReferenceFiles(
      referenceFileList,
      formData.userName,
      formData.userId
    );

    // ✅ downloadLink 값만 저장하는 배열 생성
    const downloadLinkAddr = file.map((f) => f.downloadLink);

    const duration = getDurationByGrade(formData.grade);
    const deadline = getDeadline(duration);

    const order = {
      ...formData,
      photoDownload: downloadLinkAddr,
      referenceDownload: referenceFile?.downloadLink,
      company: "아워웨딩",
      division: formData.grade === "S 샘플" ? "샘플" : "신규",
      step:
        formData.grade === "S 샘플"
          ? `샘플 작업중 (완료 예정일: ${deadline})`
          : `1차 보정본 작업중 (완료 예정일: ${deadline})`,
      comment: comment,
      label: formData.grade === "S 샘플" ? "샘플" : "신규",
    };

    console.log(order);

    try {
      const { data } = await axios.post(
        `${API_URL}/order`, // ✅ 여기에 실제 API 엔드포인트 입력
        order,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        alert(`✅ 주문이 성공적으로 저장되었습니다! 주문 ID: ${data.orderId}`);
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

  const uploadFiles = async (fileList, userName, userId) => {
    try {
      const uploadPromises = fileList.map(async (file, index) => {
        const fileObj = file.originFileObj;
        const fileExtension = fileObj.name.substring(
          fileObj.name.lastIndexOf(".")
        );
        const rawFileName = `아워웨딩_신규_${userName}_${userId}_${
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

  const uploadReferenceFiles = async (fileList, userName, userId) => {
    try {
      if (fileList.length === 0) {
        throw new Error("업로드할 파일이 없습니다.");
      }

      const fileObj = fileList[0].originFileObj;
      const fileExtension = fileObj.name.substring(
        fileObj.name.lastIndexOf(".")
      );
      const rawFileName = `아워웨딩_신규_${userName}_${userId}_참고${fileExtension}`;
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
      console.log("📤 참고 파일 업로드 및 삭제 성공:", res.data);

      return res.data;
    } catch (error) {
      console.error("❌ 참고 파일 업로드 실패:", error.message);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.post(
          `${API_URL}/auth/verify-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        navigation("/ourwedding/login", { state: { nextPage: "new" } });
      }
    };
    verifyToken();
  }, [navigation]);

  // 유저 정보가 들어오면 formData 업데이트
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.user_name || "",
        userId: user.naver_id || "",
      }));
    }
  }, [user]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: "#4F3415",
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Checkbox: {
            colorPrimary: "rgba(110, 134, 95, 1)",
            colorBgContainer: "rgba(110, 134, 95, 0.3)",
            colorBorder: "#d9d9d9",
            colorPrimaryHover: "rgba(110, 134, 95, 0.3)",
            controlInteractiveSize: 20,
          },
          Button: {
            colorPrimary: "rgba(201, 210, 185, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
            colorTextLightSolid: "rgba(79, 52, 21, 1)",
            colorPrimaryActive: "#ADA69E",
          },
          Upload: {
            colorPrimary: "rgba(201, 210, 185, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
          },
        },
      }}
    >
      {contextHolder}
      <div
        style={{
          display: isLoading ? "flex" : "none",
          position: "fixed",
          zIndex: 99,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          width: "100%",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
      <Flex vertical style={{ alignItems: "center", justifyContent: "center" }}>
        <Flex
          vertical
          style={{
            width: "100%",
            maxWidth: "900px",
          }}
        >
          <Typography.Title
            level={screens.lg ? 1 : 2}
            style={{ color: "rgba(62, 83, 49, 1)", marginLeft: "60px" }}
          >
            주문자 정보(신규)
          </Typography.Title>
          <div
            style={{
              height: "16px",
              backgroundColor: "rgba(164, 121, 72, 0.3)",
              width: screens.lg ? "360px" : "280px",
              marginTop: screens.lg ? "-36px" : "-28px",
            }}
          />
        </Flex>
        {/* <Input type="file" onChange={updateFile} /> */}
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ paddingBlock, paddingInline: "20px" }}
        >
          <Flex gap={screens.lg ? "large" : "middle"} vertical>
            <Form.Item
              label={<strong>{"(자동) 주문자 성함 / 아이디"}</strong>}
              colon={false}
            >
              <Input
                variant="underlined"
                readOnly
                value={`${formData.userName} / ${formData.userId}`}
              />
            </Form.Item>

            <Form.Item
              label={<strong>{"(자동) 접수 날짜"}</strong>}
              colon={false}
            >
              <Input
                variant="underlined"
                readOnly
                value={formData.receivedDate}
              />
            </Form.Item>

            <Form.Item
              label={<strong>{"상품주문번호"}</strong>}
              colon={false}
              help={"ㄴ * 오타없이 꼭 정확한 상품 주문번호 기재 바랍니다. *"}
            >
              <Input
                name="orderNumber"
                variant="underlined"
                value={formData.orderNumber}
                onChange={handleInputChange}
              />
            </Form.Item>

            <Form.Item label={<strong>{"보정등급"}</strong>} colon={false}>
              <Select
                placeholder={"보정등급을 선택해주세요."}
                value={formData.grade}
                onChange={handleSelectChange}
              >
                {GRADES.map(([grade, time]) => (
                  <Select.Option key={grade} value={grade}>
                    {`${grade} (${time})`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={<strong>{"사진 장수"}</strong>} colon={false}>
              <Input
                type="number"
                name="photoCount"
                variant="underlined"
                placeholder="5+1 서비스 장수 포함하여 기재 바랍니다"
                value={formData.photoCount}
                onChange={handleInputChange}
              />
            </Form.Item>

            <Form.Item
              label={<strong>{"추가 결제 여부"}</strong>}
              colon={false}
            >
              <div className="checkbox-group">
                <Checkbox.Group
                  onChange={handleCheckboxChange}
                  value={formData.additionalOptions}
                >
                  {ADDITIONAL_OPTIONS.map(([value, title, price]) => (
                    <div key={value} className="checkbox-item">
                      <Checkbox value={value}>
                        <span className="checkbox-label">
                          <span className="checkbox-title">{title}</span>
                          <span className="checkbox-price">
                            +{price.toLocaleString()}원
                          </span>
                        </span>
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </div>
            </Form.Item>
          </Flex>
        </Form>
      </Flex>

      <Divider
        plain
        style={{
          color: "#A79166",
          fontFamily: "Rufina",
          fontWeight: 400,
          fontSize,
          paddingTop: paddingBlock,
        }}
      >
        Our wedding
      </Divider>

      <Flex
        style={{
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Flex vertical gap={"large"}>
          <Typography
            style={{ color: "rgba(177, 82, 82, 1)", fontWeight: 700 }}
          >
            ⚠️ 사진 업로드전 먼저 확인 부탁드립니다 :)
          </Typography>
          <Flex vertical gap={"middle"}>
            <Space>
              <Typography.Title level={4} style={{ margin: "0 0 3px 0" }}>
                사진 업로드
              </Typography.Title>
              <MdAttachFile size={18} />
            </Space>

            <div
              style={{
                padding: paddingBox,
                backgroundColor: "rgba(110, 133, 87, 0.2)",
              }}
            >
              <Typography.Paragraph style={{ color: "rgba(85, 68, 30, 1)" }}>
                <Flex vertical gap={"large"}>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`파일 업로드는 raw / jpeg / jpg / cr2 / cr3 / heic만 가능합니다.
                     ㄴ 그 이외에 파일은 해당 사이트에서 파일 변환하여 업로드바랍니다. `}
                    <Typography.Link
                      style={{
                        color: "rgba(204, 87, 58, 1)",
                        fontWeight: 700,
                      }}
                      onClick={() => window.open("https://convertio.co/kr/")}
                    >
                      Convertio — 파일 변환기
                    </Typography.Link>
                    {" : 파일전환 페이지"}
                  </li>

                  <li style={{ whiteSpace: "pre-line" }}>
                    {
                      "사진은 업로드 후 변경이 불가능하니 신중하게 업로드 부탁 드립니다."
                    }
                  </li>

                  <li style={{ whiteSpace: "pre-line" }}>
                    {`파일용량은 꼭 확인 후 가장 큰 파일로 업로드 부탁 드립니다.
                     ㄴ 작업 이후 파일 크기로 인한 재작업은 재주문 후 진행해야 합니다.`}
                  </li>
                </Flex>
              </Typography.Paragraph>
            </div>

            <Space
              size={"large"}
              style={{
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <Typography.Text
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "rgba(79, 52, 21, 1)",
                }}
              >
                업로드 된 사진 파일 갯수 : {photoList.length}장
              </Typography.Text>

              <Upload
                accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
                multiple
                onChange={handlePhotoUpload}
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
                  type="primary"
                  icon={<FiFilePlus color="rgba(85, 68, 30, 1)" />}
                >
                  사진 업로드
                </Button>
              </Upload>
            </Space>
          </Flex>
          <Flex vertical gap={"middle"}>
            <Space>
              <Typography.Title level={4} style={{ margin: "0 0 3px 0" }}>
                참고 사진 업로드
              </Typography.Title>
              <MdAttachFile size={18} />
            </Space>

            <div
              style={{
                padding: paddingBox,
                backgroundColor: "rgba(110, 133, 87, 0.2)",
              }}
            >
              <Typography.Paragraph style={{ color: "rgba(85, 68, 30, 1)" }}>
                <Flex vertical gap={"large"}>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`해당창은 참고사진을 업로드 하는 창으로 원하시는 작업 방향을 참고 할 수 있는 사진 업로드 부탁드립니다.
ex) 셀카 or 스튜디오 보정본`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`참고사진은 1장만 업로드 가능하여 최대한 [ 얼굴과 몸이 잘보이는 정면인 사진 ]  으로 업로드 바랍니다.`}
                  </li>
                </Flex>
              </Typography.Paragraph>
            </div>

            <Space
              size={"large"}
              style={{
                justifyContent: "flex-end",
                marginBottom: "24px",
              }}
            >
              <Upload
                accept=".raw,.jpeg,.jpg,.cr2,.cr3,.heic"
                maxCount={1}
                showUploadList={false}
                onChange={handleReferenceUpload}
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
                  type="primary"
                  icon={<FiFilePlus color="rgba(85, 68, 30, 1)" />}
                >
                  사진 업로드
                </Button>
              </Upload>
            </Space>
          </Flex>

          <Flex vertical gap={"middle"}>
            <Space>
              <Typography.Title level={4} style={{ margin: "0 0 3px 0" }}>
                요청사항 작성
              </Typography.Title>
              <MdAttachFile size={18} />
              <Button
                style={{
                  backgroundColor: "rgba(79, 52, 21, 0.6)",
                  color: "white",
                  fontWeight: 700,
                  border: "none",
                }}
                onClick={showModal}
              >
                ⚠️ 요청사항 복사하기
              </Button>

              <Modal
                title="요청사항 복사하기"
                open={isModalOpen}
                onOk={() => {
                  const text = `1. 보정강도 (약,약중,중,중강,강)
(추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

▶️

2. 전체 사진 공통 요청사항 

신랑 :
신부 : 

3. 개별 추가 요청사항
(밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 아워웨딩 유료 필름 결제 해주셔야 합니다.)

▶️ 파일명 - 요청사항 :`;
                  navigator.clipboard.writeText(text);
                  showMessage(
                    "success",
                    "요청사항이 클립보드에 복사되었습니다."
                  );

                  handleOk();
                }}
                onCancel={handleCancel}
                centered
                width={{
                  xs: "90%",
                  sm: "80%",
                  md: "70%",
                  lg: "60%",
                  xl: "50%",
                  xxl: "40%",
                }}
                cancelText={"닫기"}
                okText={"복사하기"}
              >
                <div
                  style={{
                    padding: paddingBox,
                    backgroundColor: "rgba(110, 133, 87, 0.2)",
                  }}
                >
                  <Typography.Paragraph
                    style={{ color: "rgba(85, 68, 30, 1)" }}
                  >
                    <Flex vertical gap={"large"}>
                      <li style={{ whiteSpace: "pre-line" }}>
                        {`1. 보정강도 (약,약중,중,중강,강)
      (추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

      ▶️`}
                      </li>
                      <li style={{ whiteSpace: "pre-line" }}>
                        {`2. 전체 사진 공통 요청사항 

신랑 :
신부 : `}
                      </li>
                      <li style={{ whiteSpace: "pre-line" }}>
                        {`3. 개별 추가 요청사항
      (밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 아워웨딩 유료 필름 결제 해주셔야 합니다.)

      ▶️ 파일명 - 요청사항 :`}
                      </li>
                    </Flex>
                  </Typography.Paragraph>
                </div>
              </Modal>
            </Space>
            <div
              style={{
                padding: paddingBox,
                backgroundColor: "rgba(110, 133, 87, 0.2)",
              }}
            >
              <Typography.Paragraph style={{ color: "rgba(85, 68, 30, 1)" }}>
                <Flex vertical gap={"large"}>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`상단 [요청사항] 클릭 시 작성해야 될 텍스트가 복사되니, 텍스트를 기반으로 요청사항 작성해주세요.`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`상세페이지 기본수정사항에 있는 부분은 자동으로 적용되는 사항들이니
                     요청사항 기재 시 기본수정사항 제외한 후 추가적으로 원하시는 부분을 기재 해주세요.`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`요청사항 기재 시 좌우에 대한 기준은 모니터를 바라봤을때의 기준입니다. (모니터 속 인물 기준 X)`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`요청사항 기재 시 꼭 모호한 표현이 아닌, 정확한 부분에 대한 보정 방향을 기재해주세요.
       자연스럽게  (X)   ➡️    얼굴 전체 크기를 줄여주세요.  (O)
       예쁘게         (X)    ➡️    눈을 밑쪽으로 키워주세요.        (O) 
       어려보이게  (X)    ➡️    중안부를 짧게 해주세요.           (O)
       착해보이게  (X)    ➡️    왼쪽 입꼬리를 올려주세요.       (O)`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`(2인 기준) 전체  요청사항(10가지) / 개별 요청사항(5가지) 초과 시 추가금 있습니다.`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`밝기 부분은 요청사항 기재 시 적용 가능합니다. 다만 색감 요청 시에는 필름 결제 후 요청 가능합니다.`}
                  </li>
                  <li style={{ whiteSpace: "pre-line" }}>
                    {`접수 이후 요청사항 추가는 불가능하니, 빠진 부분이 없는지 재차 확인 부탁 드립니다.`}
                  </li>
                </Flex>
              </Typography.Paragraph>
            </div>

            <Input.TextArea
              rows={12}
              autoSize={true}
              onChange={(e) => setComment(e.target.value)}
              defaultValue={`1. 보정강도 (약,약중,중,중강,강)
(추천 : 자연스러운 보정을 위해 생각하시는 보정단계보다 한단계 낮춰서 진행 하시는걸 추천드립니다 ! )

▶️
2. 전체 사진 공통 요청사항

신랑 :
신부 :
3. 개별 추가 요청사항
(밝기 조절은 기재 해주시면 가능합니다.) (색감작업은 아워웨딩 유료 필름 결제 해주셔야 합니다.)

▶️ 파일명 - 요청사항 :`}
            />
          </Flex>
        </Flex>
      </Flex>

      <Divider
        plain
        style={{
          color: "transparent",
          WebkitTextStroke: "0.6px #A79166",
          fontFamily: "Rufina",
          fontWeight: 400,
          fontSize,
          paddingTop: paddingBlock,
        }}
      >
        Ourdrama
      </Divider>

      <Flex vertical>
        <Flex
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: -parseInt(fontSize.replace("px")),
            paddingInline: paddingBox,
          }}
        >
          <Typography
            style={{
              width: "100%",
              maxWidth: "900px",
              color: "transparent",
              WebkitTextStroke: "0.6px #A79166",
              fontFamily: "Rufina",
              fontWeight: 400,
              fontSize: parseInt(fontSize.replace("px")) * 1.3,
            }}
          >
            Caution
          </Typography>
        </Flex>

        <Flex
          vertical
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(192, 176, 152, 0.3)",
          }}
        >
          <Flex
            style={{
              paddingInline: paddingBox,
              paddingBlock: paddingBlock,
            }}
          >
            <Flex
              vertical
              style={{
                maxWidth: "900px",
              }}
              gap={"24px"}
            >
              {CAUTION_ITEMS.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 40px",
                    alignItems: "center",
                    columnGap: "36px",
                    whiteSpace: "pre-line",
                    fontSize: "14px",
                    color: "rgba(85, 68, 30, 1)",
                  }}
                >
                  <span>• {item.text}</span>
                  <Checkbox
                    checked={checkedItems[index]}
                    onChange={() => handleCheck(index)}
                  />
                </div>
              ))}
            </Flex>
          </Flex>
          <Flex
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginBottom: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <Typography style={{ padding: 4 }}>
              • 위의 내용을 모두 숙지했습니다{" "}
            </Typography>
          </Flex>
        </Flex>

        <Flex vertical>
          <Button
            onClick={handleFormUpload}
            htmlType="submit"
            icon={<BsCaretRightFill />}
            iconPosition="end"
            type="primary"
            disabled={checkedItems.filter((item) => item).length < 4}
            style={{
              width: "auto",
              paddingInline: "16px",
              alignSelf: "center",
              marginTop: "36px",
              marginBottom: paddingBlock,
              paddingInline: "48px",
            }}
          >
            업로드
          </Button>
        </Flex>
      </Flex>

      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap');
      </style>

      <style jsx>{`
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .checkbox-item {
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .checkbox-item:hover {
          background-color: #f0f0f0;
        }

        .checkbox-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .checkbox-title {
          font-size: 16px;
          color: #333;
        }

        .checkbox-price {
          margin-left: 8px;
          font-size: 14px;
          color: #888;
          font-weight: 500;
        }

        :global(.ant-checkbox-wrapper) {
          width: 100%;
        }

        :global(.ant-checkbox) {
          width: 100%;
        }
      `}</style>
    </ConfigProvider>
  );
}

export default NewRequest;
