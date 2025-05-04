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
  Typography,
  Upload,
  message,
} from "antd";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdAttachFile } from "react-icons/md";
import { FiFilePlus } from "react-icons/fi";
import { BsCaretRightFill, BsDownload } from "react-icons/bs";

import dayjs from "dayjs";
import { FONT } from "../style_vars";
import { theme } from "../utils/theme";

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

function RevisionRequest() {
  const navigation = useNavigate();
  const [user, setUser] = useState();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [selectedValue, setSelectedValue] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [photoList, setPhotoList] = useState([]); // 사진 리스트
  const [referenceFileList, setReferenceFileList] = useState([]); // 레퍼런스 파일 리스트

  const [orders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState();

  useEffect(() => {
    // 특정 유저의 접수 리스트
    const getOrderByUser = async () => {
      console.log(user);
      axios
        .get(`${API_URL}/order/user/${user?.naver_id}`)
        .then((response) => {
          console.log(response);
          setOrders(response.data.orders);
        })
        .catch((error) => console.log(error));
    };

    if (user) getOrderByUser();
  }, [user]);

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

  function convertKoreanDateTime(input) {
    const [dateStr, ampm, timeStr] = input
      .replace("오전", "AM")
      .replace("오후", "PM")
      .split(/ (AM|PM) /);

    const [year, month, day] = dateStr
      .match(/\d+/g)
      .map((v) => v.padStart(2, "0"));
    const [hour, minute, second] = timeStr.split(":").map(Number);

    let hour24 = hour;
    if (ampm === "PM" && hour !== 12) hour24 += 12;
    if (ampm === "AM" && hour === 12) hour24 = 0;

    return `${year}.${month}.${day} / ${String(hour24).padStart(
      2,
      "0"
    )}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
  }

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
        navigation("/wantswedding/login", { state: { nextPage: "new" } });
      }
    };
    verifyToken();
  }, [navigation]);

  // 여러 버튼에 대해 배경 이미지를 관리하는 상태
  const [bgImages, setBgImages] = useState({
    button1: require("../asset/button4.png"),
    button2: require("../asset/button4.png"),
    button3: require("../asset/button4.png"),
  });

  // 버튼 클릭 시 해당 버튼의 배경 이미지를 변경하는 함수
  const changeBackgroundImage = (buttonKey) => {
    setBgImages((prevImages) => ({
      ...prevImages,
      [buttonKey]: require("../asset/button4_click.png"), // 변경할 배경 이미지
    }));
  };

  // 마우스 떼거나 mouseup 시 배경 이미지를 초기화하는 함수
  const resetBackgroundImage = (buttonKey) => {
    setBgImages((prevImages) => ({
      ...prevImages,
      [buttonKey]: require("../asset/button4.png"), // 초기 배경 이미지로 되돌리기
    }));
  };

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
      <link
        href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap"
        rel="stylesheet"
      />
      {contextHolder}

      <Flex
        vertical
        style={{
          backgroundColor: "#EFFAFF",
          justifyContent: "space-between", // 상단-하단 자동 정렬
        }}
      >
        <Flex
          vertical
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              paddingTop: "30%",
              backgroundImage: `url(${require("../asset/bg2.png")})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center bottom",
            }}
          ></div>
          <div
            style={{
              position: "relative",
              marginTop: theme.spacing.xxl,
              textAlign: "center",
            }}
          >
            <>
              <Typography
                style={{
                  fontFamily: FONT.heading,
                  fontSize: "8vw",
                  whiteSpace: "nowrap",
                  marginBottom: "-1rem",
                  color: "#F4FFF5",
                  WebkitTextStroke: "0.5px #2E4B50",
                  paddingBlock: "64px",
                }}
              >
                Wan't Wedding
              </Typography>
            </>
          </div>
        </Flex>
        {orders.map((order, index) => (
          <Flex
            vertical={screens.lg ? false : true}
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Flex vertical style={{ alignItems: "center", width: "100%" }}>
              <div
                style={{
                  backgroundImage: `url(${require("../asset/top.png")})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "200px",
                  height: "180px",
                  display: "flex",
                  position: "relative",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Typography
                  style={{
                    fontFamily: "GumiRomanceTTF",
                    fontSize: "24px",
                    color: "#006C92",
                  }}
                >
                  진행상황
                </Typography>
              </div>

              <Flex
                vertical
                style={{
                  backgroundColor: "white",
                  border: "4px solid #C2DEFF",
                  borderTopLeftRadius: screens.lg ? 0 : 20,
                  borderBottomLeftRadius: screens.lg ? 0 : 20,
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  paddingInline: "10vw",
                  paddingBlock: "2rem",
                  alignItems: "center",
                  width: screens.lg ? "100%" : "",
                }}
              >
                <div
                  style={{
                    backgroundImage: `url(${require("../asset/button3.png")})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    width: "220px",
                    height: "100px",
                    paddingTop: "10px",
                    display: "flex",
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 999,
                  }}
                >
                  <Typography
                    style={{
                      color: "#1F78DE",
                      fontSize: "20px",
                      fontFamily: "GumiRomanceTTF",
                    }}
                  >
                    {order.step}
                  </Typography>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "3px solid #CDEFFF",
                    borderRadius: "50px",
                    padding: "16px",
                    textAlign: "center",
                    fontFamily: "GumiRomanceTTF",
                    color: "#1F78DE",
                    transform: "translateY(-30%)",
                  }}
                >
                  {convertKoreanDateTime(order.receivedDate)}
                </div>

                <Form
                  labelAlign="left"
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  style={{
                    // paddingBlock,
                    paddingInline: paddingBox,
                    maxWidth: 1200,
                    width: "100%",
                  }}
                  layout="vertical"
                >
                  <div
                    style={{
                      color: "#233D5B",
                      fontFamily: "GumiRomanceTTF",
                      textAlign: "center",
                      width: "100%",
                      fontSize: theme.typography.fontSize.md,
                    }}
                  >
                    {"(자동) 주문자 성함 / 아이디"}
                  </div>
                  <Form.Item colon={false}>
                    <Input
                      style={{ textAlign: "center", border: "none" }}
                      readOnly
                      value={`${order.userName} / ${order.userId}`}
                    />
                    <div
                      style={{
                        backgroundImage: `url(${require("../asset/line.png")})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
                        backgroundPosition: "center", // ⬅️ 추가된 부분
                        height: "8px",
                      }}
                    />
                  </Form.Item>

                  <div
                    style={{
                      color: "#233D5B",
                      fontFamily: "GumiRomanceTTF",
                      textAlign: "center",
                      width: "100%",
                      fontSize: theme.typography.fontSize.md,
                    }}
                  >
                    {"상품주문번호"}
                  </div>
                  <Form.Item colon={false}>
                    <Input
                      style={{ textAlign: "center", border: "none" }}
                      readOnly
                      value={order.orderNumber}
                    />
                    <div
                      style={{
                        backgroundImage: `url(${require("../asset/line.png")})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
                        backgroundPosition: "center", // ⬅️ 추가된 부분
                        height: "8px",
                      }}
                    />
                  </Form.Item>

                  <div
                    style={{
                      color: "#233D5B",
                      fontFamily: "GumiRomanceTTF",
                      textAlign: "center",
                      width: "100%",
                      fontSize: theme.typography.fontSize.md,
                    }}
                  >
                    {"접수 날짜 / 시간"}
                  </div>
                  <Form.Item colon={false}>
                    <Input
                      style={{ textAlign: "center", border: "none" }}
                      readOnly
                      value={convertKoreanDateTime(order.receivedDate)}
                    />
                    <div
                      style={{
                        backgroundImage: `url(${require("../asset/line.png")})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
                        backgroundPosition: "center", // ⬅️ 추가된 부분
                        height: "8px",
                      }}
                    />
                  </Form.Item>

                  <div
                    style={{
                      color: "#233D5B",
                      fontFamily: "GumiRomanceTTF",
                      textAlign: "center",
                      width: "100%",
                      fontSize: theme.typography.fontSize.md,
                    }}
                  >
                    {"주문 상품"}
                  </div>
                  <Form.Item colon={false}>
                    <Input
                      style={{ textAlign: "center", border: "none" }}
                      readOnly
                      value={order.additionalOptions}
                    />
                    <div
                      style={{
                        backgroundImage: `url(${require("../asset/line.png")})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
                        backgroundPosition: "center", // ⬅️ 추가된 부분
                        height: "8px",
                      }}
                    />
                  </Form.Item>

                  <div
                    style={{
                      color: "#233D5B",
                      fontFamily: "GumiRomanceTTF",
                      textAlign: "center",
                      width: "100%",
                      fontSize: theme.typography.fontSize.md,
                    }}
                  >
                    {"보정 장수"}
                  </div>
                  <Form.Item colon={false}>
                    <Input
                      style={{ textAlign: "center", border: "none" }}
                      readOnly
                      value={order.photoCount}
                    />
                    <div
                      style={{
                        backgroundImage: `url(${require("../asset/line.png")})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
                        backgroundPosition: "center", // ⬅️ 추가된 부분
                        height: "8px",
                      }}
                    />
                  </Form.Item>
                </Form>
              </Flex>
            </Flex>

            <Flex
              vertical
              gap={theme.spacing.xl}
              style={{
                justifyContent: "center",
                paddingTop: screens.lg ? "180px" : "20px",
                width: "100%",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${bgImages.button1})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "250px",
                  height: "150px",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  htmlType="submit"
                  type="text"
                  size="large"
                  style={{
                    width: "auto",
                    alignSelf: "center",

                    fontFamily: "GumiRomanceTTF",

                    whiteSpace: "pre-line",
                    color: "#006C92",
                    fontFamily: "GumiRomanceTTF",
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                  }}
                  onMouseDown={() => changeBackgroundImage("button1")} // 첫 번째 버튼 클릭 시
                  onMouseLeave={() => resetBackgroundImage("button1")}
                  onMouseUp={() => resetBackgroundImage("button1")}
                >
                  신규 다운로드
                </Button>
              </div>

              <div
                style={{
                  backgroundImage: `url(${bgImages.button2})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "250px",
                  height: "150px",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  htmlType="submit"
                  type="text"
                  size="large"
                  style={{
                    width: "auto",
                    alignSelf: "center",

                    fontFamily: "GumiRomanceTTF",

                    whiteSpace: "pre-line",
                    color: "#006C92",
                    fontFamily: "GumiRomanceTTF",
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                  }}
                  onMouseDown={() => changeBackgroundImage("button2")} // 첫 번째 버튼 클릭 시
                  onMouseLeave={() => resetBackgroundImage("button2")}
                  onMouseUp={() => resetBackgroundImage("button2")}
                >
                  재수정 다운로드
                </Button>
              </div>

              <div
                style={{
                  backgroundImage: `url(${bgImages.button3})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "250px",
                  height: "150px",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  htmlType="submit"
                  type="text"
                  size="large"
                  style={{
                    width: "auto",
                    alignSelf: "center",

                    fontFamily: "GumiRomanceTTF",

                    whiteSpace: "pre-line",
                    color: "#006C92",
                    fontFamily: "GumiRomanceTTF",
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                  }}
                  onMouseDown={() => changeBackgroundImage("button3")} // 첫 번째 버튼 클릭 시
                  onMouseLeave={() => resetBackgroundImage("button3")}
                  onMouseUp={() => resetBackgroundImage("button3")}
                  onClick={() => navigation("form", { state: { order } })}
                >
                  재수정 신청
                </Button>
              </div>
            </Flex>
          </Flex>
        ))}
        <div
          style={{
            width: "100%",
            paddingTop: "6%",
            backgroundImage: `url(${require("../asset/title3.png")})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
            marginTop: "64px",
          }}
        ></div>
        <Flex
          vertical
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <Flex
            vertical
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              border: "3px solid #C0EBFF",
              marginBlock: paddingBlock,
              marginInline: "20px",
              borderRadius: "20px",
              fontFamily: "GumiRomanceTTF",
            }}
          >
            <Flex
              style={{
                paddingInline: paddingBox,
                paddingBlock: 36,
              }}
            >
              <Flex
                vertical
                style={{
                  maxWidth: "900px",
                }}
                gap={"24px"}
              >
                <Typography
                  style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.md,
                    fontFamily: "GumiRomanceTTF",
                  }}
                >
                  ▪︎ 작업 중 안내사항
                </Typography>

                <div
                  style={{
                    alignItems: "center",
                    whiteSpace: "pre-line",
                    fontSize: "14px",
                    color: "#005978",
                  }}
                >
                  <span>
                    • 주문 넣어주신 상품에 맞춰 예쁘게 작업 진행 중에 있으니,
                    잠시만 기다려 주세요 !
                  </span>
                </div>

                <div
                  style={{
                    alignItems: "center",
                    whiteSpace: "pre-line",
                    fontSize: "14px",
                    color: "#005978",
                  }}
                >
                  <span>
                    • 작업 완료 시점이 표시 되고 있으니, 해당 날짜에 맞춰 파일을
                    다운 받아보실 수 있습니다 !
                  </span>
                </div>

                <Typography
                  style={{
                    margin: 0,
                    fontFamily: "GumiRomanceTTF",
                    fontSize: theme.typography.fontSize.md,
                  }}
                >
                  ▪︎ 작업 완료 안내사항
                </Typography>

                <div
                  style={{
                    alignItems: "center",
                    whiteSpace: "pre-line",
                    fontSize: "14px",
                    color: "#005978",
                  }}
                >
                  <span>
                    • 주문 넣어주신 상품에 대해서는 작업이 진행되지만, 그와에
                    다른 상품에 대한 요청사항이 있을 시에는 적용되지 않는 점
                    안내드립니다 ! ( 개별적으로 연락을 드리지 않습니다 . )
                  </span>
                </div>

                <div
                  style={{
                    alignItems: "center",
                    whiteSpace: "pre-line",
                    fontSize: "14px",
                    color: "#005978",
                  }}
                >
                  <span>
                    •언제나 최선을 다해 작업에 임하고 있지만, 인물 보정 외에
                    합성 &제거 요청 시 불가능 할 수도 있다는 점 안내드립니다 !
                  </span>
                </div>
              </Flex>
            </Flex>
          </Flex>
          <Typography
            style={{
              fontFamily: "GumiRomanceTTF",
              color: "#FC9533",
              fontSize: theme.typography.fontSize.md,
              textAlign: "center",
              paddingInline: "20px",
              whiteSpace: "pre-line",
            }}
          >
            {
              "파일은 접수 기한으로부터 [2주간]만 보관된 후 파기 되오니 꼭 작업 파일은 개인적으로 저장 해주시길 바랍니다.\n이후 파일에 대한 부분에 있어 원츠웨딩은 책임지지 않습니다."
            }
          </Typography>
        </Flex>

        <div
          style={{
            width: "100%",
            paddingBlock: "20%",
            backgroundImage: `url(${require("../asset/bg3.png")})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
          }}
        >
          <Flex
            gap={10}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              backgroundImage: `url(${require("../asset/line.png")})`,
              backgroundRepeat: "repeat",
              backgroundSize: "contain", // 또는 'contain', 'auto' 등 조정 가능
              backgroundPosition: "center", // ⬅️ 추가된 부분
              height: "12px",
            }}
          >
            <div
              style={{
                backgroundImage: `url(${require("../asset/button_click.png")})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                display: "flex",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",

                padding: "16px",
                backgroundColor: "#EFFAFF",
              }}
            >
              <Button
                htmlType="submit"
                icon={<BsDownload />}
                iconPosition="end"
                type="text"
                size="large"
                style={{
                  width: "auto",
                  alignSelf: "center",
                  fontFamily: "GumiRomanceTTF",

                  whiteSpace: "pre-line",
                  color: "#2772C7",
                  fontFamily: "GumiRomanceTTF",
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              >
                다운로드
              </Button>
            </div>
          </Flex>
        </div>
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

export default RevisionRequest;
