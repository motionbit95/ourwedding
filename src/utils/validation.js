/**
 * 이메일 유효성 검사
 * @param {string} email - 검사할 이메일 주소
 * @returns {boolean} 이메일이 유효한지 여부
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 비밀번호가 유효한지 여부
 */
export const isValidPassword = (password) => {
  // 최소 8자, 최소 하나의 문자, 하나의 숫자, 하나의 특수문자
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 전화번호 유효성 검사
 * @param {string} phone - 검사할 전화번호
 * @returns {boolean} 전화번호가 유효한지 여부
 */
export const isValidPhone = (phone) => {
  // 한국 전화번호 형식 (010-1234-5678)
  const phoneRegex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 날짜 유효성 검사
 * @param {string} date - 검사할 날짜 (YYYY-MM-DD)
 * @returns {boolean} 날짜가 유효한지 여부
 */
export const isValidDate = (date) => {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  if (!dateRegex.test(date)) return false;

  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

/**
 * 필수 필드 검사
 * @param {string} value - 검사할 값
 * @returns {boolean} 값이 존재하는지 여부
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value !== "";
};
