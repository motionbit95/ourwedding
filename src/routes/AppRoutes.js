import { Routes, Route } from "react-router-dom";
import {
  OURWEDDING,
  TAILITY,
  WANTSWEDDING,
  ADMIN,
  WORKER,
  COMMON,
} from "../constants/routes";
import ProtectedRoute from "../components/common/ProtectedRoute";
import useAuth from "../hooks/useAuth";

// WantsWedding 페이지 컴포넌트
import WantsWedding from "../pages/wantswedding";
import WantsLogin from "../pages/wantswedding/login";
import WantsNewOrderPage from "../pages/wantswedding/new";

// Ourwedding 페이지 컴포넌트
import Ourwedding from "../pages/ourwedding";
import NewOrderPage from "../pages/ourwedding/new";
import RevisionRequest from "../pages/ourwedding/revison";
import Login from "../pages/ourwedding/login";
import RevisionForm from "../pages/ourwedding/revison/form";

// Taility 페이지 컴포넌트
import Taility from "../pages/taility";
import TailityLogin from "../pages/taility/login";
import TailityNewOrderPage from "../pages/taility/new";
import TailityRevisionRequest from "../pages/taility/revison";
import TailityRevisionForm from "../pages/taility/revison/form";

// Admin 페이지 컴포넌트
import AdminLogin from "../pages/admin/login";
import AdminSignup from "../pages/admin/signup";
import Dashboard from "../pages/admin";

// Worker 페이지 컴포넌트
import WorkerDashboard from "../pages/worker";
import SubmitResult from "../pages/ourwedding/components/common/Result";

// Common 컴포넌트

/**
 * 애플리케이션의 모든 라우트를 정의하는 컴포넌트
 * 각 섹션별로 라우트를 그룹화하여 관리합니다.
 */
const AppRoutes = () => {
  const adminAuth = useAuth("admin");

  return (
    <Routes>
      <Route path={WANTSWEDDING.BASE} element={<WantsWedding />} />
      <Route path={WANTSWEDDING.LOGIN} element={<WantsLogin />} />
      <Route
        path={WANTSWEDDING.NEW}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="wantswedding"
          >
            <WantsNewOrderPage />
          </ProtectedRoute>
        }
      />

      {/* Ourwedding 라우트 */}
      <Route path={OURWEDDING.BASE} element={<Ourwedding />} />
      <Route path={OURWEDDING.LOGIN} element={<Login />} />
      <Route
        path={OURWEDDING.NEW}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="ourwedding"
          >
            <NewOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={OURWEDDING.REVISION}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="ourwedding"
          >
            <RevisionRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path={OURWEDDING.REVISION_FORM}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="ourwedding"
          >
            <RevisionForm />
          </ProtectedRoute>
        }
      />

      {/* Taility 라우트 */}
      <Route path={TAILITY.BASE} element={<Taility />} />
      <Route path={TAILITY.LOGIN} element={<TailityLogin />} />
      <Route
        path={TAILITY.NEW}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="taility"
          >
            <TailityNewOrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={TAILITY.REVISION}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="taility"
          >
            <TailityRevisionRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path={TAILITY.REVISION_FORM}
        element={
          <ProtectedRoute
            isAuthenticated={!!localStorage.getItem("token")}
            userType="taility"
          >
            <TailityRevisionForm />
          </ProtectedRoute>
        }
      />

      {/* Common 라우트 */}
      <Route path={COMMON.RESULT} element={<SubmitResult />} />

      {/* Admin 라우트 */}
      <Route
        path={ADMIN.DASHBOARD}
        element={
          <ProtectedRoute
            isAuthenticated={adminAuth.isAuthenticated}
            userType="admin"
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path={ADMIN.LOGIN} element={<AdminLogin />} />
      <Route path={ADMIN.SIGNUP} element={<AdminSignup />} />

      {/* Worker 라우트 */}
      <Route path={WORKER.DASHBOARD} element={<WorkerDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
