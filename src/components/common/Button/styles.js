import styled from "styled-components";

const getVariantStyles = (variant) => {
  switch (variant) {
    case "primary":
      return `
        background-color: var(--primary-color);
        color: white;
        &:hover {
          background-color: #0056b3;
        }
      `;
    case "secondary":
      return `
        background-color: var(--secondary-color);
        color: white;
        &:hover {
          background-color: #5a6268;
        }
      `;
    case "success":
      return `
        background-color: var(--success-color);
        color: white;
        &:hover {
          background-color: #218838;
        }
      `;
    case "danger":
      return `
        background-color: var(--danger-color);
        color: white;
        &:hover {
          background-color: #c82333;
        }
      `;
    case "warning":
      return `
        background-color: var(--warning-color);
        color: black;
        &:hover {
          background-color: #e0a800;
        }
      `;
    case "info":
      return `
        background-color: var(--info-color);
        color: white;
        &:hover {
          background-color: #138496;
        }
      `;
    default:
      return `
        background-color: var(--primary-color);
        color: white;
        &:hover {
          background-color: #0056b3;
        }
      `;
  }
};

const getSizeStyles = (size) => {
  switch (size) {
    case "sm":
      return `
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
      `;
    case "lg":
      return `
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: var(--font-size-lg);
      `;
    default:
      return `
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-base);
      `;
  }
};

export const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};

  ${({ variant }) => getVariantStyles(variant)}
  ${({ size }) => getSizeStyles(size)}

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;
