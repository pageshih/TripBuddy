import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { Context } from '../../App';
import { firestore } from '../../utils/firebase';
import { mediaQuery, palatte, styles } from '../styledComponents/basic/common';
import { ScheduleCard } from '../styledComponents/Cards';
import { P } from '../styledComponents/basic/Text';
import MoveScheduleController from '../EditItinerary/MoveScheduleController';
import {
  useGetTransportDetail,
  useUpdateTimeOfSchedule,
} from './editScheduleHooks';
const ScheduleWapper = styled.li`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  ${mediaQuery[0]} {
    padding: 10px;
  }
`;

const ScheduleCardDrag = ({
  isAllowEdit,
  schedule,
  index,
  selectedList,
  setSelectedList,
  onClick,
  onCloseClick,
  changeTrasitWay,
  updateDuration,
}) => {
  const [isEditDuration, setIsEditDuration] = useState(isAllowEdit);
  const [duration, setDuration] = useState(schedule.duration);
  useEffect(() => {
    if (isAllowEdit) {
      setIsEditDuration(isAllowEdit);
    }
  }, [isAllowEdit]);
  return (
    <Draggable
      draggableId={schedule.schedule_id}
      index={index}
      isDragDisabled={!isAllowEdit}>
      {(provided, snapshot) => (
        <ScheduleWapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <ScheduleCard
            schedule={schedule}
            durationControllerConfig={{
              duration: duration,
              isEditStatus: isEditDuration && isAllowEdit,
              isUpdate: duration !== schedule.duration,
              changeEditStatus: (e) => {
                if (e.target.id !== 'duration') {
                  setIsEditDuration(true);
                }
              },
              decreaseAction: () => {
                setDuration((prevValue) =>
                  prevValue > 30 ? prevValue - 30 : 30
                );
              },
              increaseAction: () => {
                setDuration((prevValue) =>
                  prevValue < 1440 ? prevValue + 30 : 1440
                );
              },
              updateAction: (e) => {
                if (e.target.id === 'duration') {
                  setIsEditDuration(false);
                  updateDuration(schedule.schedule_id, duration);
                }
              },
            }}
            isEdit={isAllowEdit}
            selectedList={selectedList}
            setSelectedList={setSelectedList}
            isShowCloseBtn={isAllowEdit}
            onClick={onClick}
            onCloseClick={onCloseClick}
            changeTrasitWay={changeTrasitWay}
            isDragging={snapshot.isDragging}
          />
        </ScheduleWapper>
      )}
    </Draggable>
  );
};

ScheduleCardDrag.propsTypes = {
  isAllowEdit: PropTypes.bool,
  schedule: PropTypes.shape({
    duration: PropTypes.number,
    start_time: PropTypes.number,
    end_time: PropTypes.number,
    placeDetail: PropTypes.object,
    place_id: PropTypes.string,
    schedule_id: PropTypes.string,
    transit_detail: PropTypes.object,
    travel_mode: PropTypes.string,
  }),
  index: PropTypes.number,
  selectedList: PropTypes.array,
  setSelectedList: PropTypes.func,
  onClick: PropTypes.func,
  onCloseClick: PropTypes.func,
  changeTrasitWay: PropTypes.func,
  updateDuration: PropTypes.func,
};

