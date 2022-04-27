import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import styled from '@emotion/styled';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import { TextInput } from './styledComponents/TextField';
import { Button } from './styledComponents/Button';
import {
  Container,
  FlexDiv,
  FlexChildDiv,
  Card,
  CardWrapper,
  cardCss,
} from './styledComponents/Layout';
import {
  timestampToString,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
} from '../utils/utilities';
import { googleMap } from '../utils/googleMap';
// import { style } from '@mui/system';

// function ChooseDate(props) {
//   return (
//     <>
//       <LocalizationProvider dateAdapter={AdapterLuxon}>
//         <FlexDiv gap="20px">
//           <DatePicker
//             label="date range"
//             value={props.startDate}
//             onChange={(newDate) => {
//               props.setStartDate(newDate);
//             }}
//             renderInput={({ inputRef, inputProps, InputProps }) => (
//               <FlexDiv alignItems="center">
//                 <TextInput
//                   ref={inputRef}
//                   {...inputProps}
//                   placeholder="旅程開始日期"
//                   readOnly
//                 />
//                 {InputProps?.endAdornment}
//               </FlexDiv>
//             )}
//           />
//           <p>到</p>
//           <DatePicker
//             label="date range"
//             value={props.endDate}
//             onChange={(newDate) => {
//               props.setEndDate(newDate);
//             }}
//             renderInput={({ inputRef, inputProps, InputProps }) => (
//               <FlexDiv alignItems="center">
//                 <TextInput
//                   ref={inputRef}
//                   {...inputProps}
//                   placeholder="旅程結束日期"
//                   readOnly
//                 />
//                 {InputProps?.endAdornment}
//               </FlexDiv>
//             )}
//           />
//         </FlexDiv>
//       </LocalizationProvider>
//     </>
//   );
// }

