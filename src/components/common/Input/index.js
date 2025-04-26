import React from "react";
import PropTypes from "prop-types";
import { StyledInput, InputWrapper, Label, ErrorMessage } from "./styles";

/**
 * 재사용 가능한 Input 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.label - 입력 필드 레이블
 * @param {string} props.type - 입력 필드 타입 (text, email, password 등)
 * @param {string} props.name - 입력 필드 이름
 * @param {string} props.value - 입력 필드 값
 * @param {string} props.error - 에러 메시지
 * @param {boolean} props.touched - 필드 터치 여부
 * @param {Function} props.onChange - 변경 이벤트 핸들러
 * @param {Function} props.onBlur - 포커스 아웃 이벤트 핸들러
 * @param {string} props.placeholder - 플레이스홀더 텍스트
 * @param {boolean} props.required - 필수 입력 여부
 * @param {boolean} props.disabled - 비활성화 여부
 * @returns {JSX.Element} Input 컴포넌트
 */
const Input = ({
  label,
  type = "text",
  name,
  value,
  error,
  touched,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <InputWrapper>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span>*</span>}
        </Label>
      )}
      <StyledInput
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        error={touched && error}
        {...props}
      />
      {touched && error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Input;
