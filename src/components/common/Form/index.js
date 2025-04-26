import React from "react";
import PropTypes from "prop-types";
import { StyledForm } from "./styles";

/**
 * 재사용 가능한 Form 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 폼 내부 컴포넌트들
 * @param {Function} props.onSubmit - 폼 제출 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 * @returns {JSX.Element} Form 컴포넌트
 */
const Form = ({ children, onSubmit, className, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <StyledForm onSubmit={handleSubmit} className={className} {...props}>
      {children}
    </StyledForm>
  );
};

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Form;
