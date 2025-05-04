// src/styleVars.js

import { label } from "framer-motion/client";

// export const COLORS = {
//   primary: "#CBC4BC",
//   primaryHover: "#C6BCB1",
//   primaryActive: "#ADA69E",
//   background: "white",
//   text: "#141414",
//   fgText: "#746D4B",
// };

// ✨ New

// 🎨 색상 변수
export const COLORS = {
  // 브랜드 주요 색상
  primary: "transparent", // 기본 색상
  primaryHover: "#68644F", // hover 상태 색상
  primaryActive: "#4A4738", // active 상태 색상

  // 배경 및 텍스트
  background: "#EDF9FF", // 전체 배경 색상
  text: "#EAEAEA", // 일반 텍스트 색상
  fgText: "#6BB0FF", // 강조 텍스트 색상 (제목 등)

  buttonText: "#6BB0FF",

  // 입력창 색상
  inputBg: "transparent", // 기본 입력창 배경 색상
  inputHoverBg: "transparent", // Hover 상태 배경 색상 추가
  // 라벨 색상
  label: "#6BB0FF", // 라벨 색상
};

// 📐 사이즈 변수
export const SIZES = {
  buttonPaddingX: "40px", // 버튼 좌우 패딩
  buttonPaddingY: "24px", // 버튼 상하 패딩
  buttonFontSize: 18, // 버튼 폰트 크기
};

// 🔤 폰트 변수
export const FONT = {
  heading: "'Lilita One', sans-serif", // 제목용 폰트
};
