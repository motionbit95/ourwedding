import React from "react";
import PropTypes from "prop-types";
import { StyledButton } from "./styles";

/**
 * 재사용 가능한 Button 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.variant - 버튼 스타일 (primary, secondary, success, danger, warning, info)
 * @param {string} props.size - 버튼 크기 (sm, md, lg)
 * @param {boolean} props.fullWidth - 버튼이 컨테이너의 전체 너비를 차지하는지 여부
 * @param {boolean} props.disabled - 버튼 비활성화 여부
 * @param {React.ReactNode} props.children - 버튼 내부 콘텐츠
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 * @returns {JSX.Element} Button 컴포넌트
 */
const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

export default Button;
