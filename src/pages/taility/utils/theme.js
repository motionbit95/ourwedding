export const theme = {
  colors: {
    primary: "#3E5331",
    primaryHover: "#5A6F4C",
    label: "black",
    text: "#141414",
    background: "#DCDECC",
    border: "black",
    success: "#52C41A",
    error: "#CC573A",
    warning: "#FAAD14",
    info: "#1890FF",
    divider: "#AC8967",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  typography: {
    fontFamily: {
      main: "Rufina",
      primary: "'Rufina', serif",
      secondary: "'Noto Sans KR', sans-serif",
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "20px",
      xl: "24px",
      xxl: "32px",
      xxxl: "64px",
    },
  },
  breakpoints: {
    xs: "320px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1600px",
  },
  components: {
    form: {
      labelColor: "#333333",
      labelFontSize: "16px",
      labelColonMarginInlineEnd: "10vw",
    },
    checkbox: {
      colorPrimary: "#6E865F",
      colorBgContainer: "rgba(110, 134, 95, 0.3)",
      colorBorder: "#D9D9D9",
      colorPrimaryHover: "rgba(110, 134, 95, 0.3)",
      controlInteractiveSize: 20,
    },
    button: {
      colorPrimary: "#6E865F",
      colorPrimaryHover: "#5A6F4C",
      colorTextLightSolid: "#333333",
      colorPrimaryActive: "#ADA69E",
    },
    upload: {
      colorPrimary: "#6E865F",
      colorPrimaryHover: "#5A6F4C",
    },
  },
};

export const getResponsiveValue = (screens, values) => {
  if (screens.xxl)
    return (
      values.xxl ||
      values.xl ||
      values.lg ||
      values.md ||
      values.sm ||
      values.xs
    );
  if (screens.xl)
    return values.xl || values.lg || values.md || values.sm || values.xs;
  if (screens.lg) return values.lg || values.md || values.sm || values.xs;
  if (screens.md) return values.md || values.sm || values.xs;
  if (screens.sm) return values.sm || values.xs;
  return values.xs;
};
