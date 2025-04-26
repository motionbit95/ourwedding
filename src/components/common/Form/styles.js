import styled from "styled-components";

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: var(--breakpoint-sm)) {
    padding: var(--spacing-md);
  }
`;
