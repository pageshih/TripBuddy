import styled from '@emotion/styled';
import { colorMap, roundSmallButtonColorMap } from './buttonColorMaps';
import { palatte, styles } from '../basic/common';
import { P } from '../basic/Text';

const RoundButton = styled.button`
  background-color: ${colorMap.button.round};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colorMap.button.roundHover};
  border-radius: 50%;
  width: ${(props) => props.size || '70px'};
  height: ${(props) => props.size || '70px'};
  border: ${(props) => props.border && '2px solid white'};
  border-color: ${(props) => props.borderColor};
  box-shadow: 2px 2px 2px 2px ${palatte.shadow};
  &:hover {
    background-color: ${colorMap.button.roundHover};
    color: ${colorMap.button.round};
  }
`;

const RoundButtonSmall = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) =>
    props.styled
      ? roundSmallButtonColorMap[props.styled].default.color
      : palatte.gray['700']};
  background-color: ${(props) =>
    props.styled
      ? roundSmallButtonColorMap[props.styled].default.backgroundColor
      : 'transparent'};
  padding: 0;
  border-radius: 50%;
  width: ${(props) => props.size || '24px'};
  height: ${(props) => props.size || '24px'};
  font-size: ${(props) => props.fontSize || props.size || '24px'};
  &:hover {
    color: ${(props) =>
      props.close
        ? palatte.danger.basic
        : props.styled
        ? roundSmallButtonColorMap[props.styled].hover.color
        : palatte.gray['500']};
    background-color: ${(props) =>
      props.styled
        ? roundSmallButtonColorMap[props.styled].hover.backgroundColor
        : null};
    box-shadow: ${(props) =>
      props.styled ? `1px 1px 1px 1px ${palatte.shadow}` : null};
  }
`;
const RoundButtonSmallWhite = styled(RoundButtonSmall)`
  font-size: ${(props) => props.size || '20px'};
  padding: 5px;
  width: ${(props) =>
    props.size ? `calc(${props.size} + 10px)` : 'fit-content'};
  height: ${(props) =>
    props.size ? `calc(${props.size} + 10px)` : 'fit-content'};
  color: ${palatte.white};
  background-color: rgba(50, 50, 50, 0.4);
  text-align: center;
  &:hover {
    background-color: rgba(255, 255, 255, 0.6);
    color: ${palatte.gray[800]};
  }
  ${(props) => props.addCss};
`;

const RoundButtonSmallOutline = styled(RoundButtonSmall)`
  border: 1px solid ${palatte.gray['600']};
  font-size: 22px;
  width: ${(props) => props.size || '26px'};
  height: ${(props) => props.size || '26px'};
  border-color: ${(props) => props.color && palatte[props.color].basic};
  color: ${(props) => props.color && palatte[props.color].basic};
  &:hover {
    background-color: ${(props) =>
      props.color ? palatte[props.color].basic : palatte.gray['700']};
    color: ${palatte.white};
  }
`;

const ButtonWrapper = styled.button`
  ${styles.flex};
  gap: 10px;
  background-color: transparent;
  & > * {
    color: ${(props) =>
      roundSmallButtonColorMap[props.styled].default.backgroundColor};
  }
  &:hover {
    & p {
      text-decoration: underline;
      color: ${(props) =>
        roundSmallButtonColorMap[props.styled].hover.backgroundColor};
    }
    & svg {
      border-radius: 50%;
      background-color: ${(props) =>
        roundSmallButtonColorMap[props.styled].default.backgroundColor};
      color: ${(props) => roundSmallButtonColorMap[props.styled].hover.color};
    }
  }
`;
const RoundButtonSmallWithLabel = ({
  type,
  styled,
  onClick,
  addCss,
  iconName: Icon,
  children,
}) => (
  <ButtonWrapper type={type} styled={styled} onClick={onClick} css={addCss}>
    <Icon />
    <P>{children}</P>
  </ButtonWrapper>
);

export {
  RoundButton,
  RoundButtonSmall,
  RoundButtonSmallWhite,
  RoundButtonSmallOutline,
  RoundButtonSmallWithLabel,
};
