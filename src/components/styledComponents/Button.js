import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { palatte, mediaQuery } from './basicStyle';

const colorMap = {
  backgroundColor: {
    primary: palatte.primary.basic,
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
  button: {
    primary: palatte.primary.basic,
    primaryHover: palatte.primary['800'],
    primaryOutline: palatte.primary.basic,
    danger: palatte.danger.basic,
    dangerHover: palatte.danger['400'],
    dangerOutline: palatte.danger['400'],
    round: palatte.gray['200'],
    roundHover: palatte.primary['400'],
  },
};

const Button = styled.button`
  display: flex;
  gap: 4px;
  justify-content: center;
  padding: 10px 20px;
  font-size: ${(props) => props.fontSize || '16px'};
  border-radius: 8px;
  color: ${palatte.white};
  background-color: ${({ styled }) => colorMap.button[styled]};
  align-self: ${(props) => props.alignSelf};
  margin-left: ${(props) => props.marginLeft};
  margin: ${(props) => props.margin};
  display: ${(props) => props.display};
  width: ${(props) => props.width || '100%'};
  pointer-events: ${(props) => props.disable && 'none'};
  &:hover {
    background-color: ${({ styled }) => colorMap.button[styled + 'Hover']};
    box-shadow: 2px 2px 2px 2px ${palatte.shadow};
  }
  ${mediaQuery[0]} {
    font-size: 14px;
  }
`;
const ButtonOutline = styled(Button)`
  color: ${({ styled }) => colorMap.button[styled + 'Outline']};
  background-color: ${palatte.white};
  border: 1px solid ${({ styled }) => colorMap.button[styled + 'Outline']};
  &:hover {
    background-color: ${({ styled }) => colorMap.button[styled + 'Outline']};
    border-color: ${palatte.white};
    color: ${palatte.white};
  }
`;
const ButtonSmall = styled(Button)`
  font-size: ${(props) => props.fontSize || '14px'};
  padding: 5px 20px;
  border-radius: 5px;
`;
const ButtonSmallIcon = styled(ButtonSmall)`
  padding: 5px 10px;
  display: flex;
  gap: 5px;
`;

const RoundButton = styled.button`
  background-color: ${colorMap.button.round};
  color: ${colorMap.button.roundHover};
  border-radius: 50%;
  width: 70px;
  height: 70px;
  &:hover {
    background-color: ${colorMap.button.roundHover};
    color: ${colorMap.button.round};
  }
`;
const RoundButtonSmall = styled.button`
  color: ${palatte.gray['700']};
  background-color: transparent;
  padding: 0px;
  border-radius: 50%;
  width: ${(props) => props.size || '24px'};
  height: ${(props) => props.size || '24px'};
  &:hover {
    color: ${(props) => (props.close ? palatte.danger : palatte.gray['500'])};
  }
`;

export {
  Button,
  ButtonOutline,
  ButtonSmall,
  ButtonSmallIcon,
  RoundButton,
  RoundButtonSmall,
};
