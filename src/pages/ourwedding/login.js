import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  Typography,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL; // ✅ 환경 변수 사용

function Login(props) {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();
  const navigation = useNavigate();
  const location = useLocation();
  const nextPage = location.state?.nextPage; // 'nextPage' 값에 접근

  const fontSize = screens.xs
    ? "18px"
    : screens.sm
    ? "32px"
    : screens.md
    ? "48px"
    : screens.lg
    ? "64px"
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
        navigation(`/ourwedding/${nextPage}`);
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
            colorFillTertiary: "#DCDED1",
            activeBorderColor: "#DCDED1",
          },
          Form: {
            labelColor: "#4F3415",
            labelFontSize: "16px",
          },
          Button: {
            /* here is your component tokens */
            primaryColor: "#4F3415",
            colorPrimary: "#BCC8A6",
            colorPrimaryHover: "#C6BCB1",
            colorPrimaryActive: "#ADA69E",
          },
        },
      }}
    >
      <Flex vertical style={{ paddingBlock }}>
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap');
        </style>

        {contextHolder}

        <Divider
          plain
          style={{
            color: "#A79166",
            fontFamily: "Rufina",
            fontWeight: 400,
            fontSize,
          }}
        >
          Ourwedding Ourdrama
        </Divider>

        <Form
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          requiredMark={false}
          variant={"filled"}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 8 }}
        >
          <Flex
            vertical
            gap={"middle"}
            style={{ paddingBlock, paddingInline: "24px" }}
          >
            <Form.Item
              colon={false}
              name={"user_name"}
              label={"접수자 성함"}
              rules={[
                { required: true, message: "접수자 성함을 입력해주세요." },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              colon={false}
              name={"naver_id"}
              label={"네이버 아이디"}
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
              }}
            >
              사진 업로드
            </Button>
          </Flex>
        </Form>
      </Flex>
    </ConfigProvider>
  );
}

export default Login;
