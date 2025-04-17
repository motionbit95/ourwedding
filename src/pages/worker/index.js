import React, { useEffect } from "react";
import {
  Breadcrumb,
  Button,
  Layout,
  Menu,
  Space,
  theme,
  Typography,
} from "antd";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import WorkList from "./work-list";
import Workable from "./workable";
import Settlement from "./settlement";
// import OrderPage from "./order-check";
// import NewOrder from "./new-order";
// import ReOrder from "./re-order";
// import PreWork from "./pre-work";
// import FileSend from "./file-send";

const { Header, Content, Sider } = Layout;

// 메뉴 항목 정의
const menuItems = [
  { key: "work-list", label: "작업 내역" },
  { key: "workable", label: "작업가능한 장수" },
  { key: "settlement", label: "정산" },
];

// 사이드바 메뉴 컴포넌트
const SidebarMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname.replace("/worker/", "") || "dashboard"]}
      style={{ height: "100%", borderRight: 0 }}
      onClick={(e) => navigate(`/worker/${e.key}`)} // <-- /worker/ 추가
      items={menuItems}
    />
  );
};

// 메인 대시보드 컴포넌트
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // 로그인 안되어있으면 로그인 창으로 이동
    if (!localStorage.getItem("admin-token")) {
      navigate("/admin/login");
    }
  }, []);

  return (
    <Layout style={{ height: "100vh", minWidth: "900px" }}>
      <style>
        @import
        url('https://fonts.googleapis.com/css2?family=Rufina:wght@400;700&display=swap');
      </style>
      {/* 헤더 */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Typography.Text
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: 400,
              fontFamily: "Rufina",
            }}
          >
            Workers page
          </Typography.Text>
          <Typography.Text style={{ color: "white" }}>
            작업자 페이지
          </Typography.Text>
        </Space>
        <Button
          onClick={() => {
            localStorage.clear(); // 로컬 스토리지 비우기
            window.location.reload(); // 페이지 새로고침
          }}
        >
          로그아웃
        </Button>
      </Header>

      {/* 전체 레이아웃 */}
      <Layout style={{ flex: 1, overflow: "hidden" }}>
        {/* 사이드바 */}
        <Sider
          width={200}
          style={{ background: colorBgContainer, height: "100%" }}
        >
          <SidebarMenu />
        </Sider>

        {/* Content 영역 (변경되는 부분) */}
        <Layout style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {/* <Breadcrumb
            items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
            style={{ margin: "16px 0" }}
          /> */}
          <Content
            style={{
              flex: 1,
              padding: 24,
              margin: 0,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* 페이지 변경되는 부분 */}
            <Routes>
              <Route path="/" element={<WorkList />} />
              <Route path="work-list" element={<WorkList />} />
              <Route path="workable" element={<Workable />} />
              <Route path="settlement" element={<Settlement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default WorkerDashboard;
