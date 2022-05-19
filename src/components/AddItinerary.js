import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  TextInput,
  SelectAllCheckBox,
  AddImageRoundBtn,
  SelectSmall,
  CustomDateRangePicker,
} from './styledComponents/Form';
import {
  Button,
  RoundButtonSmallWhite,
  ButtonOutline,
  HyperLink,
  RoundButtonSmall,
  ButtonSmall,
  ButtonIconColumn,
  RoundButtonSmallWithLabel,
} from './styledComponents/Button';
import {
  Container,
  FlexDiv,
  FlexChildDiv,
  Image,
} from './styledComponents/Layout';
import {
  ScheduleCard,
  SpotCard,
  transportMode,
} from './styledComponents/Cards';
import {
  timestampToString,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
  updateItineraryCoverPhoto,
} from '../utils/utilities';
import { googleMap } from '../utils/googleMap';
import { Pagination } from './Pagination';
import { palatte, styles, mediaQuery } from './styledComponents/basic/common';
import { P, H5 } from './styledComponents/basic/Text';
import {
  Overview,
  DepartController,
  MoveScheduleController,
} from './EditItinerary';
import WaitingSpotArea from './EditItinerary/WaitingSpotArea';

function AddOverView(props) {
  const { uid, dispatchNotification } = useContext(Context);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime());
  const [step, setStep] = useState(0);

  const addOverView = [
    {
      title: '為這趟旅程取個名字吧！',
      type: 'text',
      placeholder: '請輸入行程名稱',
      alert: '行程名稱還沒填喔！',
    },
    {
      title: '您選擇了這些景點：',
      type: 'cards',
      alert: '請加入景點再創建行程',
    },
    {
      title: '預計要去玩幾天呢？',
      type: 'calendar',
      alert: '日期不完整，請確認後再送出！',
    },
  ];
  const createItinerary = () => {
    const getTimestamp = (date) => new Date(date).getTime();
    const basicInfo = {
      title,
      start_date: getTimestamp(startDate),
      end_date: getTimestamp(endDate),
    };
    firestore
      .createItinerary(uid, basicInfo, props.waitingSpots)
      .then((itineraryId) => {
        navigate(`/add/${itineraryId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const nextStep = () => {
    if (
      (step === 0 && title) ||
      (step === 1 && props.waitingSpots?.length > 0) ||
      (step === 2 && startDate && endDate)
    ) {
      setStep((prev) => prev + 1);
    } else {
      dispatchNotification({
        type: 'fire',
        playload: {
          message: addOverView[step].alert,
          id: 'toastify_emptyValue',
        },
      });
    }
  };
  return (
    <Container backgroundColor={palatte.gray[100]}>
      <FlexDiv
        as="form"
        height="100vh"
        gap="60px"
        direction="column"
        justifyContent="center"
        position="relative"
        addCss={styles.containerSetting}
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) {
            nextStep();
          } else {
            createItinerary();
          }
        }}>
        <RoundButtonSmallWithLabel
          styled="gray700"
          type="button"
          iconName="chevron_left"
          addCss={css`
            position: absolute;
            top: 50px;
            left: -10px;
          `}
          onClick={() => navigate('/explore')}>
          回探索景點
        </RoundButtonSmallWithLabel>
        <FlexDiv direction="column" gap="20px" padding="80px 0 0 0">
          {step === 1 && !props.waitingSpots?.length > 0 ? null : (
            <H5>{addOverView[step].title}</H5>
          )}

          {addOverView[step].type === 'text' && (
            <TextInput
              type="text"
              placeholder={addOverView[step].placeholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          )}
          {addOverView[step].type === 'cards' &&
            (props.waitingSpots?.length > 0 ? (
              <FlexChildDiv
                padding="20px 20px 20px 0"
                gap="30px"
                wrap="wrap"
                overflowY="auto"
                basis="60vh"
                maxHeight="100%">
                {props.waitingSpots?.map((spot) => {
                  return (
                    <SpotCard
                      imgSrc={spot.photos[0]}
                      imgAlt={spot.name}
                      title={spot.name}
                      address={spot.formatted_address}
                      rating={spot.rating}
                      id={spot.place_id}
                      key={spot.place_id}
                      isSmall
                      isShowCloseBtn
                      onCloseClick={() =>
                        props.setWaitingSpots((prev) =>
                          prev.filter(
                            (oldSpot) => oldSpot.place_id !== spot.place_id
                          )
                        )
                      }
                      addCss={css`
                        flex-basis: 30%;
                      `}
                    />
                  );
                })}
              </FlexChildDiv>
            ) : (
              <>
                <P>現在景點清單是空的，請加入景點，再創建行程</P>
                <HyperLink
                  onClick={() => navigate('/explore')}
                  iconName="chevron_right"
                  alignSelf="flex-start">
                  前往探索景點
                </HyperLink>
              </>
            ))}
          {addOverView[step].type === 'calendar' && (
            <FlexDiv gap="20px" alignItems="center">
              <CustomDateRangePicker
                width="100%"
                conjunction="到"
                startTimestamp={startDate}
                endTimestamp={endDate}
                setStartTimestamp={setStartDate}
                setEndTimestamp={setEndDate}
              />
            </FlexDiv>
          )}
        </FlexDiv>
        <FlexDiv justifyContent={step < 1 ? 'flex-end' : 'space-between'}>
          {step > 0 && (
            <ButtonOutline
              type="button"
              width="fit-content"
              styled="gray"
              padding="10px 20px 10px 10px"
              onClick={() => setStep((prev) => prev - 1)}>
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_left
              </span>
              上一步
            </ButtonOutline>
          )}
          <Button
            styled="primary"
            type="submit"
            width="fit-content"
            padding={step < 2 && '10px 10px 10px 20px'}>
            {step < 2 ? '下一步' : '新建行程'}
            {step < 2 && (
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_right
              </span>
            )}
          </Button>
        </FlexDiv>
      </FlexDiv>
    </Container>
  );
}

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

function AddSchedule(props) {
  const { uid, map, dispatchNotification } = useContext(Context);
  const { itineraryId } = useParams();
  const allSchedules = useRef();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(0);
  const [isAllowEdit, setIsAllowEdit] = useState(!props.browse);
  const [selectedSchedulesId, setSelectedSchedulesId] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [changeTime, setChangeTime] = useState('');

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
      console.log(departTimeMinutes);
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
        console.log(newSchedules);
        setSchedules(newSchedules);
        allSchedules.current[day] = newSchedules;
      }
      if (isUploadFirebase) {
        firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
      }
      return Promise.resolve(newSchedules);
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
      .then(() => console.log('success'))
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
      .then(() => console.log('removed'))
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
        })
          .then((res) => console.log(res))
          .catch((error) => console.error(error));
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
        })
          .then((res) => console.log(res))
          .catch((error) => console.error(error));
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
  const updateOverviewsFields = (keyValuePair) => {
    setOverviews({ ...overviews, ...keyValuePair });
    firestore
      .editOverviews(uid, itineraryId, keyValuePair)
      .then(() => console.log('updated overviews'))
      .catch((error) => console.error(error));
  };
  const deleteSchedule = (scheduleId) => {
    // updateTimeOfSchedule(
    //   schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
    //   { isSetSchedule: true, isUploadFirebase: true }
    // );
    getTransportDetail(
      schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
      {
        isSetSchedule: true,
        isUploadFirebase: true,
      }
    );
    firestore
      .deleteSchedule(uid, itineraryId, scheduleId)
      .then(() => {
        console.log('刪除成功！');
      })
      .catch((error) => console.error(error));
  };
  const deleteSpot = (placeId) => {
    setWaitingSpots(waitingSpots.filter((spot) => spot.place_id !== placeId));
    firestore
      .deleteWaitingSpots(uid, itineraryId, placeId)
      .then(() => console.log('刪除成功！'))
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
    console.log(start, end);
    const resetTime = {
      start: new Date(start).setHours(8, 0, 0, 0),
      end: new Date(end).setHours(8, 0, 0, 0),
    };
    console.log(resetTime);
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
  const changeSchedulesTime = async () => {
    if (!changeTime) {
      console.log('yes');
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

  const container = css`
    ${styles.containerSetting}
    max-width: ${props.isAllowEdit && '1280px'};
  `;
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
                    console.log(newTime);
                    if (newTime !== overviews.depart_times[day]) {
                      console.log('update');
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
              <Droppable
                droppableId="scheduleArea"
                isDropDisabled={!isAllowEdit}>
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
                            departTimes={overviews.depart_times}
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
                          {!isAllowEdit
                            ? '點擊編輯新增行程'
                            : '拖拉卡片以新增行程'}
                        </P>
                      )}
                      {provided.placeholder}
                    </FlexChildDiv>
                  </FlexChildDiv>
                )}
              </Droppable>
            </FlexDiv>
          </Container>
        </>
      )}
    </DragDropContext>
  );
}

export { AddOverView, AddSchedule };
