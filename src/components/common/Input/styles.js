import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
`;

export const Label = styled.label`
  font-size: var(--font-size-sm);
  color: var(--dark-color);
  font-weight: 500;

  span {
    color: var(--danger-color);
    margin-left: var(--spacing-xs);
  }
`;

export const StyledInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid
    ${({ error }) => (error ? "var(--danger-color)" : "#ced4da")};
  border-radius: 4px;
  font-size: var(--font-size-base);
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: ${({ error }) =>
      error ? "var(--danger-color)" : "var(--primary-color)"};
    box-shadow: 0 0 0 3px
      ${({ error }) =>
        error ? "rgba(220, 53, 69, 0.25)" : "rgba(0, 123, 255, 0.25)"};
  }

  &:disabled {
    background-color: var(--light-color);
    cursor: not-allowed;
  }

  &::placeholder {
    color: #6c757d;
  }
`;

export const ErrorMessage = styled.span`
  color: var(--danger-color);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
`;
