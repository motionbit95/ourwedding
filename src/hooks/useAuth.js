import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../utils/api";
import { OURWEDDING, TAILITY, ADMIN } from "../constants/routes";

/**
 * 인증 관련 커스텀 훅
 * @param {string} userType - 사용자 타입 (ourwedding, taility, admin)
 * @returns {Object} 인증 상태와 관련 함수들
 */
const useAuth = (userType) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(`token`);
        if (token) {
          setAuthToken(token);
          // TODO: 토큰 유효성 검사 API 호출
          // const response = await get(`/auth/check/${userType}`);
          // setUser(response.user);
        }
      } catch (err) {
        setError(err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [userType]);

  // 로그인
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);
        setError(null);
        // TODO: 로그인 API 호출
        // const response = await post(`/auth/login/${userType}`, credentials);
        // const { token, user } = response;

        // localStorage.setItem(`${userType}Token`, token);
        // setAuthToken(token);
        // setUser(user);

        // 로그인 후 리다이렉트
        switch (userType) {
          case "ourwedding":
            navigate(OURWEDDING.BASE);
            break;
          case "taility":
            navigate(TAILITY.BASE);
            break;
          case "admin":
            navigate(ADMIN.BASE);
            break;
          default:
            break;
        }
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userType, navigate]
  );

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem(`${userType}Token`);
    setAuthToken(null);
    setUser(null);

    // 로그아웃 후 리다이렉트
    switch (userType) {
      case "ourwedding":
        navigate(OURWEDDING.LOGIN);
        break;
      case "taility":
        navigate(TAILITY.LOGIN);
        break;
      case "admin":
        navigate(ADMIN.LOGIN);
        break;
      default:
        break;
    }
  }, [userType, navigate]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;
