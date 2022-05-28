/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
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
  lighterShadow: 'rgba(161, 163, 184, 0.2)',
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
  flex: css`
    display: flex;
  `,
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,
  containerSetting: css`
    max-width: 1090px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
  `,
};

const Loader = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{
      margin: 'auto',
      background: 'rgb(255, 255, 255)',
      display: 'block',
      shapeRendering: 'auto',
    }}
    width={props.size || '30px'}
    height={props.size || '30px'}
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid">
    <circle cx="26" cy="50" fill="#a0e9d3" r="24">
      <animate
        attributeName="cx"
        repeatCount="indefinite"
        dur="1s"
        keyTimes="0;0.5;1"
        values="26;74;26"
        begin="-0.5s"></animate>
    </circle>
    <circle cx="74" cy="50" fill={palatte.primary.basic} r="24">
      <animate
        attributeName="cx"
        repeatCount="indefinite"
        dur="1s"
        keyTimes="0;0.5;1"
        values="26;74;26"
        begin="0s"></animate>
    </circle>
    <circle cx="26" cy="50" fill={palatte.primary[300]} r="24">
      <animate
        attributeName="cx"
        repeatCount="indefinite"
        dur="1s"
        keyTimes="0;0.5;1"
        values="26;74;26"
        begin="-0.5s"></animate>
      <animate
        attributeName="fill-opacity"
        values="0;0;1;1"
        calcMode="discrete"
        keyTimes="0;0.499;0.5;1"
        dur="1s"
        repeatCount="indefinite"></animate>
    </circle>
  </svg>
);
Loader.propTypes = {
  size: PropTypes.string,
};

const PendingLoader = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style={{
      margin: 'auto',
      background: 'transparent',
      display: 'block',
      shapeRendering: 'auto',
    }}
    width={props.size}
    height={props.size}
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid">
    <g transform="translate(80,50)">
      <g transform="rotate(0)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="1">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.875s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.875s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(71.21320343559643,71.21320343559643)">
      <g transform="rotate(45)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.875">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.75s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.75s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(50,80)">
      <g transform="rotate(90)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.75">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.625s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.625s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(28.786796564403577,71.21320343559643)">
      <g transform="rotate(135)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.625">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.5s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.5s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(20,50.00000000000001)">
      <g transform="rotate(180)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.5">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.375s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.375s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(28.78679656440357,28.786796564403577)">
      <g transform="rotate(225)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.375">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.25s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.25s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(49.99999999999999,20)">
      <g transform="rotate(270)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.25">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="-0.125s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="-0.125s"></animate>
        </circle>
      </g>
    </g>
    <g transform="translate(71.21320343559643,28.78679656440357)">
      <g transform="rotate(315)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={props.color || palatte.gray[600]}
          fillOpacity="0.125">
          <animateTransform
            attributeName="transform"
            type="scale"
            begin="0s"
            values="1.5 1.5;1 1"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"></animateTransform>
          <animate
            attributeName="fill-opacity"
            keyTimes="0;1"
            dur="1s"
            repeatCount="indefinite"
            values="1;0"
            begin="0s"></animate>
        </circle>
      </g>
    </g>
  </svg>
);
PendingLoader.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
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
PendingLoader.propTypes = {
  size: PropTypes.string,
  rating: PropTypes.number,
};

export {
  palatte,
  styles,
  mediaQuery,
  breakpoints,
  Loader,
  PendingLoader,
  Rating,
};
