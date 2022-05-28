import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { mediaQuery } from './common';
const headingFontSize = {
  desktop: {
    2: '52px',
    3: '40px',
    4: '32px',
    5: '28px',
    6: '24px',
  },
  mobile: {
    2: '42px',
    3: '30px',
    4: '28px',
    5: '24px',
    6: '20px',
  },
};
const heading = (props) => css`
  font-weight: ${props.fontWeight || 700};
  color: ${props.color};
  text-align: ${props.textAlign};
  line-height: ${props.lineHeight};
  margin: ${props.margin};
  white-space: ${props.whiteSpace};
  ${props.addCss};
`;
const H2 = styled.h2`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[2]};
  ${heading}
  ${mediaQuery[0]} {
    font-size: ${headingFontSize.mobile[2]};
  }
`;
const H3 = styled.h3`
  font-size: ${(props) => props.fontSize || headingFontSize.desktop[3]};
  ${heading}
  ${mediaQuery[0]} {
    font-size: ${headingFontSize.mobile[3]};
  }
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
  whitespace: ${(props) => props.whiteSpace};
  ${mediaQuery[0]} {
    font-size: ${(props) => props.mobileFontSize || '14px'};
    margin: ${(props) => props.margin};
  }
  ${(props) => props.addCss}
`;

const textComponents = {
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6,
  P: P,
};

export { H2, H3, H4, H5, H6, P, textComponents, headingFontSize };
