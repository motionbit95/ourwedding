import axios from "axios";

// API 기본 설정
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 설정
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/**
 * GET 요청
 * @param {string} url - API 엔드포인트
 * @param {Object} params - 쿼리 파라미터
 * @returns {Promise} API 응답
 */
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * POST 요청
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @returns {Promise} API 응답
 */
export const post = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * PUT 요청
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 요청 데이터
 * @returns {Promise} API 응답
 */
export const put = async (url, data) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * DELETE 요청
 * @param {string} url - API 엔드포인트
 * @returns {Promise} API 응답
 */
export const del = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * 에러 처리
 * @param {Error} error - 에러 객체
 */
const handleError = (error) => {
  if (error.response) {
    // 서버 응답이 있는 경우
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // 인증 에러 처리
        console.error("인증 에러:", data.message);
        break;
      case 403:
        // 권한 에러 처리
        console.error("권한 에러:", data.message);
        break;
      case 404:
        // 리소스 없음 에러 처리
        console.error("리소스 없음:", data.message);
        break;
      case 500:
        // 서버 에러 처리
        console.error("서버 에러:", data.message);
        break;
      default:
        console.error("알 수 없는 에러:", data.message);
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우
    console.error("네트워크 에러:", error.message);
  } else {
    // 요청을 보내기 전에 발생한 에러
    console.error("요청 에러:", error.message);
  }
};

export default api;
