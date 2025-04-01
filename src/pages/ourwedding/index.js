import { Button, ConfigProvider, Flex } from "antd";
import React from "react";
import { FiLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Ourwedding(props) {
  const navigation = useNavigate();

  const verifyToken = (page) => {
    axios
      .post(
        "https://api-54hk753mxa-uc.a.run.app/auth/verify-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        navigation(page);
      })
      .catch((error) => {
        navigation("login", { state: { nextPage: page } });
      });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            /* here is your component tokens */
            primaryColor: "rgba(0,0,0,0.88)",
            colorPrimary: "#CBC4BC",
            colorPrimaryHover: "#C6BCB1",
            colorPrimaryActive: "#ADA69E",
          },
        },
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          height: "100vh",
        }}
      >
        <Flex gap={"large"} vertical>
          <Flex gap={"small"}>
            <Button
              type="primary"
              size="large"
              style={{ width: "100%", paddingInline: "40px" }}
              onClick={() => {
                verifyToken("new");
              }}
            >
              신규신청
            </Button>
            <Button size="large" shape="circle" type="text" icon={<FiLink />} />
          </Flex>
          <Flex gap={"small"}>
            <Button
              type="primary"
              size="large"
              style={{ width: "100%", paddingInline: "40px" }}
              onClick={() => {
                verifyToken("revison");
              }}
            >
              접수내역(재수정 신청)
            </Button>
            <Button size="large" shape="circle" type="text" icon={<FiLink />} />
          </Flex>
        </Flex>
      </Flex>
    </ConfigProvider>
  );
}

export default Ourwedding;
