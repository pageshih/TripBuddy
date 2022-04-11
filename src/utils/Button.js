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
  background-color: ${(props) => {
    if (props.primary) {
      return 'aliceblue';
    } else if (props.secondary) {
      return 'skyblue';
    } else {
      return 'transparent';
    }
  }};
  align-self: ${(props) => props.alignSelf || 'auto'};
  margin-left: ${(props) => props.marginLeft};
`;

export { Button };
