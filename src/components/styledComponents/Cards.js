import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import {
  styles,
  palatte,
  H4,
  H5,
  P,
  mediaQuery,
  Rating,
  TextWithIcon,
} from './basicStyle';
import { timestampToString } from '../../utils/utilities';
import { FlexChildDiv, FlexDiv, Image } from './Layout';
import { CheckboxCustom, Select } from './Form';
import { RoundButtonSmall, ButtonSmallOutlineIcon } from './Button';
import { EditableText } from './EditableText';

const CardWrapper = styled.div`
  display: flex;
  position: relative;
  width: ${(props) => props.width || '100%'};
  gap: ${(props) => props.gap};
  flex-direction: ${(props) => props.column && 'column'};
  flex-grow: ${(props) => props.grow};
  max-width: ${(props) => props.maxWidth};
  background-color: ${(props) => props.backgroundColor};
  padding: ${(props) => props.padding};
  ${(props) => props.addCss};
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
  height: ${(props) => !props.isSmall && '200px'};
  gap: ${(props) => props.gap};
  flex-basis: ${(props) => props.basis};
  flex-direction: ${(props) =>
    props.isSmall || props.column ? 'column' : 'row'};
  position: ${(props) => props.position};
  border-radius: ${(props) => props.isSmall && '10px'};
  ${mediaQuery[0]} {
    flex-direction: column;
    border-radius: 10px;
    height: fit-content;
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

const AddressText = (props) => (
  <TextWithIcon
    isSmall={props.isSmall}
    gap={props.withRating ? '4px' : '2px'}
    iconName="location_on"
    iconColor={palatte.danger.basic}
    alignItems="flex-start"
    textSize={!props.isSmall ? '17px' : '16px'}
    iconSize={props.isSmall ? '20px' : '22px'}
    mutipleLines
    iconOffset="20px"
    addCss={{
      icon: `
        margin: ${props.isSmall ? '3px 3px 3px 0' : '2px 0'};
      `,
    }}>
    {props.children}
  </TextWithIcon>
);
const RatingText = (props) => (
  <FlexDiv gap="6px" alignItems="center">
    {!props.isNoText && (
      <P
        addCss={css`
          margin-bottom: 2px;
          line-height: 1;
        `}>
        {props.rating}
      </P>
    )}
    <Rating
      size={props.isSmall ? '20' : props.size || '24'}
      rating={props.rating}
    />
  </FlexDiv>
);
const DurationText = (props) => (
  <TextWithIcon
    gap="4px"
    iconColor={palatte.gray['500']}
    iconSize="22px"
    iconName="schedule"
    textColor={palatte.gray['700']}
    textSize="14px"
    addCss={{
      icon: `margin: 1px 0;`,
    }}>
    停留 {Math.floor(props.duration / 6) / 10} 小時
  </TextWithIcon>
);
function SpotCard(props) {
  return (
    <CardWrapper
      column
      as={props.as}
      gap="20px"
      width={props.width}
      addCss={props.addCss}>
      {props.isShowCloseBtn && (
        <RoundButtonSmall
          className="material-icons"
          close
          type="button"
          onClick={props.onCloseClick}
          addCss={css`
            position: absolute;
            top: ${props.isSmall ? '-8px' : '10px'};
            right: ${props.isSmall ? '-10px' : '10px'};
            z-index: 1;
            background-color: ${palatte.white};
          `}>
          cancel
        </RoundButtonSmall>
      )}
      <FlexDiv
        gap="10px"
        alignItems="center"
        addCss={css`
          position: absolute;
          top: ${props.time ? '-15px' : props.isEdit ? '20px' : null};
          left: ${props.isSmall
            ? props.time
              ? '-10px'
              : props.isEdit
              ? '20px'
              : null
            : props.time
            ? '30px'
            : props.isEdit
            ? '20px'
            : null};
          z-index: 1;
          ${mediaQuery[0]} {
            left: ${props.time ? '-10px' : props.isEdit ? '20px' : null};
          }
        `}>
        {props.isEdit && (
          <CheckboxCustom
            id={props.id}
            selectedList={props.selectedList}
            setSelectedList={props.setSelectedList}
            addCss={css`
              box-shadow: ${!props.time && props.isEdit
                ? `0 0 0 1px ${palatte.gray['300']}`
                : null};
            `}
          />
        )}
        {props.time && (
          <TimeTag>{timestampToString(props.time, 'time')}</TimeTag>
        )}
      </FlexDiv>
      <Card
        isSmall={props.isSmall}
        gap="40px"
        onClick={props.onClick}
        addCss={css`
          gap: ${(props.isSmall && '0px') || props.cardGap};
          ${mediaQuery[0]} {
            gap: 0px;
          }
        `}>
        <Image
          src={props.imgSrc}
          alt={props.imgAlt}
          height="100%"
          addCss={css`
            flex-basis: ${props.isSmall ? '200px' : '330px'};
            min-width: ${props.isSmall ? '100%' : '330px'};
            ${mediaQuery[0]} {
              width: 100%;
              min-width: 100%;
              max-height: 200px;
            }
          `}
        />
        <FlexChildDiv
          shrink="1"
          direction="column"
          gap="15px"
          padding="5px 5px 5px 0"
          addCss={css`
            width: ${props.isSmall ? '100%' : null};
            padding: ${props.isSmall ? '20px' : null};
            gap: ${props.isSmall ? '10px' : null};
            ${mediaQuery[0]} {
              width: 100%;
              padding: 20px;
              gap: 10px;
            }
          `}>
          <H5
            margin="0 0 10px 0"
            css={css`
              font-size: ${props.isSmall && '20px'};
              margin-bottom: ${props.isSmall && '0'};
            `}>
            {props.title}
          </H5>
          <AddressText withRating={props.rating} isSmall={props.isSmall}>
            {props.address}
          </AddressText>
          {props.duration && <DurationText duration={props.duration} />}
          {props.rating && (
            <RatingText rating={props.rating} isSmall={props.isSmall} />
          )}
        </FlexChildDiv>
      </Card>
      {props.children}
    </CardWrapper>
  );
}
SpotCard.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  imgAlt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  as: PropTypes.string,
  onClick: PropTypes.func,
  time: PropTypes.number,
  duration: PropTypes.number,
  isEdit: PropTypes.bool,
  isSmall: PropTypes.bool,
  isShowCloseBtn: PropTypes.bool,
  rating: PropTypes.number,
  id: PropTypes.string,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  onCloseClick: PropTypes.func,
};

const transportMode = (schedule) => {
  const departureTime =
    schedule?.end_time < new Date().getTime()
      ? new Date()
      : new Date(schedule?.end_time);
  return {
    BICYCLING: {
      title: '騎自行車',
      icon: 'directions_bike',
      config: {
        travelMode: 'BICYCLING',
      },
    },
    DRIVING: {
      title: '開車',
      icon: 'directions_car_filled',
      config: {
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    TRANSIT: {
      title: '搭乘大眾運輸',
      icon: 'directions_bus',
      config: {
        travelMode: 'TRANSIT',
        transitOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    WALKING: {
      title: '走路',
      icon: 'directions_walk',
      config: {
        travelMode: 'WALKING',
      },
    },
  };
};
const transitIconStyle = css`
  color: ${palatte.info.basic};
  font-size: 60px;
  ${mediaQuery[0]} {
    font-size: 24px;
    color: ${palatte.gray[500]};
  }
