import GlobalStyle from "./styles/globalStyles";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

/**
 * 메인 애플리케이션 컴포넌트
 * 라우터 설정을 포함하고 전체 애플리케이션의 루트 컴포넌트 역할을 합니다.
 */
function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
