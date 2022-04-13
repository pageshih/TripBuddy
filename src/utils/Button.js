import styled from '@emotion/styled';
import { css } from '@emotion/react';

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: ${(props) => {
    if (props.primary) {
      return 'aliceblue';
    } else if (props.secondary) {
      return 'skyblue';
    } else {
      return 'transparent';
    }
  }};
  align-self: ${(props) => props.alignSelf};
  margin-left: ${(props) => props.marginLeft};
  display: ${(props) => props.display};
  width: ${(props) => props.width};
`;

const RoundButton = styled.button`
  background-color: lightgray;
  border-radius: 50%;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
`;

export { Button, RoundButton };
