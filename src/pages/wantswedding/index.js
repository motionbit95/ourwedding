import React, { useState } from "react";
import { Button, ConfigProvider, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiClipboard } from "react-icons/fi";
import { COLORS, SIZES, FONT } from "./style_vars";
import { color, motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;
const { Title } = Typography;

function WantsWedding() {
  const navigate = useNavigate();
  const [selectedPage, setPage] = useState();

  const verifyToken = (page) => {
    console.log(page);
    setPage(page);
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
      .catch(() => {
        navigate("login", { state: { nextPage: page } });
      });
  };

  const customTheme = {
    components: {
      Button: {},
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
          <Flex vertical align="center" gap="48px">
            {buttonConfigs.map(({ label, page, icon }, index) => (
              <div
                style={{
                  backgroundImage: `url(${
                    page === selectedPage
                      ? require("./asset/button_click.png")
                      : require("./asset/button.png")
                  })`,
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
                <Button
                  key={index}
                  type="text"
                  size="large"
                  style={styles.button}
                  onClick={() => verifyToken(page)}
                  onMouseDown={() => setPage(page)}
                  onMouseLeave={() => setPage(null)}
                  onMouseUp={() => setPage(null)}
                >
                  {label}
                </Button>
                <div
                  style={{
                    backgroundImage: `url(${require("./asset/link.png")})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    width: "24px", // 원하는 아이콘 크기
                    height: "24px",
                    position: "absolute",
                    top: "24px", // 여백 조절
                    right: "24px",
                  }}
                ></div>
              </div>
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
    whiteSpace: "pre-line",
    color: "#6BB0FF",
    fontFamily: "GumiRomanceTTF",
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
  },
};

export default WantsWedding;
