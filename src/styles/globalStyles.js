import { createGlobalStyle } from "styled-components";

/**
 * 전역 스타일을 정의하는 컴포넌트
 * 애플리케이션 전체에 적용되는 기본 스타일을 정의합니다.
 */
const GlobalStyle = createGlobalStyle`
  :root {
    /* 색상 변수 */
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #ffffff;
    --dark-color: #343a40;
    
    /* 폰트 변수 */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-size-base: 16px;
    --font-size-sm: 14px;
    --font-size-lg: 18px;
    
    /* 간격 변수 */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* 반응형 브레이크포인트 */
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
    --breakpoint-xl: 1200px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: 1.5;
    color: var(--dark-color);
    background-color: var(--light-color);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
`;

export default GlobalStyle;
