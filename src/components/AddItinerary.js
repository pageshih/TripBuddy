import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import { Container, FlexDiv, FlexChildDiv } from './styledComponents/Layout';
import { ScheduleCard, transportMode } from './styledComponents/Cards';
import { filterDaySchedules, createDepartTimeAry } from '../utils/utilities';
import { googleMap } from '../utils/googleMap';
import { Pagination } from './Pagination';
import { palatte, styles, mediaQuery } from './styledComponents/basic/common';
import { P } from './styledComponents/basic/Text';
import {
  Overview,
  DepartController,
  MoveScheduleController,
} from './EditItinerary';
import WaitingSpotArea from './EditItinerary/WaitingSpotArea';

const ScheduleWapper = styled.li`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  ${mediaQuery[0]} {
    padding: 10px;
  }
`;
const ScheduleCardDrag = (props) => {
  const [isEditDuration, setIsEditDuration] = useState(props.isAllowEdit);
  const [duration, setDuration] = useState(props.schedule.duration);
  useEffect(() => {
    if (props.isAllowEdit) {
      setIsEditDuration(props.isAllowEdit);
    }
  }, [props.isAllowEdit]);
  return (
    <Draggable
      draggableId={props.id}
      index={props.index}
      isDragDisabled={!props.isAllowEdit}>
      {(provided, snapshot) => (
        <ScheduleWapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <FlexDiv
            css={css`
              gap: 20px;
              ${mediaQuery[0]} {
                flex-direction: column;
                gap: 30px;
              }
            `}>
            <ScheduleCard
              schedule={props.schedule}
              durationControllerConfig={{
                isEditStatus: isEditDuration && props.isAllowEdit,
                isUpdate: duration !== props.schedule.duration,
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
                    props.updateDuration(props.schedule.schedule_id, duration);
                  }
                },
              }}
              isEdit={props.isAllowEdit}
              selectedList={props.selectedList}
              setSelectedList={props.setSelectedList}
              isShowCloseBtn={props.isAllowEdit}
              onClick={props.onClick}
              onCloseClick={props.onCloseClick}
              travelMode={props.schedule.travel_mode}
              transitDetail={props.schedule.transit_detail}
              changeTrasitWay={props.changeTrasitWay}
              isDragging={snapshot.isDragging}
            />
          </FlexDiv>
        </ScheduleWapper>
      )}
    </Draggable>
  );
};

