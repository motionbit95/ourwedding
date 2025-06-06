import {
  Button,
  ConfigProvider,
  Flex,
  Form,
  Grid,
  Input,
  Typography,
  message,
} from "antd";
import React from "react";
import { BsCaretRightFill } from "react-icons/bs";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL; // ✅ 환경 변수 사용

function AdminLogin(props) {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [messageApi, contextHolder] = message.useMessage();
  const navigation = useNavigate();

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
      .post(`${API_URL}/admin/login`, values)
      .then((response) => {
        messageApi.open({
          type: "success",
          content: response.data.message,
        });

        // 토큰 저장
        console.log(response.data);
        localStorage.setItem("admin-token", response.data.token);
        // 로그인 성공

        if (response.data.permission === "관리자") navigation(`/admin`);
        else navigation(`/worker`);
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 400) {
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
          },
          Form: {
            labelColor: "#4F3415",
            labelFontSize: "16px",
          },
          Button: {
            /* here is your component tokens */
            primaryColor: "white",
            colorPrimary: "rgba(0, 0, 0, 1)",
            colorPrimaryHover: "rgba(0, 0, 0, 0.6)",
            colorPrimaryActive: "rgba(0, 0, 0, 0.4)",
          },
        },
      }}
    >
      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap');
      </style>
      <Flex vertical style={{ paddingBlock }}>
        {contextHolder}

        <Flex style={{ alignItems: "center", justifyContent: "center" }}>
          <Typography.Title style={{ fontFamily: "Rufina" }}>
            LOGIN
          </Typography.Title>
        </Flex>

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
            style={{
              paddingBlock,
              paddingInline: "24px",
            }}
          >
            <Form.Item
              colon={false}
              name={"admin_id"}
              label={"아이디"}
              rules={[
                { required: true, message: "관리자 아이디를 입력해주세요." },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              colon={false}
              name={"admin_pw"}
              label={"비밀번호"}
              rules={[
                { required: true, message: "관리자 비밀번호를 입력해주세요." },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Flex style={{ alignSelf: "center", gap: "10px" }}>
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
                로그인
              </Button>

              {/* <Button
                onClick={() => navigation("/admin/signup")}
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
                회원가입
              </Button> */}
            </Flex>
          </Flex>
        </Form>
      </Flex>
    </ConfigProvider>
  );
}

export default AdminLogin;
