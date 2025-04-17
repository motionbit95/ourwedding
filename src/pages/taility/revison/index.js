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
import { BsCaretRightFill } from "react-icons/bs";

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
    text: `모든 작업 (신규/재수정/샘플) 전달은 주문 넣어주신 등급에 맞춰 전달 드리고 있습니다. 
      작업 완료 예상 시점은 진행사항에 표시되어 있으니 꼭 참고 부탁드립니다! 
      추가로 모든 고객님들께 공정하게 순차적으로 전송 드리고 있기에, 전송 기한을 앞당겨 발송 드리기 부분은 불가능하다는 점 안내 드립니다!`,
  },
  {
    text: (
      <>
        저희가 모든 요청사항들을 적용할 수 있음 좋겠지만, ai가 아닌 사람이
        일일이 작업을 진행 하다보니 불가능사항이 있을 수 밖에 없다는 점 너그러이
        양해 부탁 드리며,
        <span style={{ fontWeight: "bold" }}>
          {` 추가로 불가능한 요청사항이 있을 경우에는 메모로 남겨드리고 있으니, 꼭 참고 부탁드립니다! 
          ㄴ 재수정 신청 시 애매모호한 요청은 채팅으로 가능여부 확인 부탁드립니다.`}
        </span>
      </>
    ),
  },
  {
    text: (
      <>
        <span style={{ fontWeight: "bold" }}>
          {` 파일은 [접수 기한]으로부터 한달간만 보관된 후 파기처리 되오니 작업된 파일은 개인적으로 꼭 저장해주시길 바랍니다. 
               ㄴ 파기된 파일에 관해서는 책임지지 않습니다. `}
        </span>
        {`
        
        ex) 1차 보정본(25.01.01) -> 삭제처리(25.02.01)
        재수정본(25.01.05) -> 삭제처리(25.02.05)
        샘플(25.01.10) -> 삭제처리(25.02.10)`}
      </>
    ),
  },
];

