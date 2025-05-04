import React, { useEffect, useState } from "react";
import { Divider as AntDivider } from "antd";
import { theme } from "../../utils/theme";

const CustomDivider = ({ text, isBorder = false }) => {
  const [fontSize, setFontSize] = useState(theme.typography.fontSize.lg);

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 992) {
        setFontSize(theme.typography.fontSize.xxl);
      } else {
        setFontSize(theme.typography.fontSize.xxxl);
      }
    };

    // 초기 설정
    updateFontSize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener("resize", updateFontSize);

    // cleanup
    return () => {
      window.removeEventListener("resize", updateFontSize);
    };
  }, []);

  return (
    <AntDivider
      plain
      style={{
        color: theme.colors.divider,
        fontFamily: theme.typography.fontFamily.main,
        fontWeight: 400,
        fontSize: fontSize || theme.typography.fontSize.lg,
        borderColor: theme.colors.border,
        paddingBlock: theme.spacing.xxl,
      }}
    >
      {/* 텍스트 외곽선 효과 (CSS text-shadow) */}
      <span
        style={{
          width: "100%",
          maxWidth: "900px",
          color: isBorder ? "transparent" : "#A79166",
          WebkitTextStroke: isBorder ? "0.6px #A79166" : "none",
          fontFamily: theme.typography.fontFamily.main,
          fontWeight: 400,
          fontSize,
        }}
      >
        {text}
      </span>
    </AntDivider>
  );
};

export default CustomDivider;
