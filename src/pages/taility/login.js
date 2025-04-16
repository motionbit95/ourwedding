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
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();
  const navigation = useNavigate();
  const location = useLocation();
  const nextPage = location.state?.nextPage; // 'nextPage' 값에 접근

  const fontSize = screens.xs
    ? "48px"
    : screens.sm
    ? "64px"
    : screens.md
    ? "128px"
    : screens.lg
    ? "128px"
    : "20px";

  const paddingBlock = screens.xs
    ? "60px"
    : screens.sm
    ? "80px"
    : screens.md
    ? "100px"
    : screens.lg
    ? "120px"
    : "20px";

  const onFinish = (values) => {
    axios
      .post(`${API_URL}/auth/login`, values)
      .then((response) => {
        messageApi.open({
          type: "success",
          content: response.data.message,
        });

        // 토큰 저장
        localStorage.setItem("token", response.data.token);
        // 로그인 성공
        navigation(`/taility/${nextPage}`);
      })
      .catch((error) => {
        if (error.response.status === 400) {
          if (error.response.data.code === -1001) {
            // 정보가 없음 - 회원가입 후 이동
            axios
              .post(`${API_URL}/auth/signup`, values)
              .then((response) => {
                // messageApi.open({
                //   type: "success",
                //   content: response.data.message,
                // });
                onFinish(values);
              })
              .catch((error) => {
                // 응답 오류 - 메세지 박스 표시
                messageApi.open({
                  type: "error",
                  content: error.response.data.message,
                });
              });

            return;
          }
          // 응답 오류 - 메세지 박스 표시
          messageApi.open({
            type: "error",
            content: error.response.data.message,
          });
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
