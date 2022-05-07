import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { FlexDiv, Container } from './Layout';
// import { SaveAndCancelButton } from './Button';
import underline from '../../images/logoDecorationUnderline.svg';
import PropTypes from 'prop-types';

const palatte = {
  primary: {
    basic: '#17B8B6',
    300: '#A0E9D3',
    400: '#40CFCE',
    600: '#2CAEAE',
    800: '#058B8A',
  },
  secondary: {
    basic: '#FFDD4A',
    100: '#FFFCEE',
    200: '#FFEFAA',
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
const headingFontSize = {
  desktop: {
    2: '52px',
    3: '40px',
    4: '32px',
    5: '28px',
    6: '24px',
  },
  mobile: {
    2: '52px',
    3: '40px',
    4: '24px',
    5: '20px',
    6: '18px',
  },
};
const heading = (props) => css`
  font-weight: ${props.fontWeight || 700};
  color: ${props.color};
  text-align: ${props.textAlign};
  margin: ${props.margin};
  ${props.addCss};
`;
const H2 = styled.h2`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[2]};
  ${heading}
`;
const H3 = styled.h3`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[3]};
  ${heading}
`;

const H4 = styled.h4`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[4]};
  ${heading}
  ${mediaQuery[0]} {
    font-size: ${headingFontSize.mobile[4]};
  }
`;
const H5 = styled.h5`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[5]};
  ${heading}
  ${mediaQuery[0]} {
    font-size: ${headingFontSize.mobile[5]};
  }
`;
const H6 = styled.h6`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[6]};
  ${heading}
  ${mediaQuery[0]} {
    font-size: ${headingFontSize.mobile[6]};
  }
`;
const P = styled.p`
  font-weight: ${(props) => props.fontWeight || 400};
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
const Loader = styled.div`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-radius: 50%;
  border: 10px solid ${(props) => props.color || palatte.gray['400']};
  border-top: none;
`;

const headingComponents = {
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6,
};

const Rating = (props) => {
  return (
    <svg
      width={props.size * 5}
      height={props.size}
      viewBox={`0 0 140 28`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <pattern id="starOutline" x="0" y="0" width=".2" height="100">
        <path
          d="M24.8308 9.65506L17.8882 8.64608L14.7847 2.35428C14.6999 2.18202 14.5604 2.04256 14.3882 1.9578C13.9561 1.74452 13.4311 1.92225 13.2151 2.35428L10.1116 8.64608L3.16904 9.65506C2.97763 9.68241 2.80263 9.77264 2.66865 9.90936C2.50667 10.0758 2.41741 10.2998 2.42049 10.5321C2.42356 10.7644 2.51872 10.9859 2.68505 11.148L7.7081 16.0453L6.52138 22.9605C6.49355 23.1214 6.51135 23.2868 6.57277 23.4381C6.63418 23.5894 6.73675 23.7204 6.86884 23.8163C7.00093 23.9123 7.15725 23.9693 7.32009 23.9809C7.48293 23.9925 7.64577 23.9582 7.79013 23.882L13.9999 20.6172L20.2097 23.882C20.3792 23.9723 20.5761 24.0023 20.7647 23.9695C21.2405 23.8875 21.5604 23.4363 21.4784 22.9605L20.2917 16.0453L25.3147 11.148C25.4515 11.014 25.5417 10.839 25.569 10.6476C25.6429 10.1691 25.3093 9.72616 24.8308 9.65506V9.65506ZM18.178 15.3562L19.1651 21.1066L13.9999 18.3941L8.83466 21.1094L9.82177 15.359L5.64365 11.2848L11.4186 10.4453L13.9999 5.21444L16.5811 10.4453L22.3561 11.2848L18.178 15.3562Z"
          fill={palatte.secondary['500']}
        />
      </pattern>
      <pattern id="starFilled" x="0" y="0" width=".2" height="100">
        <path
          d="M24.8308 9.65506L17.8882 8.64608L14.7847 2.35428C14.6999 2.18202 14.5604 2.04256 14.3882 1.9578C13.9561 1.74452 13.4311 1.92225 13.2151 2.35428L10.1116 8.64608L3.16904 9.65506C2.97763 9.68241 2.80263 9.77264 2.66865 9.90936C2.50667 10.0758 2.41741 10.2998 2.42049 10.5321C2.42356 10.7644 2.51872 10.9859 2.68505 11.148L7.7081 16.0453L6.52138 22.9605C6.49355 23.1214 6.51135 23.2868 6.57277 23.4381C6.63418 23.5894 6.73675 23.7204 6.86884 23.8163C7.00093 23.9123 7.15725 23.9693 7.32009 23.9809C7.48293 23.9925 7.64577 23.9582 7.79013 23.882L13.9999 20.6172L20.2097 23.882C20.3792 23.9723 20.5761 24.0023 20.7647 23.9695C21.2405 23.8875 21.5604 23.4363 21.4784 22.9605L20.2917 16.0453L25.3147 11.148C25.4515 11.014 25.5417 10.839 25.569 10.6476C25.6429 10.1691 25.3093 9.72616 24.8308 9.65506V9.65506Z"
          fill={palatte.secondary['500']}
        />
      </pattern>
      <defs>
        <clipPath id={`range${props.rating * 10}`}>
          <rect
            x="0"
            y="0"
            width={Math.floor(((props.rating * 2) / 10) * 141)}
            height="28"
          />
        </clipPath>
      </defs>
      <rect width="140" height="28" fill="url(#starOutline)" x="0" y="0" />
      <rect
        width="140"
        height="28"
        fill="url(#starFilled)"
        x="0"
        y="0"
        clipPath={`url(#${`range${props.rating * 10}`})`}
      />
    </svg>
  );
};

export {
  palatte,
  Logo,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  styles,
  mediaQuery,
  Loader,
  headingComponents,
  headingFontSize,
  Rating,
};
