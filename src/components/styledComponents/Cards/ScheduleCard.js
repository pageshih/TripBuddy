import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { styles, palatte, mediaQuery } from '../basic/common';
import TextWithIcon from '../basic/TextWithIcon';
import { P } from '../basic/Text';
import { RoundButtonSmall } from '../Buttons/RoundButton';
import { ButtonSmall } from '../Buttons/Button';
import { SpotCard } from './SpotCard';
import { TransitCard } from './TransitCard';

const DurationContainer = styled.div`
  ${styles.flex};
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
`;
const ControllerWrapper = styled.div`
  ${styles.flexColumn};
  align-items: center;
  ${mediaQuery[0]} {
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }
`;
const EditorWrapper = styled.div`
  ${styles.flex};
  align-items: center;
  gap: 8px;
`;
const EditorButton = ({ onClick, children }) => (
  <RoundButtonSmall
    type="button"
    size="20px"
    styled="transparent"
    css={css`
      padding: 5px 5px 7px 5px;
    `}
    onClick={onClick}>
    {children}
  </RoundButtonSmall>
);
const EditorDurationText = styled(P)`
  font-weight: 700;
  font-size: 32px;
  color: ${palatte.secondary[700]};
  text-align: center;
  width: 67px;
  ${mediaQuery[0]} {
    font-size: 28px;
  }
`;
const EditorUpdateTimeButton = styled(ButtonSmall)`
  font-size: 12px;
  margin: 10px 0 0 0;
`;
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
  <DurationContainer>
    {isEditStatus ? (
      <ControllerWrapper>
        <span>停留</span>
        <EditorWrapper>
          <EditorButton onClick={decreaseAction}>−</EditorButton>
          <EditorDurationText>
            {duration < 60 ? duration : duration / 60}
          </EditorDurationText>
          <EditorButton onClick={increaseAction}>+</EditorButton>
        </EditorWrapper>
        <span>{duration < 60 ? '分鐘' : '小時'}</span>
        {isUpdate && (
          <EditorUpdateTimeButton
            styled="gray"
            id="duration"
            type="button"
            onClick={updateAction}>
            更新時間
          </EditorUpdateTimeButton>
        )}
      </ControllerWrapper>
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
  </DurationContainer>
);

DurationController.propTypes = {
  duration: PropTypes.number,
  isEditStatus: PropTypes.bool,
  isUpdate: PropTypes.bool,
  isAllowEdit: PropTypes.bool,
  changeEditStatus: PropTypes.func,
  decreaseAction: PropTypes.func,
  increaseAction: PropTypes.func,
  updateAction: PropTypes.func,
};

const ScheduleContainer = styled.div`
  ${styles.flexColumn}
  gap: 20px;
  width: 100%;
`;
const DurationAndSpotCardWrapper = styled.div`
  ${styles.flex}
  width: 100%;
  gap: 20px;
  ${mediaQuery[0]} {
    flex-direction: column;
  }
`;
function ScheduleCard({
  isDragging,
  durationControllerConfig,
  as,
  schedule,
  isEdit,
  isShowCloseBtn,
  hideDuration,
  onClick,
  onDeleteClick,
  isSmall,
  selectedList,
  setSelectedList,
  children,
  changeTrasitWay,
}) {
  return (
    <ScheduleContainer>
      <DurationAndSpotCardWrapper>
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
          isShowCloseBtn={isShowCloseBtn}
          onDeleteClick={onDeleteClick}
          isSmall={isSmall || isDragging}
          addCss={css`
            width: ${isDragging ? '300px' : null};
          `}
          id={schedule.schedule_id}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
        />
      </DurationAndSpotCardWrapper>
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
    </ScheduleContainer>
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
  onDeleteClick: PropTypes.func,
  changeTrasitWay: PropTypes.func,
  as: PropTypes.string,
  children: PropTypes.element,
  isEdit: PropTypes.bool,
  isDragging: PropTypes.bool,
  isShowCloseBtn: PropTypes.bool,
  isSmall: PropTypes.bool,
  hideDuration: PropTypes.bool,
};

export default ScheduleCard;