function ScheduleArea({ schedules, isAllowEdit, departTimes }) {
  const [changeTime, setChangeTime] = useState('');
  const { uid, dispatchNotification } = useContext(Context);
  const { itineraryId } = useParams();
  const deleteSchedule = (scheduleId) => {
    getTransportDetail(
      schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
      {
        isSetSchedule: true,
        isUploadFirebase: true,
      }
    );
    firestore
      .deleteSchedule(uid, itineraryId, scheduleId)
      .catch((error) => console.error(error));
  };
  const changeSchedulesTime = async () => {
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
        {},
        overviews.depart_times[targetDay]
      );
      newTargetDaySchedules = await getTransportDetail(newTargetDaySchedules, {
        isUploadFirebase: true,
      });
      const removedDaySchedules = schedules.filter(
        (schedule) =>
          selectedSchedulesId.every((id) => id !== schedule.schedule_id) &&
          schedule
      );
      const newCurrentDaySchedule = await getTransportDetail(
        removedDaySchedules,
        {
          isUploadFirebase: true,
        }
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
    updateTimeOfSchedule(newSchedules, {
      isSetSchedule: true,
      isUploadFirebase: true,
    });
  };
  const changeTrasitWay = (scheduleId, mode) => {
    const newScheduleList = schedules.map((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        return { ...schedule, travel_mode: mode };
      } else {
        return schedule;
      }
    });
    getTransportDetail(
      newScheduleList,
      { isUploadFirebase: true, isSetSchedule: true },
      scheduleId,
      mode
    );
  };
  const container = css`
    ${styles.containerSetting}
    max-width: ${isAllowEdit && '1280px'};
  `;
  return (
    <Droppable droppableId="scheduleArea" isDropDisabled={!isAllowEdit}>
      {(provided, snapshot) => (
        <FlexChildDiv
          addCss={css`
            ${container}
            width: 100%;
            flex-direction: column;
            gap: 20px;
            flex-grow: 1;
          `}
          ref={provided.innerRef}
          {...provided.droppableProps}>
          <FlexChildDiv
            addCss={css`
              flex-direction: column;
              background-color: ${snapshot.isDraggingOver
                ? palatte.gray[300]
                : palatte.gray[100]};
              flex-grow: 1;
              padding: 20px;
              border-radius: 10px;
              ${mediaQuery[0]} {
                gap: 20px;
              }
            `}>
            {isAllowEdit && (
              <FlexDiv justifyContent="flex-end" margin="0 0 20px 0">
                <MoveScheduleController
                  day={day}
                  departTimes={departTimes}
                  changeTime={changeTime}
                  setChangeTime={setChangeTime}
                  schedules={schedules}
                  selectedSchedulesId={selectedSchedulesId}
                  setSelectedSchedulesId={setSelectedSchedulesId}
                  switchDay={switchDay}
                  setIsSelectAll={setIsSelectAll}
                  isSelectAll={isSelectAll}
                  changeSchedulesTime={changeSchedulesTime}
                />
              </FlexDiv>
            )}
            {schedules?.length > 0 ? (
              schedules.map((schedule, index) => (
                <ScheduleCardDrag
                  isAllowEdit={isAllowEdit}
                  key={schedule.schedule_id}
                  index={index}
                  id={schedule.schedule_id}
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
          </FlexChildDiv>
        </FlexChildDiv>
      )}
    </Droppable>
  );
}

function AddSchedule(props) {
  const { uid, map, dispatchNotification } = useContext(Context);
  const { itineraryId } = useParams();
  const allSchedules = useRef();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(0);
  const [isAllowEdit, setIsAllowEdit] = useState(props.isAllowEdit);
  const [selectedSchedulesId, setSelectedSchedulesId] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId, map, true)
        .then((res) => {
          if (res) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            setSchedules(
              filterDaySchedules(res.schedules, res.overviews.depart_times)[day]
            );
            allSchedules.current = filterDaySchedules(
              res.schedules,
              res.overviews.depart_times
            );
          } else {
            dispatchNotification({
              type: 'fire',
              playload: {
                type: 'error',
                message: '找不到行程資料',
                id: 'toastifyNotFound',
              },
            });
          }
        })
        .catch((error) => {
          console.error(error);
          navigate(`/error`);
        });
    }
  }, [uid, itineraryId]);

  useEffect(() => {
    if (
      selectedSchedulesId?.length === schedules?.length &&
      selectedSchedulesId?.length !== 0
    ) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedSchedulesId, schedules]);
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
  }, [schedules, overviews, day]);
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  const updateTimeOfSchedule = (list, option, newDepartTime) => {
    const updatedList = list.map((schedule, index, array) => {
      if (index === 0) {
        schedule.start_time = newDepartTime || overviews.depart_times[day];
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      } else {
        const prevSchedule = array[index - 1];
        schedule.start_time = prevSchedule.end_time;
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      }
      return schedule;
    });
    if (option?.isSetSchedule) {
      setSchedules(updatedList);
    }
    if (option?.isUploadFirebase) {
      firestore.editSchedules(uid, itineraryId, updatedList, 'merge');
    }
    return updatedList;
  };
  const getTransportDetail = (
    schedules,
    { isUploadFirebase, isSetSchedule },
    scheduleId,
    newMode
  ) => {
    const schedulesPromise = schedules.map((schedule, index, array) => {
      if (index < array.length - 1) {
        if (scheduleId) {
          return scheduleId === schedule.schedule_id
            ? googleMap
                .getDirection({
                  origin: schedule.placeDetail.geometry,
                  destination: array[index + 1].placeDetail.geometry,
                  ...transportMode(schedule)[newMode].config,
                })
                .catch((error) => {
                  if (error.code === 'ZERO_RESULTS') {
                    dispatchNotification({
                      type: 'fire',
                      playload: {
                        message:
                          '抱歉！此交通方式找不到合適的路線，請切換其他方式',
                        id: 'alert_noTransport',
                        btnMessage: '修改交通方式',
                      },
                    });
                  }
                  return Promise.reject(schedule);
                })
            : null;
        } else {
          return googleMap
            .getDirection(
              {
                origin: schedule.placeDetail.geometry,
                destination: array[index + 1].placeDetail.geometry,
                ...transportMode(schedule)[schedule.travel_mode].config,
              },
              {
                name: array[index + 1].placeDetail.name,
                address: array[index + 1].placeDetail.formatted_address,
              }
            )
            .catch((error) => {
              if (error.code === 'ZERO_RESULTS') {
                dispatchNotification({
                  type: 'fire',
                  playload: {
                    message: '抱歉！此交通方式找不到合適的路線，請切換其他方式',
                    id: 'alertNoTransport',
                    btnMessage: '修改交通方式',
                    width: '100%',
                  },
                });
              }
              return Promise.reject(schedule);
            });
        }
      }
    });
    return Promise.all(schedulesPromise).then((transitDetails) => {
      let newSchedules = schedules.map((schedule, index) => {
        if (transitDetails[index]) {
          const transitDetail = {
            duration: {
              text: transitDetails[index].duration.text,
              value: Number(
                transitDetails[index].duration.text.match(/^\d+/)[0]
              ),
            },
            distance: transitDetails[index].distance,
            direction_url: transitDetails[index].direction_url,
          };
          return {
            ...schedule,
            transit_detail: transitDetail,
          };
        } else {
          return scheduleId
            ? { ...schedule }
            : {
                ...schedule,
                end_time: schedule.start_time + schedule.duration * 60 * 1000,
                transit_detail: '',
              };
        }
      });

      for (let i = 0; i < newSchedules.length - 1; i++) {
        newSchedules[i].end_time =
          newSchedules[i].start_time +
          (newSchedules[i].duration +
            newSchedules[i].transit_detail.duration.value) *
            60 *
            1000;
        newSchedules[i + 1].start_time = newSchedules[i].end_time;
      }
      if (isSetSchedule) {
        setSchedules(newSchedules);
        allSchedules.current[day] = newSchedules;
      }
      if (isUploadFirebase) {
        firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
      }
      return Promise.resolve(newSchedules);
    });
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
      schedule_id: 'unknown',
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
      if (schedules?.length > 0) {
        getTransportDetail(newScheduleList, {
          isSetSchedule: true,
          isUploadFirebase: true,
        }).catch((error) => console.error(error));
      } else {
        const updatedTimeSchedules = updateTimeOfSchedule(newScheduleList);
        setSchedules(updatedTimeSchedules);
        allSchedules.current[day] = updatedTimeSchedules;
      }
    } else if (startAndEnd.startId === startAndEnd.endId) {
      const list =
        startAndEnd.startId === 'scheduleArea' ? schedules : waitingSpots;
      const items = reorder(
        list,
        result.source.index,
        result.destination.index
      );
      if (startAndEnd.startId === 'scheduleArea') {
        const updatedTimeSchedules = updateTimeOfSchedule(items);
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
      getTransportDetail(newScheduleList, {
        isSetSchedule: true,
        isUploadFirebase: true,
      });
      if (newSpotsList) {
        setWaitingSpots(newSpotsList);
      }
    }
  };

  const updateOverviewsFields = (keyValuePair) => {
    setOverviews({ ...overviews, ...keyValuePair });
    firestore
      .editOverviews(uid, itineraryId, keyValuePair)
      .catch((error) => console.error(error));
  };
  const deleteSpot = (placeId) => {
    setWaitingSpots(waitingSpots.filter((spot) => spot.place_id !== placeId));
    firestore
      .deleteWaitingSpots(uid, itineraryId, placeId)
      .catch((error) => console.error(error));
  };
  const updateDate = (
    start,
    end,
    setEndTimestamp,
    setStartTimestamp,
    setIsEdit
  ) => {
    let updateDate;
    const resetTime = {
      start: new Date(start).setHours(8, 0, 0, 0),
      end: new Date(end).setHours(8, 0, 0, 0),
    };
    if (overviews.start_date !== start && overviews.end_date !== end) {
      updateDate = {
        start_date: resetTime.start,
        end_date: resetTime.end,
        depart_times: createDepartTimeAry({ start_date: start, end_date: end }),
      };
    } else if (overviews.start_date !== start && overviews.end_date === end) {
      updateDate = {
        start_date: resetTime.start,
        depart_times: createDepartTimeAry({
          start_date: resetTime.start,
          end_date: overviews.end_date,
        }),
      };
    } else if (overviews.start_date === start && overviews.end_date !== end) {
      updateDate = {
        end_date: resetTime.end,
        depart_times: createDepartTimeAry({
          start_date: overviews.start_date,
          end_date: resetTime.end,
        }),
      };
    }
    if (updateDate) {
      const dayScheduleHad = Object.values(allSchedules.current).filter(
        (day) => day.length > 0
      );
      if (dayScheduleHad.length > updateDate.depart_times.length) {
        dispatchNotification({
          type: 'fire',
          playload: {
            message:
              '新的旅遊天數少於已安排的行程天數，請先移除行程，再修改日期',
            id: 'alert_updateDaysError',
          },
        });

        setEndTimestamp(overviews.end_date);
        setStartTimestamp(overviews.start_date);
      } else {
        updateOverviewsFields(updateDate);
        const oldDayKeys = Object.keys(allSchedules.current);
        const removeDays = oldDayKeys.length - updateDate.depart_times.length;
        let newAllSchedules = { ...allSchedules.current };
        if (removeDays > 0) {
          setDay(0);
          newAllSchedules = dayScheduleHad.reduce((acc, day, index) => {
            acc[index] = day;
            return acc;
          }, {});
        }
        for (let i = 0; i < updateDate.depart_times.length; i++) {
          if (i < oldDayKeys.length && newAllSchedules[i]) {
            newAllSchedules[i] = updateTimeOfSchedule(
              newAllSchedules[i],
              { isUploadFirebase: true },
              updateDate.depart_times[i]
            );
          } else {
            newAllSchedules[i] = [];
          }
        }
        allSchedules.current = newAllSchedules;
        setSchedules(newAllSchedules[removeDays > 0 ? 0 : day]);
        setIsEdit(false);
      }
    }
  };
  const switchDay = (nextDay) => {
    setDay(nextDay);
    setSchedules(allSchedules.current[nextDay]);
    setIsSelectAll(false);
    setSelectedSchedulesId([]);
    window.scrollTo(0, 0);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <Container minHeight="100vh" padding="0 0 150px 0">
            {isAllowEdit && (
              <WaitingSpotArea
                addSpotAction={() => navigate('/explore')}
                closeAction={() => setIsAllowEdit(false)}
                waitingSpots={waitingSpots}
                deleteSpot={deleteSpot}
              />
            )}
            <FlexDiv
              addCss={css`
                flex-direction: column;
                gap: 20px;
                min-height: 100vh;
                width: ${isAllowEdit && 'calc(100% - 340px)'};
                ${mediaQuery[0]} {
                  width: 100%;
                  padding-bottom: ${isAllowEdit && '25vh'};
                }
              `}>
              <Overview
                containerCss={container}
                isAllowEdit={isAllowEdit}
                setIsAllowEdit={setIsAllowEdit}
                overviews={overviews}
                updateDate={updateDate}
                updateOverviewsFields={updateOverviewsFields}
                day={day}
              />
              <FlexDiv
                addCss={container}
                width="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                margin="0">
                <DepartController
                  departTimes={overviews.depart_times}
                  day={day}
                  isAllowEdit={isAllowEdit}
                  onSubmit={(newTime) => {
                    if (newTime !== overviews.depart_times[day]) {
                      updateTimeOfSchedule(
                        schedules,
                        { isSetSchedule: true, isUploadFirebase: true },
                        newTime
                      );
                      updateOverviewsFields({
                        depart_times: overviews.depart_times.map(
                          (time, index) => (index === day ? newTime : time)
                        ),
                      });
                    }
                  }}
                  updateTimeOfSchedule={updateTimeOfSchedule}
                  updateOverviewsFields={updateOverviewsFields}
                  schedules={schedules}
                />
                <Pagination
                  day={day}
                  switchDay={switchDay}
                  finalDay={overviews?.depart_times?.length - 1}
                />
              </FlexDiv>
              <ScheduleArea />
            </FlexDiv>
          </Container>
        </>
      )}
    </DragDropContext>
  );
}

export { AddSchedule };
