import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { styles, palatte, H4, H5, P, mediaQuery } from './basicStyle';
import { timestampToString } from '../../utils/utilities';
import { FlexChildDiv, FlexDiv, Image } from './Layout';
import { CheckboxCustom } from './Form';

const CardWrapper = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  gap: ${(props) => props.gap};
  flex-direction: ${(props) => props.column && 'column'};
  flex-grow: ${(props) => props.grow};
  max-width: ${(props) => props.maxWidth};
  background-color: ${(props) => props.backgroundColor};
  padding: ${(props) => props.padding};
`;
const cardCss = css`
  border: 1px solid ${palatte.primary.basic};
  border-radius: 30px;
  display: flex;
  overflow: hidden;
  background-color: ${palatte.white};
  align-items: center;
  &:hover {
    cursor: pointer;
    box-shadow: ${styles.shadow};
  }
`;
const Card = styled.div`
  ${cardCss}
  position: relative;
  width: 100%;
  gap: ${(props) => props.gap};
  flex-basis: ${(props) => props.basis};
  flex-direction: ${(props) => props.column && 'column'};
  position: ${(props) => props.position};
  ${mediaQuery[0]} {
    flex-direction: column;
    border-radius: 10px;
  }
  ${(props) => props.addCss}
`;
const TimeTag = styled.div`
  font-weight: 700;
  color: ${palatte.white};
  font-size: 18px;
  background-color: ${palatte.info.basic};
  border-radius: 20px;
  padding: 5px 20px;
  z-index: 5;
`;
function ScheduleCard(props) {
  const transitIcon = {
    WALKING: {
      title: '走路',
      icon: 'directions_walk',
    },
    DRIVING: {
      title: '開車',
      icon: 'directions_car_filled',
    },
    TRANSIT: {
      title: '搭大眾運輸',
      icon: 'directions_bus',
    },
    BICYCLING: {
      title: '騎自行車',
      icon: 'directions_bike',
    },
  };
  const transitIconStyle = css`
    color: ${palatte.info.basic};
    font-size: 60px;
  `;
  const transitDetailWapper = css`
    align-items: center;
    gap: 5px;
  `;
  return (
    <CardWrapper column as={props.as} gap="20px">
      <FlexDiv
        gap="10px"
        addCss={css`
          position: absolute;
          top: -15px;
          left: 30px;
          ${mediaQuery[0]} {
            left: -10px;
          }
        `}>
        {props.isEdit && <CheckboxCustom />}
        <TimeTag>
          {timestampToString(props.schedule.start_time, 'time')}
        </TimeTag>
      </FlexDiv>
      <Card
        gap="40px"
        onClick={props.onClick}
        addCss={css`
          ${mediaQuery[0]} {
            gap: 0px;
          }
        `}>
        <Image
          src={props.schedule.placeDetail.photos[0]}
          alt={props.schedule.placeDetail.name}
          minWidth="330px"
          height="200px"
          addCss={css`
            ${mediaQuery[0]} {
              width: 100%;
            }
          `}
        />
        <FlexChildDiv
          shrink="1"
          direction="column"
          gap="15px"
          padding="5px 5px 5px 0"
          addCss={css`
            ${mediaQuery[0]} {
              width: 100%;
              padding: 20px;
              gap: 10px;
            }
          `}>
          <H5 margin="0 0 10px 0">{props.schedule.placeDetail.name}</H5>
          {props.address && (
            <FlexDiv gap="2px">
              <span
                className="material-icons"
                css={css`
                  color: ${palatte.danger.basic};
                `}>
                location_on
              </span>
              <P>{props.address}</P>
            </FlexDiv>
          )}
          {props.duration && (
            <FlexDiv gap="4px">
              <span
                className="material-icons"
                css={css`
                  color: ${palatte.gray['500']};
                  font-size: 22px;
                `}>
                schedule
              </span>
              <P color={palatte.gray['700']} fontSize="14px">
                停留 {Math.floor(props.duration / 60)} 小時
              </P>
            </FlexDiv>
          )}
        </FlexChildDiv>
      </Card>
      {props.children}
      {props.transit.detail && (
        <FlexDiv justifyContent="center" gap="30px">
          <FlexDiv addCss={transitDetailWapper}>
            <span className="material-icons" css={transitIconStyle}>
              {transitIcon[props.transit.travelMode].icon}
            </span>
            <P color={palatte.info.basic}>
              {transitIcon[props.transit.travelMode].title +
                props.transit.detail.duration.text}
            </P>
          </FlexDiv>
          <FlexDiv addCss={transitDetailWapper}>
            <span className="material-icons" css={transitIconStyle}>
              directions
            </span>
            <P color={palatte.info.basic}>
              距離{props.transit.detail.distance.text}
            </P>
          </FlexDiv>
        </FlexDiv>
      )}
    </CardWrapper>
  );
}

const OverviewCard = (props) => {
  const container = css`
    flex-basis: ${props.row ? '300px' : 'calc(50% - 60px)'};
    height: 300px;
    flex-direction: column;
    border-width: 2px;
    align-items: center;
    justify-content: center;
    margin: 0 0 4px 0;
  `;
  const text = css`
    z-index: 1;
    & > * {
      z-index: 1;
      color: ${palatte.white};
    }
    & span {
      font-size: 20px;
    }
  `;
  const image = css`
    position: absolute;
    top: 0;
  `;
  const darken = css`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    background-color: ${palatte.shadow};
    &:hover {
      background-color: ${palatte.darkerShadow};
    }
  `;
  return (
    <Card as={props.as} css={container} onClick={props.onClick}>
      <FlexDiv direction="column" gap="20px" alignItems="center">
        <H5
          fontSize="36px"
          color={palatte.white}
          addCss={css`
            z-index: 1;
          `}>
          {props.title}
        </H5>
        <FlexDiv addCss={text} gap="3px" alignItems="center">
          <span className="material-icons">schedule</span>
          <P>
            {timestampToString(props.startDate, 'date')} -{' '}
            {timestampToString(props.endDate, 'date')}
          </P>
        </FlexDiv>
      </FlexDiv>
      <Image
        src={props.src}
        alt={props.alt}
        width="100%"
        height="100%"
        addCss={image}
      />
      <div css={darken} />
    </Card>
  );
};

export { Card, cardCss, CardWrapper, TimeTag, ScheduleCard, OverviewCard };