function AddOverView(props) {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [title, setTitle] = useState();
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime());

  // const addOverView = [
  //   {
  //     title: '為這趟旅程取個名字吧！',
  //     type: 'text',
  //     placeholder: '請輸入行程名稱',
  //   },
  //   {
  //     title: '您選擇了這些景點：',
  //     type: 'cards',
  //   },
  //   {
  //     title: '預計要去玩幾天呢？',
  //     type: 'calender',
  //   },
  // ];
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
  return (
    <Container maxWidth="1200px" margin="80px auto 0px auto">
      <h2>為這趟旅程取個名字吧！</h2>
      <TextInput
        type="text"
        placeholder="請輸入行程名稱"
        value={props.title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <h2>您選擇了這些景點：</h2>
      <CardWrapper gap="20px">
        {props.waitingSpots?.map((spot) => {
          return (
            <Card
              column
              gap="20px"
              position="relative"
              basis="350px"
              key={spot.place_id}>
              <img
                src={spot.photos[0]}
                style={{ width: '100%', objectFit: 'cover' }}
                alt={spot.name}
              />
              <FlexChildDiv>
                <h3 style={{ margin: '0' }}>{spot.name}</h3>
                <p>{spot.formatted_address}</p>
                <p>{spot.rating}</p>
              </FlexChildDiv>
            </Card>
          );
        })}
      </CardWrapper>
      <h2>預計要去玩幾天呢？</h2>
      <FlexDiv gap="20px">
        <TextInput
          type="date"
          value={timestampToDateInput(startDate)}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
        <p>到</p>
        <TextInput
          type="date"
          value={timestampToDateInput(endDate)}
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
        />
      </FlexDiv>
      <Button
        styled="primary"
        margin="20px 0 0 auto"
        display="block"
        onClick={createItinerary}>
        新建行程
      </Button>
      {/* <ChooseDate
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      /> */}
    </Container>
  );
}
const SpotStyledCard = styled(Card)`
  position: relative;
  background-color: white;
  flex-direction: column;
  gap: 20px;
  flex-basis: 300px;
  cursor: grab;
  &:hover {
    cursor: grab;
  }
`;
const SpotCard = (props) => {
  return (
    <Draggable
      draggableId={props.id}
      index={props.index}
      isDragDisabled={props.browse}>
      {(provided) => (
        <SpotStyledCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          {props.children}
        </SpotStyledCard>
      )}
    </Draggable>
  );
};
const ScheduleStyledCard = styled.div`
  ${cardCss}
  position: relative;
  gap: 20px;
  height: 250px;
  cursor: ${(props) => (props.cursorDefault ? 'default' : 'grab')};
  background-color: white;
  &:hover {
    cursor: grab;
  }
`;
const ScheduleWapper = styled.li`
  padding: 30px;
  display: flex;
  gap: 20px;
`;
const transportMode = (schedule) => {
  const departureTime =
    schedule?.end_time < new Date().getTime()
      ? new Date()
      : new Date(schedule?.end_time);
  return {
    BICYCLING: {
      title: '騎自行車',
      config: {
        travelMode: 'BICYCLING',
      },
    },
    DRIVING: {
      title: '開車',
      config: {
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    TRANSIT: {
      title: '搭乘大眾運輸',
      config: {
        travelMode: 'TRANSIT',
        transitOptions: {
          departureTime: schedule ? departureTime : null,
        },
      },
    },
    WALKING: {
      title: '走路',
      config: {
        travelMode: 'WALKING',
      },
    },
  };
};
function TransitCard(props) {
  return (
    <>
      <FlexDiv alignItems="center" gap="10px">
        {props.isBrowse ? (
          <p>
            {transportMode()[props.travelMode].title}{' '}
            {props.transitDetail.duration.text}
          </p>
        ) : (
          <>
            <select
              value={props.travelMode}
              onChange={(e) =>
                props.changeTrasitWay(props.scheduleId, e.target.value)
              }>
              {Object.keys(transportMode()).map((mode) => (
                <option key={mode} value={mode}>
                  {transportMode()[mode].title}
                </option>
              ))}
            </select>
            <p>{props.transitDetail.duration.text}</p>
          </>
        )}
      </FlexDiv>
      <p>距離{props.transitDetail.distance.text}</p>
    </>
  );
}
const ScheduleCard = (props) => {
  const [isEditDuration, setIsEditDuration] = useState();
  const [duration, setDuration] = useState(props.schedule.duration);
  return (
    <Draggable
      draggableId={props.id}
      index={props.index}
      isDragDisabled={props.browse}>
      {(provided) => (
        <ScheduleWapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <FlexDiv
            alignItems="center"
            gap="5px"
            onClick={(e) => {
              if (e.target.id !== 'duration') {
                setIsEditDuration(true);
              }
            }}>
            <p>停留</p>
            {!props.isBrowse && isEditDuration ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDuration((prevValue) =>
                      prevValue >= 30 ? prevValue - 30 : 0
                    );
                  }}>
                  -
                </button>
                <p>{duration}</p>
                <button
                  type="button"
                  onClick={() => {
                    setDuration((prevValue) =>
                      prevValue < 1440 ? prevValue + 30 : 1440
                    );
                  }}>
                  +
                </button>
                <span>分鐘</span>
                <button
                  id="duration"
                  type="button"
                  style={{ marginLeft: '5px', backgroundColor: 'white' }}
                  onClick={(e) => {
                    if (e.target.id === 'duration') {
                      setIsEditDuration(false);
                      props.updateDuration(
                        props.schedule.schedule_id,
                        duration
                      );
                    }
                  }}>
                  儲存
                </button>
              </>
            ) : (
              <p>
                {' '}
                {duration < 60 ? duration : duration / 60}{' '}
                {duration < 60 ? '分鐘' : '小時'}
              </p>
            )}
          </FlexDiv>
          <FlexChildDiv grow="1" direction="column">
            <ScheduleStyledCard cursorDefault={props.browse}>
              {props.children}
            </ScheduleStyledCard>
            {props.schedule.transit_detail && (
              <TransitCard
                isBrowse={props.isBrowse}
                scheduleId={props.schedule.schedule_id}
                travelMode={props.schedule.travel_mode}
                transitDetail={props.schedule.transit_detail}
                changeTrasitWay={props.changeTrasitWay}
              />
            )}
          </FlexChildDiv>
        </ScheduleWapper>
      )}
    </Draggable>
  );
};

