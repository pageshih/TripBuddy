import {} from '@mui/icons-material';
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
function HyperLink({
  href,
  target,
  onClick,
  addCss,
  children,
  iconName: Icon,
}) {
  return (
    <a
      href={href}
      target={target || '_blank'}
      onClick={onClick}
      css={css`
        ${linkTextColor}
        ${styles.flex}
      align-items:center;
        gap: 2px;
        ${addCss};
      `}>
      <LinkText>{children}</LinkText>
      <LinkIcon>
        <Icon fontSize="inherit" />
      </LinkIcon>
    </a>
  );
}

export default HyperLink;
