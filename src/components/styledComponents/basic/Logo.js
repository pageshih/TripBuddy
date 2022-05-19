import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { mediaQuery, palatte } from './common';
import underline from '../../../images/logoDecorationUnderline.svg';

const common = css`
  display: flex;
  cursor: pointer;
`;
const FlexAlignCenter = styled.div`
  display: flex;
  align-items: center;
`;
const SmallLogoContainer = styled.div`
  ${common}
  align-items:center;
  gap: 10px;
  height: fit-content;
`;
const UnderlineLogoContainer = styled.div`
  ${common}
  align-items:flex-end;
  gap: 20px;
`;
const LargeLogoContainer = styled.div`
  ${common}
  direction:column;
  align-items: center;
  gap: 5px;
`;

const Ellipse = styled.div`
  width: ${(props) => (props.isSmall ? '4px' : '8px')};
  height: ${(props) => (props.isSmall ? '4px' : '8px')};
  background-color: ${palatte.primary.basic};
  border-radius: 50%;
  ${mediaQuery[0]} {
    width: 6px;
    height: 6px;
  }
`;
const underlineDeco = css`
  position: absolute;
  bottom: 1px;
  width: 220px;
`;
const LogoName = (props) => (
  <h1
    css={css`
      font-family: 'Caveat', cursive;
      font-size: ${props.isSmall ? '28px' : '64px'};
      color: ${palatte.primary.basic};
      ${mediaQuery[0]} {
        font-size: ${!props.small && !props.underline && '48px'};
      }
    `}>
    TripBuddy
  </h1>
);
const LogoNameCh = () => (
  <p
    css={css`
      color: ${palatte.gray['600']};
      font-size: 14px;
      margin-bottom: 5px;
    `}>
    伴旅
  </p>
);
const Slogan = () => (
  <p
    css={css`
      color: ${palatte.gray['500']};
      letter-spacing: 0.3em;
      font-size: 14px;
      ${mediaQuery[0]} {
        font-size: 12px;
        letter-spacing: 0.15em;
      }
    `}>
    幫你記住旅行中的每一刻
  </p>
);

export const Logo = (props) => {
  const navigate = useNavigate();
  return (
    <>
      {props.small && (
        <SmallLogoContainer onClick={() => navigate('/itineraries')}>
          <Ellipse isSmall />
          <LogoName />
        </SmallLogoContainer>
      )}
      {props.underline && (
        <UnderlineLogoContainer onClick={() => navigate('/itineraries')}>
          <FlexAlignCenter>
            <Ellipse />
            <div
              css={css`
                position: relative;
              `}>
              <LogoName />
              <img src={underline} alt="deco" css={underlineDeco} />
            </div>
          </FlexAlignCenter>
          <LogoNameCh />
        </UnderlineLogoContainer>
      )}
      {!props.underline && !props.small && (
        <LargeLogoContainer onClick={() => navigate('/itineraries')}>
          <FlexAlignCenter
            css={css`
              gap: 10px;
            `}>
            <Ellipse />
            <LogoName />
          </FlexAlignCenter>
          <Slogan />
        </LargeLogoContainer>
      )}
    </>
  );
};