function EditableH2(props) {
  const [isEdit, setIsEdit] = useState();
  const [value, setValue] = useState();
  useEffect(() => {
    setValue(props.children);
  }, [props.children]);
  const submit = (e) => {
    e.preventDefault();
    setIsEdit(false);
    props.onSubmit(value);
  };
  return (
    <>
      {isEdit ? (
        <form onSubmit={submit}>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="submit">儲存</button>
        </form>
      ) : (
        <h2
          onClick={() => {
            if (!props.isBrowse) setIsEdit(true);
          }}>
          {value}
        </h2>
      )}
    </>
  );
}

function EditableDate(props) {
  const [isEdit, setIsEdit] = useState();
  const [startTimestamp, setStartTimestamp] = useState();
  const [endTimestamp, setEndTimestamp] = useState();
  useEffect(() => {
    setStartTimestamp(props.start);
    setEndTimestamp(props.end);
  }, []);
  const submit = (e) => {
    e.preventDefault();
    setIsEdit(false);
    props.onSubmit(
      startTimestamp,
      endTimestamp,
      setEndTimestamp,
      setStartTimestamp
    );
  };
  return (
    <>
      {isEdit ? (
        <form onSubmit={submit}>
          <input
            type="date"
            value={timestampToDateInput(startTimestamp)}
            onChange={(e) =>
              setStartTimestamp(new Date(e.target.value).getTime())
            }
          />
          <span> - </span>
          <input
            type="date"
            value={timestampToDateInput(endTimestamp)}
            onChange={(e) =>
              setEndTimestamp(new Date(e.target.value).getTime())
            }
          />
          <button id="submit" type="submit">
            儲存
          </button>
        </form>
      ) : (
        <p
          onClick={(e) => {
            if (e.target.id !== 'submit' && !props.isBrowse) {
              setIsEdit(true);
            }
          }}>
          {timestampToString(startTimestamp, 'date')} -{' '}
          {timestampToString(endTimestamp, 'date')}
        </p>
      )}
    </>
  );
}

