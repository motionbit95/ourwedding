import React, { useEffect, useState } from "react";
import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Input,
  message,
} from "antd";
import { BsUpload } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { COLORS, FONT } from "./style_vars"; // 🎨 스타일 변수 분리

const API_URL = process.env.REACT_APP_API_URL;

function WantsLogin() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPage = location.state?.nextPage || "new"; // 기본값 설정

  console.log("Location state:", location.state); // 디버깅용 로그
  console.log("Next page:", nextPage); // 디버깅용 로그

  const [fontSize, setFontSize] = useState("20px");
  const [paddingBlock, setPaddingBlock] = useState("20px");

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width < 480) {
        setFontSize("36px");
        setPaddingBlock("60px");
      } else if (width < 768) {
        setFontSize("48px");
        setPaddingBlock("80px");
      } else if (width < 1024) {
        setFontSize("72px");
        setPaddingBlock("100px");
      } else {
        setFontSize("96px");
        setPaddingBlock("120px");
      }
    };

    updateSizes(); // 초기값 설정
    window.addEventListener("resize", updateSizes);

    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  // ✅ 로그인 시도
  const onFinish = (values) => {
    axios
      .post(`${API_URL}/auth/login`, values)
      .then((response) => {
        messageApi.success(response.data.message);
        localStorage.setItem("token", response.data.token);
        console.log("Token:", response.data.token);
        console.log("Next page before navigation:", nextPage);

        // 즉시 페이지 이동
        navigate(`/wantswedding/${nextPage}`, {
          replace: true,
          state: { nextPage }, // state 유지
        });
      })
      .catch((error) => {
        const { status, data } = error.response;
        if (status === 400 && data.code === -1001) {
          // 🔄 사용자 없을 경우 회원가입 → 재시도
          axios
            .post(`${API_URL}/auth/signup`, values)
            .then(() => onFinish(values))
            .catch((err) => messageApi.error(err.response.data.message));
        } else {
          messageApi.error(data.message);
        }
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  // 🌈 테마 정의
  const theme = {
    components: {
      Input: {
        colorFillTertiary: COLORS.inputBg, // 기본 배경 색상
        activeBg: COLORS.inputBg, // 활성화된 버튼 색상
        activeBorderColor: "transparent", // Focus 상태 색상
      },
      Form: {
        labelColor: COLORS.label,
        labelFontSize: "16px",
      },
      Button: {},
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <Flex
        vertical
        style={{
          backgroundColor: COLORS.background,
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap"
          rel="stylesheet"
        />

        {contextHolder}

        {/* 📌 타이틀 */}
        <Divider
          plain
          style={{
            color: COLORS.fgText,
            fontFamily: FONT.heading,
            fontSize,
            borderColor: "transparent",
            color: "#F3FFF3",
            WebkitTextStroke: "1.2px #4DA0FF",
          }}
        >
          Want’s wedding
        </Divider>

        {/* 📥 로그인 폼 */}
        <Form
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          requiredMark={false}
          variant="filled"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ zIndex: 99 }}
        >
          <Flex
            vertical
            gap="middle"
            style={{
              paddingBlock,
              paddingInline: "24px",
            }}
          >
            <Form.Item
              colon={false}
              name="user_name"
              label={
                <div
                  style={{
                    fontFamily: "GumiRomanceTTF",
                  }}
                >
                  {"접수자 성함"}
                </div>
              }
              rules={[
                { required: true, message: "접수자 성함을 입력해주세요." },
              ]}
            >
              <div
                style={{
                  backgroundImage: `url(${require("./asset/button_click.png")})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "300px",
                  height: "100px",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Input style={{ textAlign: "center" }} />
              </div>
            </Form.Item>
            <Form.Item
              colon={false}
              name="naver_id"
              label={
                <div style={{ fontFamily: "GumiRomanceTTF" }}>
                  {"네이버 아이디"}
                </div>
              }
              rules={[
                { required: true, message: "네이버 아이디를 입력해주세요." },
              ]}
            >
              <div
                style={{
                  backgroundImage: `url(${require("./asset/button_click.png")})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "300px",
                  height: "100px",
                  display: "flex",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Input style={{ textAlign: "center" }} />
              </div>
            </Form.Item>

            <div
              style={{
                backgroundImage: `url(${require("./asset/button2.png")})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                display: "flex",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                htmlType="submit"
                icon={<BsUpload />}
                iconPosition="end"
                type="text"
                size="large"
                style={{
                  width: "auto",
                  alignSelf: "center",
                  marginTop: "16px",
                  fontFamily: "GumiRomanceTTF",

                  whiteSpace: "pre-line",
                  color: "#2772C7",
                  fontFamily: "GumiRomanceTTF",
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                  zIndex: 99,
                }}
              >
                사진 업로드
              </Button>
            </div>
          </Flex>
        </Form>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            paddingTop: "30%",
            backgroundImage: `url(${require("./asset/bg1.png")})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom",
          }}
        ></div>
      </Flex>

      <style jsx>{`
        .ant-input-filled {
          color: ${COLORS.fgText} !important;
        }
        .ant-input-filled:hover {
          background: ${COLORS.inputBg} !important; /* 원하는 색상으로 */
        }
        .ant-form-item-label {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
    </ConfigProvider>
  );
}

export default WantsLogin;
