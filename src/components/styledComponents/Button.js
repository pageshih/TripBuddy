import styled from '@emotion/styled';
import { css } from '@emotion/react';

const colorMap = {
  backgroundColor: {
    primary: 'aliceblue',
    secondary: 'skyblue',
    danger: 'crimson',
    disable: 'lightgray',
  },
  color: {
    primary: 'black',
    secondary: 'black',
    danger: 'white',
    disable: 'gray',
  },
};

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  color: ${({ styled }) => {
    return colorMap.color[styled] || 'black';
  }};
  background-color: ${({ styled }) => {
    return colorMap.backgroundColor[styled] || 'transparent';
  }};
  align-self: ${(props) => props.alignSelf};
  margin-left: ${(props) => props.marginLeft};
  margin: ${(props) => props.margin};
  display: ${(props) => props.display};
  width: ${(props) => props.width};
  pointer-events: ${(props) => props.disable && 'none'};
`;

const RoundButton = styled.button`
  background-color: lightgray;
  border-radius: 50%;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
`;

export { Button, RoundButton };
