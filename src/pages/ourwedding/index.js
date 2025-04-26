import React from "react";
import { Button, ConfigProvider, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiClipboard } from "react-icons/fi";
import { COLORS, SIZES, FONT } from "./style_vars";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;
const { Title } = Typography;

function Ourwedding() {
  const navigate = useNavigate();

  const verifyToken = (page) => {
    axios
      .post(
        `${API_URL}/auth/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => navigate(page))
      .catch(() => navigate("login", { state: { nextPage: page } }));
  };

  const customTheme = {
    components: {
      Button: {
        primaryColor: `${COLORS.buttonText}AA`,
        colorPrimary: COLORS.primary,
        colorPrimaryHover: COLORS.primaryHover,
        colorPrimaryActive: COLORS.primaryActive,
      },
    },
  };

  const buttonConfigs = [
    { label: "신규신청", icon: <FiEdit />, page: "new" },
    { label: "접수내역 (재수정신청)", icon: <FiClipboard />, page: "revison" },
  ];

  return (
    <ConfigProvider theme={customTheme}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.wrapper}
      >
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Flex vertical align="center" gap="large">
            <Title level={1} style={styles.title}>
              Ourwedding Ourdrama
            </Title>
            {buttonConfigs.map(({ label, page, icon }, index) => (
              <Button
                key={index}
                type="primary"
                size="large"
                icon={icon}
                style={styles.button}
                onClick={() => verifyToken(page)}
              >
                {label}
              </Button>
            ))}
          </Flex>
        </Flex>
      </motion.div>
    </ConfigProvider>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    backgroundColor: COLORS.background,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  title: {
    color: COLORS.fgText,
    fontFamily: FONT.heading,
    textAlign: "center",
  },
  button: {
    maxWidth: "300px",
    paddingInline: SIZES.buttonPaddingX,
    paddingBlock: SIZES.buttonPaddingY,
    fontSize: SIZES.buttonFontSize,
    fontWeight: 500,
    width: "100%",
    whiteSpace: "pre-line",
  },
};

export default Ourwedding;
