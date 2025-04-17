import {
  Button,
  Checkbox,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Image,
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
import { useLocation, useNavigate } from "react-router-dom";
import { MdAttachFile } from "react-icons/md";
import { FiFilePlus } from "react-icons/fi";
import { BsCaretRight } from "react-icons/bs";
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
];

function TailityRevisionForm() {
  const navigation = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [selectedValue, setSelectedValue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [photoList, setPhotoList] = useState([]); // 사진 리스트
  const [referenceFileList, setReferenceFileList] = useState([]); // 레퍼런스 파일 리스트

  const [order, setOrder] = useState({});

  const [comment, setComment] = useState();
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    setOrder(location.state.order);
    console.log(location.state.order);
  }, []);

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

    // ✅ downloadLink 값만 저장하는 배열 생성
    const downloadLinkAddr = file.map((f) => f.downloadLink);

    const duration = getDurationByGrade(order.grade);
    const deadline = getDeadline(duration);

    const order_ = {
      ...formData,
      orderNumber: order.orderNumber || "",
      grade: order.grade,
      photoCount: photoList.length,
      revisionDownload: downloadLinkAddr,
      company: "아워웨딩",
      division: "재수정",
      step: `재수정 작업중 (완료 예정일: ${deadline})`,
      comment: comment,
      label: "재수정",
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
        alert(`✅ ${data.message}`);
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
        const rawFileName = `아워웨딩_재수정_${userName}_${userId}_${
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
            labelColor: "black",
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Checkbox: {
            colorPrimary: "#000000", // 선택된 체크박스의 색상 (검정)
            colorBgContainer: "#ffffff", // 체크박스 배경색 (흰색)
            colorBorder: "#555", // 체크박스의 테두리 색상 (검정)
            colorPrimaryHover: "#8c8c8c", // 체크박스를 호버했을 때 배경색 (약간 밝은 회색)
            controlInteractiveSize: 20, // 체크박스 크기
          },
          Button: {
            colorPrimary: "rgba(1, 1, 1, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
            colorTextLightSolid: "white",
            colorPrimaryActive: "#ADA69E",
            borderRadius: 0,
          },
          Upload: {
            colorPrimary: "rgba(201, 210, 185, 1)",
            colorPrimaryHover: "rgba(180, 190, 170, 1)",
          },
          Divider: {
            colorSplit: "black",
            lineWidth: 1,
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
      <Flex
        vertical
        style={{
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {screens.lg ? (
          <>
            <Typography
              style={{
                fontFamily: "Linden Hill",
                fontSize: "196px", // 부모 폰트 크기 기준으로 상대적 크기 설정
                whiteSpace: "nowrap", // 한 줄로 유지
                marginBottom: -96,
              }}
            >
              Order Information
            </Typography>
            <Typography
              style={{
                fontFamily: "Linden Hill",
                whiteSpace: "nowrap", // 한 줄로 유지
                fontWeight: 300,
                fontSize: "48px",
                color: "transparent",
                WebkitTextStroke: "0.5px black",
              }}
            >
              (Remodification)
            </Typography>
          </>
        ) : (
          <>
            <Typography
              style={{
                fontFamily: "Linden Hill",
                fontSize: "17vw", // 화면 가로 크기 13%로 폰트 크기 조정
                whiteSpace: "nowrap", // 한 줄로 유지
                width: "100%", // 부모 요소의 너비에 맞추기
                // overflow: "hidden", // 넘친 텍스트는 숨기기
                display: "block", // 텍스트를 블록으로 처리하여 가운데 정렬 가능
                textAlign: "center", // 가운데 정렬
                transform: "translateX(-8vw)", // 수평 이동으로 가운데 정렬
                position: "relative", // 부모 요소에 상대적으로 위치 조정
                marginBottom: "-8vw",
              }}
            >
              Order Information
            </Typography>
            <Typography
              style={{
                fontFamily: "Linden Hill",
                whiteSpace: "nowrap", // 한 줄로 유지
                fontWeight: 300,
                fontSize: "5vw",
              }}
            >
              (New)
            </Typography>
            {/* <Input type="file" onChange={updateFile} /> */}
          </>
        )}
        <Form
          labelAlign="left"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          style={{ paddingBlock, paddingInline: "20px" }}
        >
          <Flex gap={screens.lg ? "large" : "middle"} vertical>
            <Form.Item
              label={
                <strong>{"(자동) 주문자 성함 / 아이디 / 상품주문번호"}</strong>
              }
              colon={false}
            >
              <Input
                variant="underlined"
                readOnly
                value={`${order?.userName} / ${order?.userId} / ${order?.orderNumber}`}
              />
            </Form.Item>

            <Form.Item
              label={<strong>{"(자동) 접수 날짜 / 시간"}</strong>}
              colon={false}
            >
              <Input
                variant="underlined"
                readOnly
                value={order?.receivedDate}
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
          fontFamily: "Rufina",
          fontWeight: 400,
          fontSize,
          paddingTop: paddingBlock,
        }}
      >
        <Image src={require("../../../asset/s.png")} preview={false} />
      </Divider>

      <Flex
        style={{
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Flex vertical gap={"large"}>
          <Flex vertical gap={"middle"}>
            <Space>
              <Typography.Title
                level={4}
                style={{ margin: "0 0 3px 0", fontFamily: "Baskervville" }}
              >
                Photo upload
              </Typography.Title>
              {/* <MdAttachFile size={18} /> */}
              <Typography>사진 업로드</Typography>
            </Space>

            <div
              style={{
                padding: paddingBox,
                border: "1px solid black",
                position: "relative",
              }}
            >
              {/* 왼쪽 가운데 이미지 */}
              <img
                src={require("../../../asset/s.png")}
                alt="decoration"
                style={{
                  position: "absolute",
                  left: "-10px", // border의 왼쪽 바깥으로
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px", // 원하는 이미지 크기
                  height: "auto",
                  backgroundColor: "white", // 필요 시 배경처리
                  zIndex: 1,
                }}
              />
              <Typography.Paragraph style={{ color: "black" }}>
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
                  color: "black",
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
                  // type="primary"
                  icon={<FiFilePlus color="black" />}
                >
                  사진 업로드
                </Button>
              </Upload>
            </Space>
          </Flex>

          <Flex vertical gap={"middle"}>
            <Space style={{ justifyContent: "space-between" }}>
              <Space>
                <Typography.Title
                  level={4}
                  style={{ margin: "0 0 3px 0", fontFamily: "Baskervville" }}
                >
                  Requests fill in
                </Typography.Title>
                {/* <MdAttachFile size={18} /> */}
                <Typography>요청사항 작성</Typography>
              </Space>
              <Button
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
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
                  const text = `개별 추가 요청사항 (밝기 조절은 기재해주시면 가능합니다.) (색감 작업은 필름 결제 해주셔야 합니다.)
                        
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
                    border: "1px solid black",
                    borderLeft: "none",
                    position: "relative",
                  }}
                >
                  {/* 왼쪽 가운데 이미지 */}
                  <img
                    src={require("../../../asset/s.png")}
                    alt="decoration"
                    style={{
                      position: "absolute",
                      right: "-10px", // border의 왼쪽 바깥으로
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "20px", // 원하는 이미지 크기
                      height: "auto",
                      backgroundColor: "white", // 필요 시 배경처리
                      zIndex: 1,
                    }}
                  />
                  <Typography.Paragraph style={{ color: "black" }}>
                    <Flex vertical gap={"large"}>
                      <li style={{ whiteSpace: "pre-line" }}>
                        {`개별 추가 요청사항 (밝기 조절은 기재해주시면 가능합니다.) (색감 작업은 필름 결제 해주셔야 합니다.)
                        
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
                border: "1px solid black",
                borderRight: "none",
                position: "relative",
              }}
            >
              {/* 왼쪽 가운데 이미지 */}
              <img
                src={require("../../../asset/s.png")}
                alt="decoration"
                style={{
                  position: "absolute",
                  left: "-10px", // border의 왼쪽 바깥으로
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px", // 원하는 이미지 크기
                  height: "auto",
                  backgroundColor: "white", // 필요 시 배경처리
                  zIndex: 1,
                }}
              />
              <Typography.Paragraph style={{ color: "black" }}>
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
              defaultValue={`개별 추가 요청사항 (밝기 조절은 기재해주시면 가능합니다.) (색감 작업은 필름 결제 해주셔야 합니다.)
                        
▶️ 파일명 - 요청사항 :`}
            />
          </Flex>
        </Flex>
      </Flex>

      <Flex vertical>
        <Flex
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: -parseInt(fontSize.replace("px")),
            paddingInline: paddingBox,
            marginTop: "10vh",
          }}
        >
          <Flex
            style={{
              width: "100%",
              maxWidth: "900px",
            }}
          >
            <Typography
              style={{
                zIndex: 99,
                paddingInline: "20px",
                display: "inline", // ✅ 텍스트만큼만 영역 차지
                fontFamily: "Castoro Titling",
                fontWeight: 400,
                fontSize: parseInt(fontSize.replace("px")) * 1.3,
                backgroundColor: "white", // ✅ 텍스트 배경에만 적용
              }}
            >
              Caution
            </Typography>
          </Flex>
        </Flex>

        <Flex
          vertical
          style={{
            alignItems: "center",
            justifyContent: "center",
            borderBlock: "1px solid black",
            // backgroundColor: "rgba(192, 176, 152, 0.3)",
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
                    color: "black",
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

        <Flex
          vertical
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: "36px",
          }}
        >
          <Image
            src={require("../../../asset/s.png")}
            preview={false}
            style={{ width: 30, height: "auto" }}
          />
          <div
            style={{
              width: 1,
              height: 50,
              backgroundColor: "black",
              marginTop: 10,
            }}
          />
          <Button
            onClick={handleFormUpload}
            htmlType="submit"
            icon={<BsCaretRight />}
            iconPosition="end"
            type="primary"
            disabled={checkedItems.filter((item) => item).length < 3}
            style={{
              width: "auto",
              paddingInline: "16px",

              marginBottom: paddingBlock,
              paddingInline: "48px",
              fontFamily: "Baskervville",
            }}
          >
            UPLOAD
          </Button>
        </Flex>
      </Flex>

      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Aboreto&family=Baskervville:ital@0;1&family=Castoro+Titling&family=Linden+Hill:ital@0;1&display=swap');
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
          border: 2px solid #333; /* 검정색 테두리 */
          background-color: white; /* 흰색 배경 */
          border-radius: 4px; /* 둥근 테두리 */
          transition: background-color 0.2s, border-color 0.2s; /* 색상 변화 */
        }

        :global(.ant-checkbox-checked) {
          background-color: #333; /* 체크박스가 선택되었을 때 검정색 */
          border-color: #333; /* 검정색 테두리 */
        }

        :global(.ant-checkbox-checked .ant-checkbox-inner) {
          background-color: #333; /* 체크된 부분의 배경색을 검정색으로 */
          border-color: #333; /* 체크된 부분의 테두리 색 */
        }

        :global(.ant-checkbox-inner) {
          width: 20px;
          height: 20px;
          background-color: white; /* 기본 배경 흰색 */
          border: 2px solid #333; /* 기본 테두리 검정색 */
          border-radius: 4px; /* 둥근 모서리 */
          transition: background-color 0.2s, border-color 0.2s; /* 색상 변화 */
        }

        :global(.ant-checkbox-checked .ant-checkbox-inner) {
          background-color: #333; /* 선택된 상태에서 배경 검정색 */
          border-color: #333; /* 선택된 상태에서 테두리 검정색 */
        }
      `}</style>
    </ConfigProvider>
  );
}

export default TailityRevisionForm;
