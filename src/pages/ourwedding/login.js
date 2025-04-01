import {
  Button,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  Typography,
} from "antd";
import React from "react";
import { BsCaretRightFill } from "react-icons/bs";

function Login(props) {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

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
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              colon={false}
              name={"naver_id"}
              label={"네이버 아이디"}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Button
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
