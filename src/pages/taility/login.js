import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Image,
  Input,
  Space,
  Typography,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import sImage from "../../asset/s.png";

const API_URL = process.env.REACT_APP_API_URL; // ✅ 환경 변수 사용

function TailityLogin(props) {
  const [messageApi, contextHolder] = message.useMessage();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
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
        console.log("Token:", response.data.token);
        console.log("Next page before navigation:", nextPage);

        // 즉시 페이지 이동
        navigate(`/taility/${nextPage}`, {
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

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            /* here is your component tokens */
            // colorFillTertiary: "#DCDED1",
            // activeBorderColor: "#DCDED1",
            colorBorder: "black",
          },
          Form: {
            labelColor: "black",
            labelFontSize: "16px",
          },
          Button: {
            /* here is your component tokens */
            primaryColor: "rgba(0,0,0,0.88)",
            colorPrimary: "white",
            colorPrimaryHover: "white",
            colorPrimaryActive: "white",
            primaryShadow: "none",
          },
        },
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* 왼쪽: 세로 글자 */}
        {screens.md && (
          <>
            <div style={{ position: "relative", width: "15%", minWidth: 120 }}>
              <Typography
                style={{
                  fontFamily: "Aboreto",
                  fontSize: 220,
                  transform: "rotate(90deg)",
                  transformOrigin: "bottom left",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                  position: "absolute",
                  top: 0,
                  left: -50,
                  color: "rgba(0,0,0,0.2)",
                }}
              >
                TAILITY
              </Typography>
            </div>
            {/* 가운데: 선 + 이미지 */}
            <div
              style={{
                position: "relative",
                width: "20%",
                minWidth: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* 세로선 */}
              <div
                style={{
                  position: "absolute",
                  width: 1,
                  backgroundColor: "black",
                  height: "100vh",
                  left: "50%",
                  transform: "translateX(-0.5px)",
                }}
              />
              {/* 이미지 */}
              <Image
                preview={false}
                src={sImage}
                style={{
                  // position: "absolute",
                  top: "50%",
                  left: "50%",
                  // transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </>
        )}

        {/* 오른쪽: 폼 */}
        <div style={{ flex: 1, paddingBlock }}>
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Aboreto&family=Baskervville:ital@0;1&display=swap');`}
          </style>
          <Typography
            style={{
              width: "100%",
              textAlign: "center",
              color: "rgba(0, 0, 0, 0.5)",
              fontFamily: "Baskervville",
              fontWeight: 400,
              fontSize,
            }}
          >
            TAILITY
          </Typography>
          <Form
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            requiredMark={false}
            variant="underlined"
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
                <Input />
              </Form.Item>
              <Form.Item
                colon={false}
                name="naver_id"
                label="네이버 아이디"
                rules={[
                  { required: true, message: "네이버 아이디를 입력해주세요." },
                ]}
              >
                <Input />
              </Form.Item>
              <Button
                htmlType="submit"
                icon={<BsCaretRightFill />}
                iconPosition="end"
                type="primary"
                style={{
                  width: "auto",
                  paddingInline: "16px",
                  alignSelf: "center",
                  marginBlock: paddingBlock,
                  borderRadius: 0,
                  borderBottom: "1px solid black",
                }}
              >
                사진 업로드
              </Button>
            </Flex>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default TailityLogin;
