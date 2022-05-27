import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { palatte, styles } from '../basic/common';

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
    <a
      href={props.href}
      target={props.target || '_blank'}
      onClick={props.onClick}
      css={css`
        ${linkTextColor}
        ${styles.flex}
      align-items:center;
        gap: 2px;
        ${props.addCss};
      `}>
      <LinkText>{props.children}</LinkText>
      <LinkIcon className="material-icons">{props.iconName}</LinkIcon>
    </a>
  );
}

export default HyperLink;
