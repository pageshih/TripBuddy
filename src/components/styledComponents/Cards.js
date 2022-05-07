import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, H4, H5, P, mediaQuery, Rating } from './basicStyle';
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
  flex-direction: ${(props) =>
    props.isSmall || props.column ? 'column' : 'row'};
  position: ${(props) => props.position};
  border-radius: ${(props) => props.isSmall && '10px'};
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
const TextWithIcon = (props) => (
  <FlexDiv
    gap={props.gap}
    alignItems={
      !props.isSmall && typeof props.children === 'string'
        ? 'center'
        : 'flex-start'
    }>
    <FlexDiv alignItems={'center'} gap={props.iconGap || props.gap}>
      {props.iconLabel && (
        <P
          fontSize={props.labelSize || props.textSize}
          color={props.labelColor || props.iconColor}>
          {props.iconLabel}
        </P>
      )}
      <span
        className="material-icons"
        css={css`
          color: ${props.iconColor};
          font-size: ${props.iconSize};
          ${props.addCss?.icon};
        `}>
        {props.iconName}
      </span>
    </FlexDiv>
    {typeof props.children === 'string' ? (
      <P
        fontSize={props.textSize}
        color={props.textColor}
        addCss={props.addCss?.text}>
        {props.children}
      </P>
    ) : (
      props.children
    )}
  </FlexDiv>
);
const AddressText = (props) => (
  <TextWithIcon
    isSmall={props.isSmall}
    gap={props.withRating ? '4px' : '2px'}
    iconName="location_on"
    iconColor={palatte.danger.basic}
    iconSize={props.isSmall ? '20px' : '24px'}
    addCss={{
      icon: css`
        margin: ${props.isSmall ? '3px 3px 3px 0' : '0'};
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
function SpotCard(props) {
  return (
    <CardWrapper column as={props.as} gap="20px">
      <FlexDiv
        gap="10px"
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
              outline: ${!props.time && props.isEdit
                ? `1px solid ${palatte.gray['300']}`
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
          gap: ${props.isSmall ? '0px' : null};
          ${mediaQuery[0]} {
            gap: 0px;
          }
        `}>
        <Image
          src={props.imgSrc}
          alt={props.imgAlt}
          height="200px"
          addCss={css`
            flex-basis: ${props.isSmall ? '200px' : '330px'};
            width: ${props.isSmall ? '100%' : null};
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
          {props.duration && (
            <TextWithIcon
              gap="4px"
              iconColor={palatte.gray['500']}
              iconSize="22px"
              iconName="schedule"
              textColor={palatte.gray['700']}
              textSize="14px">
              停留 {Math.floor(props.duration / 60)} 小時
            </TextWithIcon>
          )}
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
  id: PropTypes.string,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
};
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
      id={props.schedule.schedule_id}
      selectedList={props.selectedSpotList}
      setSelectedList={props.setSelectedSpotList}>
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
    </SpotCard>
  );
}
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
    flex-basis: ${props.row ? '300px' : 'calc(50% - 60px)'};
    height: 300px;
    flex-direction: column;
    border-width: 2px;
    align-items: center;
    justify-content: center;
    margin: 0 0 4px 0;
    & > .darken {
      background-color: ${palatte.shadow};
    }
    &:hover {
      & > .darken {
        background-color: ${palatte.darkerShadow};
      }
    }
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
  TextWithIcon,
};