const Container = styled.div`
  ${styles.containerSetting}
  max-width: ${(props) => props.isAllowEdit && '1280px'};
  width: 100%;
`;
const ScheduleAreaBackground = styled.div`
  ${styles.flex}
  flex-direction: column;
  background-color: ${(props) =>
    props.isDraggingOver ? palatte.gray[300] : palatte.gray[100]};
  min-height: 40vh;
  padding: 20px;
  border-radius: 10px;
  ${mediaQuery[0]} {
    gap: 20px;
  }
`;
function ScheduleArea({
  schedules,
  isAllowEdit,
  overviews,
  allSchedules,
  setSchedules,
  day,
}) {
  const { uid, dispatchNotification } = useContext(Context);
  const { itineraryId } = useParams();
  const [selectedSchedulesId, setSelectedSchedulesId] = useState([]);
  const updateScheduleState = (newSchedules) => {
    setSchedules(newSchedules);
    allSchedules.current[day] = newSchedules;
  };
  const getTransportDetail = useGetTransportDetail(updateScheduleState);
  const updateTimeOfSchedule = useUpdateTimeOfSchedule(updateScheduleState);

  const deleteSchedule = (scheduleId) => {
    getTransportDetail(
      schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
      true
    );
    firestore
      .deleteSchedule(uid, itineraryId, scheduleId)
      .catch((error) => console.error(error));
  };
  const changeSchedulesTime = async (changeTime) => {
    if (!changeTime) {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: '請選擇要修改的行程日期',
          id: 'tooltip_changeDay',
        },
      });
      return;
    } else if (selectedSchedulesId?.length === 0) {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: '還沒有選取行程喔！',
          id: 'tooltip_changeDay',
        },
      });
      return;
    }
    const targetDay = overviews.depart_times.reduce((acc, timestamp, index) => {
      if (timestamp === changeTime) {
        acc = index;
      }
      return acc;
    }, -1);
    if (targetDay > -1) {
      const checkedSchedules = schedules.filter(
        (schedule) =>
          selectedSchedulesId.some((id) => id === schedule.schedule_id) &&
          schedule
      );
      let newTargetDaySchedules = [
        ...allSchedules.current[targetDay],
        ...checkedSchedules,
      ];
      newTargetDaySchedules = updateTimeOfSchedule(
        newTargetDaySchedules,
        overviews.depart_times[targetDay]
      );
      newTargetDaySchedules = await getTransportDetail(newTargetDaySchedules);
      const removedDaySchedules = schedules.filter(
        (schedule) =>
          selectedSchedulesId.every((id) => id !== schedule.schedule_id) &&
          schedule
      );
      const newCurrentDaySchedule = await getTransportDetail(
        removedDaySchedules
      );
      allSchedules.current[day] = newCurrentDaySchedule;
      setSchedules(newCurrentDaySchedule);
      allSchedules.current[targetDay] = newTargetDaySchedules;
      setSelectedSchedulesId([]);
    }
  };
  const updateDuration = (scheduleId, newDuration) => {
    const newSchedules = Array.from(schedules);
    newSchedules.forEach((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        schedule.duration = newDuration;
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      }
    });
    updateTimeOfSchedule(newSchedules, overviews.depart_times[day], true);
  };
  const changeTrasitWay = (scheduleId, mode) => {
    const newScheduleList = schedules.map((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        return { ...schedule, travel_mode: mode };
      } else {
        return schedule;
      }
    });
    getTransportDetail(newScheduleList, true, scheduleId, mode);
  };

  return (
    <Droppable droppableId="scheduleArea" isDropDisabled={!isAllowEdit}>
      {(provided, snapshot) => (
        <Container
          isAllowEdit={isAllowEdit}
          ref={provided.innerRef}
          {...provided.droppableProps}>
          <ScheduleAreaBackground isDraggingOver={snapshot.isDraggingOver}>
            {isAllowEdit && (
              <div
                css={css`
                  margin-bottom: 20px;
                `}>
                <MoveScheduleController
                  day={day}
                  departTimes={overviews.depart_times}
                  schedules={schedules}
                  selectedSchedulesId={selectedSchedulesId}
                  setSelectedSchedulesId={setSelectedSchedulesId}
                  changeSchedulesTime={changeSchedulesTime}
                />
              </div>
            )}
            {schedules?.length > 0 ? (
              schedules.map((schedule, index) => (
                <ScheduleCardDrag
                  isAllowEdit={isAllowEdit}
                  key={schedule.schedule_id}
                  index={index}
                  changeTrasitWay={changeTrasitWay}
                  schedule={schedule}
                  updateDuration={updateDuration}
                  selectedList={selectedSchedulesId}
                  setSelectedList={setSelectedSchedulesId}
                  onClick={() =>
                    window.open(schedule.placeDetail.url, '_blank')
                  }
                  onCloseClick={() =>
                    deleteSchedule(schedule.schedule_id)
                  }></ScheduleCardDrag>
              ))
            ) : (
              <P color={palatte.gray[800]}>
                {!isAllowEdit ? '點擊編輯新增行程' : '拖拉卡片以新增行程'}
              </P>
            )}
            {provided.placeholder}
          </ScheduleAreaBackground>
        </Container>
      )}
    </Droppable>
  );
}

ScheduleArea.propsTypes = {
  overviews: PropTypes.shape({
    cover_photo: PropTypes.string,
    depart_times: PropTypes.array,
    end_date: PropTypes.number,
    start_date: PropTypes.number,
    itinerary_id: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      duration: PropTypes.number,
      start_time: PropTypes.number,
      end_time: PropTypes.number,
      placeDetail: PropTypes.object,
      place_id: PropTypes.string,
      schedule_id: PropTypes.string,
      transit_detail: PropTypes.object,
      travel_mode: PropTypes.string,
    })
  ),
  isAllowEdit: PropTypes.bool,
  allSchedules: PropTypes.object,
  setSchedules: PropTypes.func,
  day: PropTypes.number,
};

export default ScheduleArea;