`;
const TransitText = styled(P)`
  color: ${palatte.info.basic};
  white-space: nowrap;
  ${mediaQuery[0]} {
    color: ${palatte.gray[600]};
  }
`;
const transitDetailWapper = css`
  align-items: center;
  gap: 5px;
`;
const transitContainer = css`
  ${mediaQuery[0]} {
    background-color: ${palatte.gray[200]};
    border-radius: 10px;
    padding: 15px 20px 15px 40px;
    position: relative;
    margin: 10px 0;
    &::before {
      content: '';
      height: 120%;
      position: absolute;
      top: -10%;
      left: 15px;
      border-left: 3px dashed ${palatte.info.basic};
    }
    &::after {
      content: '';
      position: absolute;
      left: 10px;
      bottom: calc(-10% - 3px);
      width: 10px;
      height: 10px;
      border-left: 3px solid ${palatte.info.basic};
      border-bottom: 3px solid ${palatte.info.basic};
      transform: rotate(-45deg);
    }
  }
`;

function TransitCard(props) {
  return (
    <FlexDiv
      justifyContent="space-between"
      alignItems="center"
      gap="30px"
      padding={!props.isEdit && '0 20px 0 15%'}
      addCss={transitContainer}>
      <FlexDiv
        gap="30px"
        width="100%"
        justifyContent="center"
        addCss={css`
          ${mediaQuery[0]} {
            flex-direction: column;
            gap: 10px;
          }
        `}>
        <FlexDiv
          addCss={css`
            ${transitDetailWapper}
            gap:${props.isEdit && '10px'}
          `}>
          {props.isEdit ? (
            <>
              <span className="material-icons" css={transitIconStyle}>
                {transportMode()[props.travelMode].icon}
              </span>
              <Select
                addCss={css`
                  ${mediaQuery[0]} {
                    width: 100px;
                  }
                `}
                value={props.travelMode}
                onChange={(e) =>
                  props.changeTrasitWay(props.scheduleId, e.target.value)
                }>
                {Object.keys(transportMode()).map((mode) => (
                  <option key={mode} value={mode}>
                    {transportMode()[mode].title}
                  </option>
                ))}
              </Select>
              <P
                color={palatte.info.basic}
                addCss={css`
                  white-space: nowrap;
                  ${mediaQuery[0]} {
                    color: ${palatte.gray[500]};
                  }
                `}>
                {props.transitDetail.duration.text}
              </P>
            </>
          ) : (
            <>
              <span className="material-icons" css={transitIconStyle}>
                {transportMode()[props.travelMode].icon}
              </span>
              <TransitText>
                {transportMode()[props.travelMode].title +
                  props.transitDetail.duration.text}
              </TransitText>
            </>
          )}
        </FlexDiv>
        <FlexDiv addCss={transitDetailWapper}>
          <span className="material-icons" css={transitIconStyle}>
            directions
          </span>
          <TransitText>距離{props.transitDetail.distance.text}</TransitText>
        </FlexDiv>
      </FlexDiv>
      {!props.isEdit && (
        <ButtonSmallOutlineIcon
          styled="info"
          onClick={() =>
            window.open(props.transitDetail.direction_url, '_blank')
          }
          addCss={css`
            width: fit-content;
          `}>
          <span
            className="material-icons"
            css={css`
              color: inherit;
              font-size: 20px;
            `}>
            explore
          </span>
          開始導航
        </ButtonSmallOutlineIcon>
      )}
    </FlexDiv>
  );
}
function ScheduleCard(props) {
  return (
    <SpotCard
      as={props.as}
      time={props.schedule.start_time}
      onClick={props.onClick}
      imgSrc={props.schedule.placeDetail.photos[0]}
      imgAlt={props.schedule.placeDetail.name}
      title={props.schedule.placeDetail.name}
      address={props.schedule.placeDetail.formatted_address}
      duration={props.duration}
      isEdit={props.isEdit}
      cardGap={props.isEdit && '30px'}
      isShowCloseBtn={props.isShowCloseBtn}
      onCloseClick={props.onCloseClick}
      isSmall={props.isSmall}
      id={props.schedule.schedule_id}
      selectedList={props.selectedList}
      setSelectedList={props.setSelectedList}>
      {props.children}
      {props.transitDetail && props.travelMode && (
        <TransitCard
          transitDetail={props.transitDetail}
          travelMode={props.travelMode}
          changeTrasitWay={props.changeTrasitWay}
          scheduleId={props.schedule.schedule_id}
          isEdit={props.isEdit}
        />
      )}
    </SpotCard>
  );
}
/* <FlexDiv justifyContent="center" gap="30px">
  <FlexDiv addCss={transitDetailWapper}>
    <span className="material-icons" css={transitIconStyle}>
      {transportMode()[props.travelMode].icon}
    </span>
    <P color={palatte.info.basic}>
      {transportMode()[props.travelMode].title +
        props.transitDetail.duration.text}
    </P>
  </FlexDiv>
  <FlexDiv addCss={transitDetailWapper}>
    <span className="material-icons" css={transitIconStyle}>
      directions
    </span>
    <P color={palatte.info.basic}>
      距離{props.transitDetail.distance.text}
    </P>
  </FlexDiv>
</FlexDiv> */
ScheduleCard.propTypes = {
  schedule: PropTypes.object.isRequired,
  imgSrc: PropTypes.string.isRequired,
  imgAlt: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  as: PropTypes.string,
  isEdit: PropTypes.bool,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  onClick: PropTypes.func,
  time: PropTypes.number,
  duration: PropTypes.number,
  transit: PropTypes.object,
  children: PropTypes.element,
};

function OverviewCard(props) {
  const container = css`
    flex-basis: ${props.basis || (props.row ? '300px' : 'calc(50% - 60px)')};
    height: 300px;
    min-height: 300px;
    flex-direction: column;
    border-width: 2px;
    align-items: center;
    justify-content: center;
    margin: ${props.margin || '0 0 4px 0'};
    & > .darken {
      background-color: ${palatte.shadow};
    }
    &:hover {
      & > .darken {
        background-color: ${palatte.darkerShadow};
      }
    }
    ${mediaQuery[0]} {
      flex-basis: 100%;
      margin: auto;
    }
    ${props.addCss}
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
      <div className="darken" css={darken} />
    </Card>
  );
}
OverviewCard.propTypes = {
  as: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
  startDate: PropTypes.number,
  endDate: PropTypes.number,
  src: PropTypes.string,
  alt: PropTypes.string,
};

export {
  Card,
  cardCss,
  CardWrapper,
  TimeTag,
  ScheduleCard,
  OverviewCard,
  SpotCard,
  RatingText,
  AddressText,
  DurationText,
  TextWithIcon,
  transportMode,
};
