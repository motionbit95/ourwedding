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

function Login() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPage = location.state?.nextPage;

  const [fontSize, setFontSize] = useState("20px");
  const [paddingBlock, setPaddingBlock] = useState("20px");

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;

      if (width < 480) {
        setFontSize("18px");
        setPaddingBlock("60px");
      } else if (width < 768) {
        setFontSize("24px");
        setPaddingBlock("80px");
      } else if (width < 1024) {
        setFontSize("36px");
        setPaddingBlock("100px");
      } else {
        setFontSize("48px");
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
        navigate(`/ourwedding/${nextPage}`);
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
        activeBorderColor: COLORS.fgText, // Focus 상태 색상
      },
      Form: {
        labelColor: COLORS.label,
        labelFontSize: "16px",
      },
      Button: {
        primaryColor: `${COLORS.buttonText}AA`,
        colorPrimary: COLORS.primary,
        colorPrimaryHover: COLORS.primaryHover,
        colorPrimaryActive: COLORS.primaryActive,
      },
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
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap"
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
            borderColor: COLORS.fgText,
          }}
        >
          Ourwedding Ourdrama
        </Divider>

        {/* 📥 로그인 폼 */}
        <Form
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          requiredMark={false}
          variant="filled"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 8 }}
        >
          <Flex
            vertical
            gap="middle"
            style={{ paddingBlock, paddingInline: "24px" }}
          >
            <Form.Item
              colon={false}
              name="user_name"
              label="접수자 성함"
              rules={[
                { required: true, message: "접수자 성함을 입력해주세요." },
              ]}
            >
              <Input variant="filled" />
            </Form.Item>
            <Form.Item
              colon={false}
              name="naver_id"
              label="네이버 아이디"
              rules={[
                { required: true, message: "네이버 아이디를 입력해주세요." },
              ]}
            >
              <Input variant="filled" />
            </Form.Item>

            <Button
              htmlType="submit"
              icon={<BsUpload />}
              iconPosition="end"
              type="primary"
              size="large"
              style={{
                width: "auto",
                paddingInline: "16px",
                alignSelf: "center",
                marginTop: "36px",
              }}
            >
              사진 업로드
            </Button>
          </Flex>
        </Form>
      </Flex>

      <style jsx>{`
        .ant-input-filled {
          color: ${COLORS.text} !important;
        }
        .ant-input-filled:hover {
          background: ${COLORS.inputBg} !important; /* 원하는 색상으로 */
        }
      `}</style>
    </ConfigProvider>
  );
}

export default Login;
