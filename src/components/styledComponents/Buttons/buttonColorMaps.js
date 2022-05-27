import { palatte } from '../basic/common';

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
    round: palatte.gray[100],
    roundHover: palatte.primary.basic,
    gray: palatte.gray[500],
    grayHover: palatte.gray[600],
    grayOutline: palatte.gray[600],
    transparent: 'transparent',
    transparentColor: palatte.gray[800],
    transparentHover: palatte.shadow,
    infoOutline: palatte.info.basic,
  },
};

const roundSmallButtonColorMap = {
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
  gray700: {
    default: {
      backgroundColor: palatte.gray['700'],
      color: palatte.gray['100'],
    },
    hover: {
      backgroundColor: palatte.gray['800'],
      color: palatte.gray['200'],
    },
  },
  transparent: {
    default: {
      backgroundColor: 'transparent',
      color: palatte.gray['500'],
    },
    hover: {
      backgroundColor: palatte.shadow,
      color: palatte.white,
    },
  },
  danger: {
    default: {
      backgroundColor: palatte.danger.basic,
      color: palatte.white,
    },
    hover: {
      backgroundColor: palatte.white,
      color: palatte.danger[400],
    },
  },
};

export { colorMap, roundSmallButtonColorMap };
