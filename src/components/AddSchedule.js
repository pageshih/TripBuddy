import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import { filterDaySchedules } from '../utils/utilities';
import { Pagination } from './styledComponents/Pagination';
import { styles, mediaQuery, Loader } from './styledComponents/basic/common';
import Overview from './EditItinerary/Overview';
import WaitingSpotArea from './EditItinerary/WaitingSpotArea';
import DepartController from './EditItinerary/DepartController';
import {
  useGetTransportDetail,
  useUpdateTimeOfSchedule,
  useUpdateOverviewsFields,
  useUpdateDate,
} from './EditItinerary/editScheduleHooks';
import ScheduleArea from './EditItinerary/ScheduleArea';

const Container = styled.div`
  min-height: 100vh;
  padding-bottom: 150px;
`;

const MainEditAreaContainer = styled.div`
  ${styles.flex}
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
  width: ${(props) => (props.isAllowEdit ? 'calc(100% - 340px)' : null)};
  ${mediaQuery[0]} {
    width: 100%;
    padding-bottom: ${(props) => (props.isAllowEdit ? '25vh' : null)};
  }
`;
const DepartAndPaginationWrapper = styled.div`
  ${styles.flex}
  ${styles.containerSetting}
    max-width: ${(props) => (props.isAllowEdit ? '1280px' : null)};
  width: 100%;
  justify-content: space-between;
  align-items: flex-end;
  margin: 0 auto;
`;
function AddSchedule({ isDefaultAllowEdit }) {
  const { uid, map, dispatchNotification } = useContext(Context);
  const { itineraryId } = useParams();
  const allSchedules = useRef();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(0);
  const [isAllowEdit, setIsAllowEdit] = useState(isDefaultAllowEdit);
  const updateScheduleState = (newSchedules) => {
    setSchedules(newSchedules);
    allSchedules.current[day] = newSchedules;
  };
  const getTransportDetail = useGetTransportDetail(updateScheduleState);
  const updateTimeOfSchedule = useUpdateTimeOfSchedule(updateScheduleState);
  const updateOverviewsFields = useUpdateOverviewsFields(
    overviews,
    setOverviews
  );
  const updateDate = useUpdateDate({
    overviews,
    allSchedules,
    setSchedules,
    day,
    setDay,
    updateOverviewsFields,
    updateTimeOfSchedule,
  });

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId, map, true)
        .then((res) => {
          if (res.overviews.depart_times) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            const defaultSchedules = filterDaySchedules(
              res.schedules,
              res.overviews.depart_times
            );
            setSchedules(defaultSchedules[day]);
            allSchedules.current = filterDaySchedules(
              res.schedules,
              res.overviews.depart_times
            );
          } else {
            navigate(`/error`);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [uid, itineraryId]);

  useEffect(() => {
    if (overviews) {
      const totalDuration = schedules.reduce((acc, schedule) => {
        acc += schedule.duration;
        return acc;
      }, 0);
      const departTime = new Date(overviews.depart_times[day]);
      const departTimeMinutes =
        Number(new Date(departTime).getHours()) * 60 +
        Number(new Date(departTime).getMinutes());
      if (totalDuration >= 1440 - departTimeMinutes) {
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'warn',
            message: '總行程時間已超過一天，請切換到隔天繼續規劃',
            id: 'toastify_durationExceed',
            duration: 5000,
          },
        });
      }
    }
  }, [schedules, overviews, day, dispatchNotification]);
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const addSchedule = (spotIndex, scheduleIndex) => {
    let startTime;
    let duration = 60;
    const newSpotsList = Array.from(waitingSpots);
    const newScheduleList = Array.from(schedules);
    const [remove] = newSpotsList.splice(spotIndex, 1);
    if (scheduleIndex > 0) {
      startTime = newScheduleList[scheduleIndex - 1].end_time;
    } else {
      startTime = overviews.depart_times[day];
    }

    const addData = {
      start_time: startTime,
      end_time: startTime + duration * 60 * 1000,
      place_id: remove.place_id,
      duration,
      placeDetail: remove,
      schedule_id: null,
      travel_mode: overviews.default_travel_mode,
    };
    firestore
      .addSchedule(uid, itineraryId, addData, true)
      .catch((error) => console.error(error));
    newScheduleList.splice(scheduleIndex, 0, addData);
    return {
      newSpotsList,
      newScheduleList,
    };
  };
  const backToWaiting = (scheduleIndex, spotIndex) => {
    const newSpotsList = Array.from(waitingSpots);
    const newScheduleList = Array.from(schedules);
    const [remove] = newScheduleList.splice(scheduleIndex, 1);
    const isRepeatSpot = newSpotsList.some(
      (spot) => spot.place_id === remove.place_id
    );
    if (!isRepeatSpot) {
      newSpotsList.splice(spotIndex, 0, remove.placeDetail);
    }
    allSchedules.current[day] = allSchedules.current[day].filter((schedule) => {
      return remove.schedule_id !== schedule.schedule_id;
    });
    firestore
      .setWaitingSpotsAndRemoveSchdule(
        uid,
        itineraryId,
        remove.schedule_id,
        !isRepeatSpot && remove.placeDetail
      )
      .catch((error) => console.error(error));
    return {
      newSpotsList: !isRepeatSpot && newSpotsList,
      newScheduleList,
    };
  };
  const updateTransitWayAndTime = async (newScheduleList) => {
    let updateTransportDetail;
    if (schedules?.length > 0) {
      updateTransportDetail = await getTransportDetail(
        newScheduleList,
        {}
      ).catch((error) => console.error(error));
    }
    const updatedTimeSchedules = updateTimeOfSchedule(
      updateTransportDetail || newScheduleList,
      overviews.depart_times[day],
      true
    );
    setSchedules(updatedTimeSchedules);
    allSchedules.current[day] = updatedTimeSchedules;
  };
  const onDragEnd = (result) => {
    const startAndEnd = {
      startId: result.source.droppableId,
      startIndex: result.source.index,
      endId: result.destination.droppableId,
      endIndex: result.destination.index,
    };
    if (!result.destination) {
      return;
    }
    if (
      startAndEnd.startId === 'waitingSpotsArea' &&
      startAndEnd.endId === 'scheduleArea'
    ) {
      const { newSpotsList, newScheduleList } = addSchedule(
        startAndEnd.startIndex,
        startAndEnd.endIndex
      );
      setWaitingSpots(newSpotsList);
      updateTransitWayAndTime(newScheduleList);
    } else if (startAndEnd.startId === startAndEnd.endId) {
      const list =
        startAndEnd.startId === 'scheduleArea' ? schedules : waitingSpots;
      const items = reorder(
        list,
        result.source.index,
        result.destination.index
      );
      if (startAndEnd.startId === 'scheduleArea') {
        const updatedTimeSchedules = updateTimeOfSchedule(
          items,
          overviews.depart_times[day]
        );
        getTransportDetail(updatedTimeSchedules, {
          isSetSchedule: true,
          isUploadFirebase: true,
        }).catch((error) => console.error(error));
      } else {
        setWaitingSpots(items);
      }
    } else if (
      startAndEnd.startId === 'scheduleArea' &&
      startAndEnd.endId === 'waitingSpotsArea'
    ) {
      const { newSpotsList, newScheduleList } = backToWaiting(
        startAndEnd.startIndex,
        startAndEnd.endIndex
      );
      updateTransitWayAndTime(newScheduleList);
      if (newSpotsList) {
        setWaitingSpots(newSpotsList);
      }
    }
  };

  const deleteSpot = (placeId) => {
    setWaitingSpots(waitingSpots.filter((spot) => spot.place_id !== placeId));
    firestore
      .deleteWaitingSpots(uid, itineraryId, placeId)
      .catch((error) => console.error(error));
  };
  const switchDay = (nextDay) => {
    setDay(nextDay);
    setSchedules(allSchedules.current[nextDay]);
    window.scrollTo(0, 0);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <Container>
            {isAllowEdit && (
              <WaitingSpotArea
                addSpotAction={() => navigate('/explore')}
                closeAction={() => setIsAllowEdit(false)}
                waitingSpots={waitingSpots}
                deleteSpot={deleteSpot}
              />
            )}
            <MainEditAreaContainer isAllowEdit={isAllowEdit}>
              <Overview
                isAllowEdit={isAllowEdit}
                setIsAllowEdit={setIsAllowEdit}
                overviews={overviews}
                setOverviews={setOverviews}
                updateOverviewsFields={updateOverviewsFields}
                updateDate={updateDate}
                day={day}
              />
              <DepartAndPaginationWrapper isAllowEdit={isAllowEdit}>
                <DepartController
                  departTimes={overviews.depart_times}
                  day={day}
                  isAllowEdit={isAllowEdit}
                  onSubmit={(newTime) => {
                    if (newTime !== overviews.depart_times[day]) {
                      updateTimeOfSchedule(schedules, newTime, true);
                      updateOverviewsFields({
                        depart_times: overviews.depart_times.map(
                          (time, index) => (index === day ? newTime : time)
                        ),
                      });
                    }
                  }}
                />
                <Pagination
                  day={day}
                  switchDay={switchDay}
                  finalDay={overviews?.depart_times?.length - 1}
                />
              </DepartAndPaginationWrapper>
              <ScheduleArea
                schedules={schedules}
                isAllowEdit={isAllowEdit}
                overviews={overviews}
                allSchedules={allSchedules}
                setSchedules={setSchedules}
                day={day}
              />
            </MainEditAreaContainer>
          </Container>
        </>
      )}
    </DragDropContext>
  );
}
AddSchedule.propTypes = {
  isDefaultAllowEdit: PropTypes.bool,
};
export default AddSchedule;