function TailityRevisionRequest() {
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
        navigation("/taility/login", { state: { nextPage: "new" } });
      }
    };
    verifyToken();
  }, [navigation]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: "black",
            labelFontSize: "16px",
            labelColonMarginInlineEnd: "10vw",
          },
          Button: {
            colorPrimary: "#f5f5f5",
            colorPrimaryHover: "#f1f1f1",
            colorTextLightSolid: "black",
            colorPrimaryActive: "#ADA69E",
            borderRadius: 0,
          },
        },
      }}
    >
      {contextHolder}
      <Flex vertical style={{ alignItems: "center", justifyContent: "center" }}>
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
                  fontSize: "196px",
                  whiteSpace: "nowrap",
                  marginBottom: -64,
                  textAlign: "center",
                }}
              >
                Receipt details
              </Typography>
              <Typography
                style={{
                  fontFamily: "Linden Hill",
                  whiteSpace: "nowrap",
                  fontWeight: 300,
                  fontSize: "48px",
                  textAlign: "center",
                  color: "transparent",
                  WebkitTextStroke: "0.5px black",
                }}
              >
                (Application for revision)
              </Typography>
            </>
          ) : (
            <>
              <Typography
                style={{
                  fontFamily: "Linden Hill",
                  fontSize: "13vw", // 적당한 비율로 조절
                  whiteSpace: "nowrap",
                  width: "100%",
                  overflow: "hidden",
                  textAlign: "center", // ✅ 가운데 정렬만 사용
                  marginBottom: "-4vw",
                }}
              >
                Receipt details
              </Typography>
              <Typography
                style={{
                  fontFamily: "Linden Hill",
                  whiteSpace: "nowrap",
                  fontWeight: 300,
                  fontSize: "4vw",
                  textAlign: "center", // ✅ 동일하게 중앙 정렬
                  color: "transparent",
                  WebkitTextStroke: "0.5px black",
                }}
              >
                (Application for revision)
              </Typography>
            </>
          )}
        </Flex>
      </Flex>
      <Flex
        vertical
        style={{
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor: "rgba(110, 133, 87, 0.2)",
          marginBlock: paddingBlock,
          borderBlock: "1px solid black",
        }}
      >
        <Flex
          style={{
            width: "100%",
            maxWidth: "900px",
            position: "relative",
          }}
        >
          <Space
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 99,
              paddingInline: "20px",
              fontFamily: "Castoro Titling",
              fontWeight: 400,
              fontSize: parseInt(fontSize.replace("px")) * 1.3,
              backgroundColor: "white", // ✅ 텍스트 배경에만 적용
              transform: "translateY(-50%)",
            }}
          >
            <Typography
              style={{
                display: "inline", // ✅ 텍스트만큼만 영역 차지
                fontFamily: "Castoro Titling",
                fontWeight: 400,
                fontSize: parseInt(fontSize.replace("px")) * 1.3,
              }}
            >
              Caution
            </Typography>
            <Typography>안내사항</Typography>
          </Space>
        </Flex>
        <Flex
          style={{
            paddingInline: paddingBox,
            paddingBlock: 36,
            paddingTop: paddingBlock,
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
                  alignItems: "center",
                  whiteSpace: "pre-line",
                  fontSize: "14px",
                  color: "black",
                }}
              >
                <span>• {item.text}</span>
              </div>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex vertical style={{ alignItems: "center", justifyContent: "center" }}>
        {orders.map((order, index) => (
          <React.Fragment key={order.id || index}>
            <Form
              labelAlign="left"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{
                // paddingBlock,
                paddingInline: paddingBox,
                maxWidth: 1200,
                width: "100%",
              }}
            >
              <Flex gap={screens.lg ? "large" : "middle"} vertical>
                <Typography.Title level={4} style={{ color: "black" }}>
                  {order.receivedDate}
                </Typography.Title>

                <Form.Item
                  label={
                    <strong>
                      {"(자동) 주문자 성함 / 아이디 / 상품주문번호"}
                    </strong>
                  }
                  colon={false}
                >
                  <Input
                    variant="underlined"
                    readOnly
                    value={`${order.userName} / ${order.userId} / ${order.orderNumber}`}
                  />
                </Form.Item>

                <Form.Item
                  label={<strong>{"(자동) 접수 날짜"}</strong>}
                  colon={false}
                >
                  <Input
                    variant="underlined"
                    readOnly
                    value={order.receivedDate}
                  />
                </Form.Item>

                <Form.Item label={<strong>{"보정등급"}</strong>} colon={false}>
                  <Input variant="underlined" readOnly value={order.grade} />
                </Form.Item>

                <Form.Item label={<strong>{"사진 장수"}</strong>} colon={false}>
                  <Input
                    variant="underlined"
                    readOnly
                    value={order.photoCount}
                  />
                </Form.Item>

                <Form.Item
                  label={<strong>{"진행상황"}</strong>}
                  colon={false}
                  help={
                    order.grade === "S 샘플" ? (
                      <div
                        style={{
                          whiteSpace: "pre-line",
                          color: "rgba(147, 81, 23, 1)",
                        }}
                      >
                        {`샘플은 보정 강도 체크를 위해 만든 상품임으로 웹에서만 확인 가능합니다.

다운로드 희망 시 포토리뷰(★★★★★) 작성 후 톡톡으로 캡쳐 본 보내주시면 다운로드 가능하니 참고 부탁 드립니다!
 ㄴ 리뷰작성시 꼭 구매확정을 눌러주셔야지 가능합니다!`}
                      </div>
                    ) : (
                      ""
                    )
                  }
                >
                  <Input variant="underlined" readOnly value={order.step} />
                </Form.Item>

                {order.grade === "S 샘플" ? (
                  <Flex
                    style={{
                      alignSelf: "center",
                      paddingBlock: "36px",
                      width: screens.lg ? "50%" : "100%",
                      flexDirection: screens.lg ? "row" : "column",
                      gap: "20px",
                    }}
                  >
                    <Button
                      style={{
                        width: "100%",
                        border: "1px solid #d9d9d9",
                        boxShadow: "none",
                      }}
                      type="primary"
                      iconPosition="end"
                      icon={<BsCaretRightFill />}
                    >
                      웹에서 미리보기
                    </Button>
                    <Button
                      type="primary"
                      iconPosition="end"
                      icon={<BsCaretRightFill />}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        width: "100%",
                      }}
                    >
                      샘플 다운로드
                    </Button>
                  </Flex>
                ) : (
                  <Flex
                    style={{
                      alignSelf: "center",
                      paddingBlock: "36px",
                      width: screens.lg ? "80%" : "100%",
                      flexDirection: screens.lg ? "row" : "column",
                      gap: "20px",
                    }}
                  >
                    <Button
                      style={{
                        width: "100%",
                        border: "1px solid #d9d9d9",
                        boxShadow: "none",
                      }}
                      type="primary"
                      iconPosition="end"
                      icon={<BsCaretRightFill />}
                    >
                      1차 보정본 다운로드
                    </Button>
                    <Button
                      style={{
                        width: "100%",
                        border: "1px solid #d9d9d9",
                        boxShadow: "none",
                      }}
                      type="primary"
                      iconPosition="end"
                      icon={<BsCaretRightFill />}
                    >
                      최근 재수정본 다운로드
                    </Button>
                    <Button
                      type="primary"
                      iconPosition="end"
                      icon={<BsCaretRightFill />}
                      style={{
                        backgroundColor: "#D0D0D0",
                        color: "black",
                        width: "100%",
                        boxShadow: "none",
                      }}
                      onClick={() => navigation("form", { state: { order } })}
                    >
                      재수정 신청
                    </Button>
                  </Flex>
                )}
              </Flex>
            </Form>

            {/* 🔽 Divider는 마지막 아이템 제외하고만 삽입 */}
            {index < orders.length - 1 && (
              <Divider
                style={{ width: "100%", maxWidth: 1000, margin: "32px 0" }}
              />
            )}
          </React.Fragment>
        ))}
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
        }
      `}</style>
    </ConfigProvider>
  );
}

export default TailityRevisionRequest;
