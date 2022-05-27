import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, mediaQuery, Rating } from './basic/common';
import { H5, H6, P } from './basic/Text';
import TextWithIcon from './basic/TextWithIcon';
import { timestampToString } from '../../utils/utilities';
import { FlexChildDiv, FlexDiv, Image } from './Layout';
import { CheckboxCustom, Select } from './Form';
import {
  RoundButtonSmall,
  ButtonSmallOutlineIcon,
  ButtonSmall,
} from './Button';

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
    iconName="location_on"
    addCss={{
      container: css`
        gap: ${props.withRating ? '4px' : '2px'};
        align-items: flex-start;
      `,
      text: css`
        font-size: ${!props.isSmall ? '17px' : '16px'};
      `,
      icon: css`
        color: ${palatte.danger.basic};
        font-size: ${props.isSmall ? '18px' : '22px'};
        margin: ${props.isSmall ? '3px 3px 3px 0' : '2px 0'};
        ${mediaQuery[0]} {
          font-size: 18px;
          margin: 3px 3px 3px 0;
        }
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
      size={props.isSmall ? '18' : props.size || '24'}
      rating={props.rating}
    />
  </FlexDiv>
);
const DurationText = (props) => (
  <TextWithIcon
    iconName="schedule"
    addCss={{
      container: css`
        gap: 4px;
        font-size: 14px;
        color: ${palatte.gray['700']};
      `,
      icon: css`
        font-size: 22px;
        color: ${palatte.gray['500']};
        margin: 1px 0;
      `,
    }}>
    停留 {Math.floor(props.duration / 6) / 10} 小時
  </TextWithIcon>
);
const CardWrapper = styled.div`
  display: flex;
  position: relative;
  gap: 20px;
  width: ${(props) => props.width || '100%'};
  ${mediaQuery[0]} {
    min-width: 90%;
    height: 100%;
  }
`;

const Card = styled.div`
  border: 1px solid ${palatte.primary.basic};
  border-radius: 30px;
  display: flex;
  overflow: hidden;
  background-color: ${palatte.white};
  align-items: center;
  position: relative;
  width: 100%;
  height: ${(props) => !props.isSmall && '200px'};
  gap: ${(props) => props.gap};
  flex-basis: ${(props) => props.basis};
  flex-direction: ${(props) =>
    props.isSmall || props.column ? 'column' : 'row'};
  position: ${(props) => props.position};
  border-radius: ${(props) => props.isSmall && '10px'};
  &:hover {
    cursor: pointer;
    box-shadow: ${styles.shadow};
  }
  ${mediaQuery[0]} {
    flex-direction: column;
    border-radius: 10px;
    height: fit-content;
  }
`;

function SpotCard(props) {
  const tagAndCheckboxContainer = css`
    gap: 10px;
    align-items: center;
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
  `;
  const closeButton = css`
    position: absolute;
    top: ${props.isSmall ? '-8px' : '10px'};
    right: ${props.isSmall ? '-10px' : '10px'};
    z-index: 1;
    background-color: ${palatte.white};
  `;
  const image = css`
    flex-basis: ${props.isSmall ? '200px' : '40%'};
    min-width: ${props.isSmall ? '100%' : '40%'};
    height: 100%;
    ${mediaQuery[0]} {
      width: 100%;
      min-width: ${props.isSmall ? '30%' : '100%'};
      max-height: ${props.isSmall ? '100%' : '200px'};
    }
  `;
  const textContainer = css`
    flex-shrink: 1;
    flex-direction: column;
    justify-content: center;
    gap: 15px;
    padding: 5px 5px 5px 0;
    width: ${props.isSmall ? '100%' : null};
    padding: ${props.isSmall ? '20px' : null};
    gap: ${props.isSmall ? '10px' : null};
    ${mediaQuery[0]} {
      width: 100%;
      padding: 15px;
      gap: 5px;
    }
  `;
  const title = css`
    font-size: ${props.isSmall ? '20px' : null};
    margin-bottom: ${props.isSmall ? '0' : '10px'};
    ${mediaQuery[0]} {
      font-size: ${props.isSmall ? '16px' : '20px'};
    }
  `;
  const card = css`
    gap: ${(props.isSmall ? '0px' : null) || props.cardGap};
    ${mediaQuery[0]} {
      gap: 0px;
      flex-direction: ${props.isSmall ? 'row' : null};
      align-items: stretch;
      height: 100%;
    }
  `;
  return (
    <CardWrapper as={props.as} width={props.width}>
      {props.isShowCloseBtn && (
        <RoundButtonSmall
          className="material-icons"
          close
          type="button"
          onClick={props.onCloseClick}
          css={closeButton}>
          cancel
        </RoundButtonSmall>
      )}
      <FlexDiv css={tagAndCheckboxContainer}>
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
        css={card}>
        <Image src={props.imgSrc} alt={props.imgAlt} addCss={image} />
        <FlexChildDiv css={textContainer}>
          <H6 css={title}>{props.title}</H6>
          <AddressText withRating={props.rating} isSmall={props.isSmall}>
            {props.address}
          </AddressText>
          {props.duration && <DurationText duration={props.duration} />}
          {props.rating && (
            <RatingText rating={props.rating} isSmall={props.isSmall} />
          )}
        </FlexChildDiv>
      </Card>
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
const TransitText = styled(P)`
  color: ${palatte.info.basic};
  white-space: nowrap;
  ${mediaQuery[0]} {
    color: ${palatte.gray[600]};
  }
`;
function TransitCard(props) {
  const transitContainer = css`
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    min-width: 80%;
    margin-left: auto;
    margin-right: 10px;
    ${mediaQuery[0]} {
      flex-wrap: wrap;
      width: 100%;
      gap: 10px;
      background-color: ${palatte.gray[200]};
      border-radius: 10px;
      padding: 15px 15px 15px 40px;
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
  const transitIconStyle = css`
    color: ${palatte.info.basic};
    font-size: 60px;
    ${mediaQuery[0]} {
      font-size: 24px;
      color: ${palatte.gray[500]};
    }
  `;
  const transitDetailWapper = css`
    gap: ${props.isEdit ? '10px' : '5px'};
    align-items: center;
    flex-wrap: wrap;
  `;
  return (
    <FlexDiv addCss={transitContainer}>
      <FlexDiv
        addCss={css`
          gap: 30px;
          width: 100%;
          justify-content: center;
          ${mediaQuery[0]} {
            width: fit-content;
            flex-direction: column;
            gap: 10px;
          }
        `}>
        <FlexDiv addCss={transitDetailWapper}>
          {props.isEdit ? (
            <>
              <FlexDiv
                addCss={css`
                  align-items: center;
                  gap: 10px;
                `}>
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
              </FlexDiv>
              <P
                addCss={css`
                  color: ${palatte.info.basic};
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
const DurationController = ({
  isEditStatus,
  changeEditStatus,
  isAllowEdit,
  decreaseAction,
  increaseAction,
  duration,
  isUpdate,
  updateAction,
}) => (
  <FlexChildDiv
    css={css`
      padding: 40px 0 0 0;
      flex-basis: 120px;
      align-items: flex-start;
      ${mediaQuery[0]} {
        order: 1;
        padding: 0;
        justify-content: center;
        align-items: center;
        border: 1px solid ${palatte.primary.basic};
        padding: 20px 10px;
        border-radius: 10px;
      }
    `}>
    {isEditStatus ? (
      <FlexDiv
        css={css`
          flex-direction: column;
          align-items: center;
          ${mediaQuery[0]} {
            flex-wrap: wrap;
            justify-content: center;
            gap: 2px;
          }
        `}>
        <span>停留</span>
        <FlexDiv
          css={css`
            align-items: center;
            gap: 8px;
          `}>
          <RoundButtonSmall
            type="button"
            size="20px"
            styled="transparent"
            css={css`
              padding: 5px 5px 7px 5px;
            `}
            onClick={decreaseAction}>
            −
          </RoundButtonSmall>
          <P
            css={css`
              font-weight: 700;
              font-size: 32px;
              color: ${palatte.secondary[700]};
              text-align: center;
              width: 67px;
              ${mediaQuery[0]} {
                font-size: 28px;
              }
            `}>
            {duration < 60 ? duration : duration / 60}
          </P>
          <RoundButtonSmall
            size="20px"
            styled="transparent"
            css={css`
              padding: 5px 5px 7px 5px;
            `}
            type="button"
            onClick={increaseAction}>
            +
          </RoundButtonSmall>
        </FlexDiv>
        <span>{duration < 60 ? '分鐘' : '小時'}</span>
        {isUpdate && (
          <ButtonSmall
            styled="gray"
            fontSize="12px"
            margin="10px 0 0 0 "
            id="duration"
            type="button"
            onClick={updateAction}>
            更新時間
          </ButtonSmall>
        )}
      </FlexDiv>
    ) : (
      <TextWithIcon
        iconName="watch_later"
        addCss={{
          container: css`
            color: ${palatte.primary.basic};
            flex-grow: 1;
            margin: 15px 0 0 0;
            padding: 10px 0px;
            gap: 2px;
            flex-direction: column;
            align-items: center;
            ${isAllowEdit &&
            `&:hover {
                background-color: ${palatte.lighterShadow};
                border-radius: 10px;
                cursor: pointer;
              }`}
            ${mediaQuery[0]} {
              padding: 0;
              margin: 0;
            }
          `,
          icon: css`
            font-size: 40px;
          `,
        }}
        onClick={changeEditStatus}>
        {'停留' +
          ' ' +
          (duration < 60 ? duration : duration / 60) +
          ' ' +
          (duration < 60 ? '分鐘' : '小時')}
      </TextWithIcon>
    )}
  </FlexChildDiv>
);
function ScheduleCard({
  isDragging,
  durationControllerConfig,
  as,
  schedule,
  isEdit,
  isShowCloseBtn,
  hideDuration,
  onClick,
  onCloseClick,
  isSmall,
  selectedList,
  setSelectedList,
  children,
  changeTrasitWay,
}) {
  return (
    <FlexDiv
      addCss={css`
        flex-direction: column;
        gap: 20px;
        width: 100%;
      `}>
      <FlexDiv
        addCss={css`
          width: 100%;
          gap: 20px;
          ${mediaQuery[0]} {
            flex-direction: column;
          }
        `}>
        {!isDragging && durationControllerConfig && (
          <DurationController
            isEditStatus={durationControllerConfig.isEditStatus}
            isAllowEdit={isEdit}
            duration={durationControllerConfig.duration}
            isUpdate={durationControllerConfig.isUpdate}
            changeEditStatus={durationControllerConfig.changeEditStatus}
            decreaseAction={durationControllerConfig.decreaseAction}
            increaseAction={durationControllerConfig.increaseAction}
            updateAction={durationControllerConfig.updateAction}
          />
        )}
        <SpotCard
          as={as}
          time={schedule.start_time}
          onClick={onClick}
          imgSrc={schedule.placeDetail.photos[0]}
          imgAlt={schedule.placeDetail.name}
          title={schedule.placeDetail.name}
          address={schedule.placeDetail.formatted_address}
          duration={hideDuration ? null : schedule.duration}
          isEdit={isEdit}
          cardGap={isEdit && '20px'}
          isShowCloseBtn={isShowCloseBtn}
          onCloseClick={onCloseClick}
          isSmall={isSmall || isDragging}
          width={isDragging && '300px'}
          id={schedule.schedule_id}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
        />
      </FlexDiv>
      {children}
      {!isDragging && schedule.transit_detail && schedule.travel_mode && (
        <TransitCard
          transitDetail={schedule.transit_detail}
          travelMode={schedule.travel_mode}
          changeTrasitWay={changeTrasitWay}
          scheduleId={schedule.schedule_id}
          isEdit={isEdit}
        />
      )}
    </FlexDiv>
  );
}

ScheduleCard.propTypes = {
  schedule: PropTypes.shape({
    duration: PropTypes.number,
    start_time: PropTypes.number,
    end_time: PropTypes.number,
    placeDetail: PropTypes.object,
    place_id: PropTypes.string,
    schedule_id: PropTypes.string,
    transit_detail: PropTypes.object,
    travel_mode: PropTypes.string,
  }).isRequired,
  durationControllerConfig: PropTypes.shape({
    duration: PropTypes.number,
    isEditStatus: PropTypes.bool,
    isUpdate: PropTypes.bool,
    changeEditStatus: PropTypes.func,
    decreaseAction: PropTypes.func,
    increaseAction: PropTypes.func,
    updateAction: PropTypes.func,
  }),
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  onClick: PropTypes.func,
  onCloseClick: PropTypes.func,
  changeTrasitWay: PropTypes.func,
  as: PropTypes.string,
  children: PropTypes.element,
  isEdit: PropTypes.bool,
  isDragging: PropTypes.bool,
  isShowCloseBtn: PropTypes.bool,
  isSmall: PropTypes.bool,
  hideDuration: PropTypes.bool,
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
  TimeTag,
  ScheduleCard,
  OverviewCard,
  SpotCard,
  RatingText,
  AddressText,
  DurationText,
  transportMode,
};
