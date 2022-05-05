import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { FlexDiv, Container } from './Layout';
import underline from '../../images/logoDecorationUnderline.svg';

const palatte = {
  primary: {
    basic: '#17B8B6',
    300: '#A0E9D3',
    400: '#40CFCE',
    800: '#058B8A',
  },
  secondary: {
    basic: '#FFDD4A',
    100: '#FFFCEE',
    500: '#FFC43D',
    700: '#FF9900',
  },
  danger: {
    basic: '#EE7E70',
    400: '#E5383B',
    600: '#D90429',
    900: '#661807',
  },
  info: {
    basic: '#06BEE1',
  },
  gray: {
    100: '#F7F8FC',
    200: '#E8E9F2',
    300: '#D6D7E3',
    400: '#BCBED1',
    500: '#A1A3B8',
    600: '#7E8098',
    700: '#5B5D76',
    800: '#2B2D42',
    900: '#0E111F',
  },
  dark: '#0D060F',
  white: '#FFFFFF',
  shadow: 'rgba(43, 45, 66, 0.2)',
  darkerShadow: 'rgba(43, 45, 66, 0.7)',
};
const breakpoints = [992];
const mediaQuery = breakpoints.map(
  (breakpoint) => `@media (max-width: ${breakpoint}px)`
);
const styles = {
  border: `1px solid ${palatte.gray['400']}`,
  shadow: `2px 2px 2px 2px ${palatte.shadow}`,
  container_maxWidth: '1090px',
  container_padding: '20px',
  containerSetting: css`
    max-width: 1090px;
    margin: auto;
    padding-left: 20px;
    padding-right: 20px;
  `,
};
const Logo = (props) => {
  const logoName = css`
    font-family: 'Caveat', cursive;
    font-size: 64px;
    color: ${palatte.primary.basic};
    ${mediaQuery[0]} {
      font-size: 48px;
    }
  `;
  const ellipse = css`
    width: 8px;
    height: 8px;
    background-color: ${palatte.primary.basic};
    border-radius: 50%;
    ${mediaQuery[0]} {
      width: 6px;
      height: 6px;
    }
  `;
  const slogan = css`
    color: ${palatte.gray['500']};
    letter-spacing: 0.3em;
    font-size: 14px;
    ${mediaQuery[0]} {
      font-size: 12px;
      letter-spacing: 0.15em;
    }
  `;
  const underlineDeco = css`
    position: absolute;
    bottom: 1px;
    width: 220px;
  `;
  const LogoNameCh = css`
    color: ${palatte.gray['600']};
    font-size: 14px;
    margin-bottom: 5px;
  `;
  return (
    <>
      {props.small && (
        <FlexDiv
          alignItems="center"
          gap="10px"
          height="fit-content"
          addCss={props.addCss}>
          <div
            css={css`
              ${ellipse}
              width: 4px;
              height: 4px;
            `}></div>
          <h1
            css={css`
              ${logoName}
              font-size:28px;
            `}>
            TripBuddy
          </h1>
        </FlexDiv>
      )}
      {props.underline && (
        <FlexDiv
          alignItems="flex-end"
          gap="20px"
          addCss={css`
            ${props.addCss}
          `}>
          <FlexDiv alignItems="center">
            <div css={ellipse}></div>
            <Container position="relative">
              <h1 css={logoName}>TripBuddy</h1>
              <img src={underline} alt="deco" css={underlineDeco} />
            </Container>
          </FlexDiv>
          <p css={LogoNameCh}>伴旅</p>
        </FlexDiv>
      )}
      {!props.underline && !props.small && (
        <FlexDiv
          direction="column"
          alignItems="center"
          gap="12px"
          css={css`
            gap: 5px;
          `}>
          <FlexDiv alignItems="center" gap="10px">
            <div css={ellipse}></div>
            <h1 css={logoName}>TripBuddy</h1>
          </FlexDiv>
          <p css={slogan}>幫你記住旅行中的每一刻</p>
        </FlexDiv>
      )}
    </>
  );
};

const heading = (props) => css`
  font-weight: ${props.fontWeight || 700};
  color: ${props.color};
  text-align: ${props.textAlign};
  margin: ${props.margin};
  ${props.addCss};
`;
const H2 = styled.h2`
  ${heading}
  font-size: ${(props) => props.fontSize || '52px'};
`;
const H3 = styled.h3`
  ${heading}
  font-size: ${(props) => props.fontSize || '40px'};
`;

const H4 = styled.h4`
  ${heading}
  font-size: ${(props) => props.fontSize || '32px'};
  ${mediaQuery[0]} {
    font-size: 24px;
  }
`;
const H5 = styled.h5`
  ${heading}
  font-size: ${(props) => props.fontSize || '28px'};
  ${mediaQuery[0]} {
    font-size: 20px;
  }
`;
const H6 = styled.h6`
  ${heading}
  font-size: ${(props) => props.fontSize || '24px'};
  ${mediaQuery[0]} {
    font-size: 18px;
  }
`;
const P = styled.p`
  font-weight: 400;
  font-size: ${(props) => props.fontSize || '16px'};
  color: ${(props) => props.color};
  margin: ${(props) => props.margin};
  text-align: ${(props) => props.textAlign};
  ${mediaQuery[0]} {
    font-size: ${(props) => props.mobileFontSize || '14px'};
    margin: ${(props) => props.margin};
  }
  ${(props) => props.addCss}
`;

export { palatte, Logo, H2, H3, H4, H5, H6, P, styles, mediaQuery };
