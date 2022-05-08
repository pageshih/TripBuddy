import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { palatte, mediaQuery } from './basicStyle';
import PropTypes from 'prop-types';
import { FlexChildDiv, FlexDiv } from './Layout';

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
    round: palatte.secondary[200],
    roundHover: palatte.primary[400],
    gray: palatte.gray[500],
    grayHover: palatte.gray[400],
    grayOutline: palatte.gray[600],
  },
};

const Button = styled.button`
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.padding || '10px 20px'};
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
const buttonSmall = (props) => css`
  font-size: ${props.fontSize || '14px'};
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

const RoundButton = styled.button`
  background-color: ${colorMap.button.round};
  color: ${colorMap.button.roundHover};
  border-radius: 50%;
  width: ${(props) => props.size || '70px'};
  height: ${(props) => props.size || '70px'};
  font-size: ${(props) => `calc(${props.size} - 20px)` || '60px'};
  border: ${(props) => props.border && '2px solid white'};
  border-color: ${(props) => props.borderColor};
  box-shadow: 2px 2px 2px 2px ${palatte.shadow};
  &:hover {
    background-color: ${colorMap.button.roundHover};
    color: ${colorMap.button.round};
  }
`;

const buttonSmallColorMap = {
  primary: {
    default: {
      backgroundColor: palatte.primary.basic,
      color: palatte.white,
    },
    hover: {
      backgroundColor: palatte.primary['800'],
      color: palatte.white,
    },
  },
  gray500: {
    default: {
      backgroundColor: palatte.gray['200'],
      color: palatte.gray['500'],
    },
    hover: {
      backgroundColor: palatte.gray['400'],
      color: palatte.gray['100'],
    },
  },
};
const RoundButtonSmall = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) =>
    props.styled
      ? buttonSmallColorMap[props.styled].default.color
      : palatte.gray['700']};
  background-color: ${(props) =>
    props.styled
      ? buttonSmallColorMap[props.styled].default.backgroundColor
      : 'transparent'};
  padding: ${(props) => props.padding || '0px'};
  border-radius: 50%;
  min-width: ${(props) => props.size || '24px'};
  min-height: ${(props) => props.size || '24px'};
  font-size: ${(props) => props.size || '24px'};
  &:hover {
    color: ${(props) =>
      props.close
        ? palatte.danger.basic
        : props.styled
        ? buttonSmallColorMap[props.styled].hover.color
        : palatte.gray['500']};
    background-color: ${(props) =>
      props.styled
        ? buttonSmallColorMap[props.styled].hover.backgroundColor
        : null};
    box-shadow: ${(props) =>
      props.styled ? `1px 1px 1px 1px ${palatte.shadow}` : null};
  }
  ${(props) => props.addCss}
`;
const RoundButtonSmallWhite = styled(RoundButtonSmall)`
  font-size: ${(props) => props.size || '20px'};
  padding: 5px;
  width: ${(props) =>
    props.size ? `calc(${props.size} + 10px)` : 'fit-content'};
  height: ${(props) =>
    props.size ? `calc(${props.size} + 10px)` : 'fit-content'};
  color: ${palatte.gray['100']};
  background-color: rgba(161, 163, 184, 0.5);
  text-align: center;
  &:hover {
    background-color: rgba(161, 163, 184, 0.3);
    color: ${palatte.white};
  }
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

const capsule = (props) => css`
  padding: 5px 5px 6px 5px;
  border-radius: 30px;
  background-color: ${props.styled
    ? buttonSmallColorMap[props.styled].default.backgroundColor
    : 'inherit'};
  color: ${props.styled
    ? buttonSmallColorMap[props.styled].default.color
    : 'inherit'};
`;
const CapsuleTag = styled.div`
  ${capsule}
  padding: 5px 10px 5px 15px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 16px;
  line-height: 0.9;
`;
const ReviewTagRemoveButton = (props) => (
  <CapsuleTag styled={props.styled}>
    {props.children}
    <RoundButtonSmall
      size="20px"
      addCss={css`
        font-size: 20px;
        color: ${palatte.white};
        opacity: 0.7;
        &:hover {
          opacity: 1;
          color: ${palatte.white};
        }
      `}
      onClick={props.onClick}
      className="material-icons">
      cancel
    </RoundButtonSmall>
  </CapsuleTag>
);

function SaveAndCancelButton(props) {
  return (
    <FlexDiv gap={props.gap || '5px'}>
      <RoundButtonSmallOutline
        className="material-icons"
        type="submit"
        color="primary"
        addCss={css`
          border-radius: 10px;
        `}>
        done
      </RoundButtonSmallOutline>
      <RoundButtonSmallOutline
        className="material-icons"
        type="button"
        color="danger"
        addCss={css`
          border-radius: 10px;
        `}
        onClick={props.close}>
        close
      </RoundButtonSmallOutline>
    </FlexDiv>
  );
}
SaveAndCancelButton.propTypes = {
  close: PropTypes.func,
};
const linkTextColor = css`
  text-decoration: none;
  cursor: pointer;
  & * {
    color: ${palatte.info.basic};
  }
  &:visited {
    & * {
      color: ${palatte.gray[700]};
    }
  }
  &:hover {
    & * {
      color: ${palatte.secondary[700]};
    }
  }
  &:active {
    & * {
      color: ${palatte.primary[800]};
    }
  }
`;
const LinkText = styled.span`
  font-size: ${(props) => props.fontSize || '16px'};
  text-decoration: underline;
`;
const LinkIcon = styled.span`
  font-size: ${(props) =>
    props.fontSize ? `calc(${props.fontSize} + 4px)` : '20px'};
  margin-top: 2px;
`;
function HyperLink(props) {
  return (
    <FlexChildDiv
      as="a"
      href={props.href}
      target={props.target || '_blank'}
      onClick={props.onClick}
      addCss={linkTextColor}
      alignItems="center"
      gap="2px"
      alignSelf={props.alignSelf}>
      <LinkText>{props.children}</LinkText>
      <LinkIcon className="material-icons">{props.iconName}</LinkIcon>
    </FlexChildDiv>
  );
}
export {
  Button,
  ButtonOutline,
  ButtonSmall,
  ButtonSmallIcon,
  ButtonSmallOutline,
  RoundButton,
  RoundButtonSmall,
  RoundButtonSmallOutline,
  RoundButtonSmallWhite,
  ReviewTagRemoveButton,
  SaveAndCancelButton,
  HyperLink,
};
