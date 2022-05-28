import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { colorMap } from './buttonColorMaps';
import { palatte, mediaQuery } from '../basic/common';

const Button = styled.button`
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  color: ${({ styled }) => colorMap.button[styled + 'Color'] || palatte.white};
  background-color: ${({ styled }) => colorMap.button[styled]};
  width: 100%;
  pointer-events: ${(props) => props.disable && 'none'};
  &:hover {
    background-color: ${({ styled }) => colorMap.button[styled + 'Hover']};
    box-shadow: 2px 2px 2px 2px ${palatte.shadow};
  }
  &:disabled {
    background-color: ${palatte.gray[200]};
    color: ${palatte.gray[700]};
    cursor: not-allowed;
  }
  ${mediaQuery[0]} {
    font-size: 14px;
  }
  ${(props) => props.addCss}
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

const buttonSmall = css`
  font-size: 14px;
  padding: 5px 20px;
  border-radius: 5px;
  white-space: nowrap;
`;
const ButtonSmall = styled(Button)`
  ${buttonSmall}
`;

const ButtonSmallOutline = styled(ButtonOutline)`
  ${buttonSmall}
`;
const ButtonSmallIcon = styled(ButtonSmall)`
  padding: 5px 10px;
  display: flex;
  gap: 5px;
`;

const ButtonSmallOutlineIcon = styled(ButtonSmallOutline)`
  padding: 5px 10px;
  display: flex;
  gap: 5px;
`;

export {
  Button,
  ButtonOutline,
  ButtonSmall,
  ButtonSmallOutline,
  ButtonSmallIcon,
  ButtonSmallOutlineIcon,
};