function AddSchedule(props) {
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const allSchedules = useRef();
  const [day, setDay] = useState(0);
  const [departString, setDepartString] = useState();
  const [isBrowse, setIsBrowse] = useState(props.browse);
  const { itineraryId } = useParams();
  const { uid, map } = useContext(Context);

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId, map, true)
        .then((res) => {
          if (res) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            setDepartString(
              timestampToString(res.overviews.depart_times[0], 'time')
            );
            res.schedules.sort((a, b) => a.start_time - b.start_time);
            setSchedules(
              filterDaySchedules(res.schedules, res.overviews.depart_times)[0]
            );
            allSchedules.current = filterDaySchedules(
              res.schedules,
              res.overviews.depart_times
            );
          } else {
            alert('找不到行程資料');
          }
        })
        .catch((error) => console.log(error));
    }
  }, [uid, itineraryId]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  const updateTimeOfSchedule = (list, options, newDepartTime) => {
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
    if (options?.isSetSchedule) {
      setSchedules(updatedList);
    }
    if (options?.isUploadFirebase) {
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
            ? googleMap.getDirection({
                origin: schedule.placeDetail.geometry,
                destination: array[index + 1].placeDetail.geometry,
                ...transportMode(schedule)[newMode].config,
              })
            : null;
        } else {
          return googleMap.getDirection({
            origin: schedule.placeDetail.geometry,
            destination: array[index + 1].placeDetail.geometry,
            ...transportMode(schedule)[schedule.travel_mode].config,
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
      return Promise.resolve('updated!');
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
      travel_mode: 'DRIVING',
    };
    firestore
      .addScheduleRemoveWaitingSpot(uid, itineraryId, addData)
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
      // const updatedTimeSchedules = updateTimeOfSchedule(newScheduleList);
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
    updateTimeOfSchedule(
      schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
      { isSetSchedule: true, isUploadFirebase: true }
    );
    firestore
      .deleteSchedule(uid, itineraryId, scheduleId)
      .then(() => console.log('刪除成功！'))
      .catch((error) => console.error(error));
  };
  const deleteSpot = (placeId) => {
    setWaitingSpots(waitingSpots.filter((spot) => spot.place_id !== placeId));
    firestore
      .deleteWaitingSpots(uid, itineraryId, placeId)
      .then(() => console.log('刪除成功！'))
      .catch((error) => console.error(error));
  };
  const updateDate = (start, end, setEndTimestamp, setStartTimestamp) => {
    let updateDate;
    if (overviews.start_date !== start && overviews.end_date !== end) {
      updateDate = {
        start_date: start,
        end_date: end,
        depart_times: createDepartTimeAry({ start_date: start, end_date: end }),
      };
    } else if (overviews.start_date !== start && overviews.end_date === end) {
      updateDate = {
        start_date: start,
        depart_times: createDepartTimeAry({
          start_date: start,
          end_date: overviews.end_date,
        }),
      };
    } else if (overviews.start_date === start && overviews.end_date !== end) {
      updateDate = {
        end_date: end,
        depart_times: createDepartTimeAry({
          start_date: overviews.start_date,
          end_date: end,
        }),
      };
    }
    if (updateDate) {
      const dayScheduleHad = Object.values(allSchedules.current).filter(
        (day) => day.length > 0
      );
      if (dayScheduleHad.length > updateDate.depart_times.length) {
        alert('新的旅遊天數少於已安排的行程天數，請先移除行程，再修改日期');
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
          if (i < oldDayKeys.length) {
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
        setDepartString(
          timestampToString(
            updateDate.depart_times[removeDays > 0 ? 0 : day],
            'time'
          )
        );
        setSchedules(newAllSchedules[removeDays > 0 ? 0 : day]);
      }
    }
  };
  const switchDay = (nextDay) => {
    setDay(nextDay);
    setSchedules(allSchedules.current[nextDay]);
    setDepartString(timestampToString(overviews.depart_times[nextDay], 'time'));
    window.scrollTo(0, 0);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <FlexDiv minHeight="100vh">
            {isBrowse ? (
              <button
                style={{ alignSelf: 'flex-start', margin: '50px 30px 0 0' }}
                onClick={() => setIsBrowse(false)}>
                編輯
              </button>
            ) : (
              <FlexChildDiv
                padding="30px"
                display="flex"
                direction="column"
                style={{ backgroundColor: '#f7f7f7' }}
                basis="360px">
                <FlexDiv justifyContent="flex-end" gap="20px">
                  <button type="button" onClick={() => navigate('/explore')}>
                    新增景點
                  </button>
                  <button
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: 'crimson',
                      color: 'white',
                    }}
                    onClick={() => setIsBrowse(true)}>
                    結束編輯
                  </button>
                </FlexDiv>
                <p>待定景點</p>
                <Droppable
                  droppableId="waitingSpotsArea"
                  isDropDisabled={isBrowse}>
                  {(provided) => (
                    <CardWrapper
                      column
                      grow="1"
                      gap="20px"
                      maxWidth="300px"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      browse={isBrowse}>
                      {waitingSpots?.map((spot, index) => (
                        <SpotCard
                          key={spot.place_id}
                          index={index}
                          id={spot.place_id}>
                          <img
                            style={{ width: '100%', objectFit: 'cover' }}
                            src={spot.photos[0]}
                            alt={spot.name}
                          />
                          <div>
                            <h3>{spot.name}</h3>
                            <p>{spot.formatted_address}</p>
                            <p>{spot.rating}</p>
                          </div>
                          <button
                            type="button"
                            style={{
                              position: 'absolute',
                              right: '0',
                              top: '0',
                            }}
                            onClick={() => deleteSpot(spot.place_id)}>
                            X
                          </button>
                        </SpotCard>
                      ))}
                      {provided.placeholder}
                    </CardWrapper>
                  )}
                </Droppable>
              </FlexChildDiv>
            )}
            <FlexChildDiv grow="1" order="-1" padding="30px">
              <Container>
                <button type="button" onClick={() => navigate('/itineraries')}>
                  回首頁
                </button>
                <EditableH2
                  isBrowse={isBrowse}
                  onSubmit={(title) => {
                    if (title !== overviews.title) {
                      updateOverviewsFields({ title });
                    }
                  }}>
                  {overviews.title}
                </EditableH2>
                <EditableDate
                  start={overviews.start_date}
                  end={overviews.end_date}
                  onSubmit={updateDate}
                  isBrowse={isBrowse}
                />
              </Container>
              <h3>Day {day + 1}</h3>
              <FlexDiv alignItems="center" gap="20px">
                <p>出發時間</p>
                <EditableH2
                  isBrowse={isBrowse}
                  onSubmit={(departTimes) => {
                    if (departTimes !== departString) {
                      console.log(departString);
                      const newDepartTimestamp = setTimeToTimestamp(
                        overviews.depart_times[day],
                        departTimes
                      );
                      const newDepartTimes = Array.from(overviews.depart_times);
                      newDepartTimes.splice(day, 1, newDepartTimestamp);
                      updateOverviewsFields({ depart_times: newDepartTimes });
                      updateTimeOfSchedule(schedules, true, newDepartTimestamp);
                    }
                  }}>
                  {departString}
                </EditableH2>
              </FlexDiv>
              <Droppable droppableId="scheduleArea" isDropDisabled={isBrowse}>
                {(provided) => (
                  <CardWrapper
                    column
                    gap="20px"
                    backgroundColor="#f0f0f0"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    {schedules?.length > 0 ? (
                      schedules.map((schedule, index) => (
                        <ScheduleCard
                          isBrowse={isBrowse}
                          key={schedule.schedule_id}
                          index={index}
                          id={schedule.schedule_id}
                          changeTrasitWay={changeTrasitWay}
                          schedule={schedule}
                          updateDuration={updateDuration}
                          browse={isBrowse}>
                          <div>
                            {timestampToString(schedule.start_time, 'time')}
                          </div>
                          <img
                            style={{ width: '300px' }}
                            src={schedule.placeDetail.photos[0]}
                            alt={schedule.placeDetail.name}
                          />
                          <div>
                            <h3>{schedule.placeDetail.name}</h3>
                            <p>{schedule.placeDetail.formatted_address}</p>
                          </div>
                          {!isBrowse && (
                            <button
                              type="button"
                              style={{
                                position: 'absolute',
                                right: '0',
                                top: '0',
                              }}
                              onClick={() =>
                                deleteSchedule(schedule.schedule_id)
                              }>
                              X
                            </button>
                          )}
                        </ScheduleCard>
                      ))
                    ) : (
                      <p>
                        {isBrowse ? '點擊編輯新增行程' : '拖拉卡片以新增行程'}
                      </p>
                    )}
                    {provided.placeholder}
                  </CardWrapper>
                )}
              </Droppable>

              <FlexDiv justifyContent="flex-end" padding="5px 0">
                {day > 0 && (
                  <FlexDiv
                    as="button"
                    alignItems="center"
                    margin="auto auto auto 0"
                    type="button"
                    onClick={() => switchDay(day - 1)}>
                    <span className="material-icons">navigate_before</span>第
                    {day}天
                  </FlexDiv>
                )}
                {day < overviews.depart_times.length - 1 && (
                  <FlexDiv
                    as="button"
                    alignItems="center"
                    type="button"
                    onClick={() => switchDay(day + 1)}>
                    第{day + 2}天
                    <span className="material-icons">navigate_next</span>
                  </FlexDiv>
                )}
              </FlexDiv>
            </FlexChildDiv>
          </FlexDiv>
        </>
      )}
    </DragDropContext>
  );
}
function AddItinerary() {
  return <Outlet />;
}

export { AddOverView, AddSchedule, AddItinerary };
