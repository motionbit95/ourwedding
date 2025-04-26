import { useState, useCallback } from "react";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidDate,
  isRequired,
} from "../utils/validation";

/**
 * 폼 관리를 위한 커스텀 훅
 * @param {Object} initialValues - 폼의 초기값
 * @param {Object} validationRules - 각 필드의 유효성 검사 규칙
 * @returns {Object} 폼 상태와 핸들러 함수들
 */
const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // 유효성 검사 함수
  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) return "";

      for (const rule of rules) {
        if (rule.required && !isRequired(value)) {
          return rule.message || "This field is required";
        }
        if (rule.email && !isValidEmail(value)) {
          return rule.message || "Invalid email format";
        }
        if (rule.password && !isValidPassword(value)) {
          return (
            rule.message ||
            "Password must be at least 8 characters with letters, numbers, and special characters"
          );
        }
        if (rule.phone && !isValidPhone(value)) {
          return rule.message || "Invalid phone number format";
        }
        if (rule.date && !isValidDate(value)) {
          return rule.message || "Invalid date format";
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          return rule.message || "Invalid format";
        }
      }

      return "";
    },
    [validationRules]
  );

  // 입력값 변경 핸들러
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    },
    [validateField]
  );

  // 필드 포커스 아웃 핸들러
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (onSubmit) => {
      return (e) => {
        e.preventDefault();

        // 모든 필드의 유효성 검사
        const newErrors = {};
        Object.keys(values).forEach((name) => {
          newErrors[name] = validateField(name, values[name]);
        });
        setErrors(newErrors);

        // 모든 필드가 유효한 경우에만 onSubmit 호출
        if (Object.values(newErrors).every((error) => !error)) {
          onSubmit(values);
        }
      };
    },
    [values, validateField]
  );

  // 필드 리셋 핸들러
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};

export default useForm;
