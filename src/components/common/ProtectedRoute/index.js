import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { OURWEDDING, TAILITY, ADMIN } from "../../../constants/routes";

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 보호할 컴포넌트
 * @param {boolean} props.isAuthenticated - 인증 상태
 * @param {string} props.userType - 사용자 타입 (ourwedding, taility, admin)
 * @returns {JSX.Element} ProtectedRoute 컴포넌트
 */
const ProtectedRoute = ({ children, isAuthenticated, userType }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    let loginPath = "";
    switch (userType) {
      case "ourwedding":
        loginPath = OURWEDDING.LOGIN;
        break;
      case "taility":
        loginPath = TAILITY.LOGIN;
        break;
      case "admin":
        loginPath = ADMIN.LOGIN;
        break;
      default:
        break;
    }

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userType: PropTypes.oneOf(["ourwedding", "taility", "admin"]).isRequired,
};

export default ProtectedRoute;
