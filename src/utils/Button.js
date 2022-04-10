import styled from '@emotion/styled';
import { css } from '@emotion/react';

const base = css`
  border: none;
  cursor: pointer;
  padding: 10px;
  font-size: 16px;
  &:hover {
    box-shadow: 1px 1px 3px 1px lightgray;
  }
`;

const Button = styled.button`
  ${base}
`;

export { Button };
