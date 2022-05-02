import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
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
  CheckboxCustom,
} from './styledComponents/Form';
import { Button, RoundButtonSmall } from './styledComponents/Button';
import {
  Container,
  FlexDiv,
  FlexChildDiv,
  Image,
} from './styledComponents/Layout';
import {
  Card,
  CardWrapper,
  cardCss,
  ScheduleCard,
} from './styledComponents/Cards';
import {
  timestampToString,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
} from '../utils/utilities';
import { googleMap } from '../utils/googleMap';
import { Pagination } from './Pagination';
import { palatte, styles, H2, H3, P } from './styledComponents/basicStyle';
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
  flex-direction: column;
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
    <FlexDiv direction="column" alignItems="center">
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
    </FlexDiv>
  );
}
const ScheduleCardDrag = (props) => {
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
          <FlexDiv gap="20px">
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
            </FlexChildDiv>
          </FlexDiv>
          {props.schedule.transit_detail && (
            <TransitCard
              isBrowse={props.isBrowse}
              scheduleId={props.schedule.schedule_id}
              travelMode={props.schedule.travel_mode}
              transitDetail={props.schedule.transit_detail}
              changeTrasitWay={props.changeTrasitWay}
            />
          )}
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
        <H2
          as={props.as}
          addCss={props.addCss}
          color={props.color}
          textAlign="center"
          onClick={() => {
            if (!props.isBrowse) setIsEdit(true);
          }}>
          {value}
        </H2>
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
        <P
          color={palatte.white}
          addCss={css`
            font-weight: 700;
          `}
          textAlign="center"
          onClick={(e) => {
            if (e.target.id !== 'submit' && !props.isBrowse) {
              setIsEdit(true);
            }
          }}>
          {timestampToString(startTimestamp, 'date')} -{' '}
          {timestampToString(endTimestamp, 'date')}
        </P>
      )}
    </>
  );
}

function Overview(props) {
  const navigate = useNavigate();

  const roundBtn = css`
    font-size: 20px;
    padding: 5px;
    width: fit-content;
    height: fit-content;
    color: ${palatte.white};
    background-color: rgba(255, 255, 255, 0.5);
    text-align: center;
    &:hover {
      background-color: rgba(255, 255, 255, 0.6);
      color: ${palatte.gray['100']};
    }
  `;

  return (
    <>
      <Container position="relative" margin="0 0 30px 0">
        <Container
          addCss={styles.containerSetting}
          padding="40px 20px 50px 20px">
          <FlexDiv justifyContent="space-between">
            <RoundButtonSmall
              addCss={roundBtn}
              className="material-icons"
              type="button"
              onClick={() => navigate('/itineraries')}>
              navigate_before
            </RoundButtonSmall>
            <RoundButtonSmall
              addCss={roundBtn}
              className="material-icons"
              type="button"
              onClick={() => props.setIsBrowse(false)}>
              edit
            </RoundButtonSmall>
          </FlexDiv>
          <FlexDiv direction="column" gap="10px" alignItems="center">
            <EditableH2
              color={palatte.white}
              isBrowse={props.isBrowse}
              onSubmit={(title) => {
                if (title !== props.overviews.title) {
                  props.updateOverviewsFields({ title });
                }
              }}>
              {props.overviews.title}
            </EditableH2>
            <EditableDate
              start={props.overviews.start_date}
              end={props.overviews.end_date}
              onSubmit={props.updateDate}
              isBrowse={props.isBrowse}
            />
            <H3 color={palatte.white}>Day {props.day + 1}</H3>
          </FlexDiv>
        </Container>
        <Image
          src={props.overviews.cover_photo}
          alt="cover"
          blur
          addCss={css`
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            z-index: -1;
          `}
        />
      </Container>
      <FlexDiv
        addCss={styles.containerSetting}
        width="100%"
        justifyContent="space-between"
        alignItems="flex-end">
        <FlexDiv alignItems="flex-start" direction="column">
          <FlexDiv
            justifyContent="space-between"
            gap="50px"
            addCss={css`
              & > * {
                color: ${palatte.gray['700']};
              }
            `}>
            <p>出發時間</p>
            <p>
              {timestampToString(
                props.overviews.depart_times[props.day],
                'simpleDate'
              )}
            </p>
          </FlexDiv>
          <EditableH2
            as="p"
            addCss={css`
              color: ${palatte.info.basic};
              font-weight: 700;
              font-size: 36px;
            `}
            isBrowse={props.isBrowse}
            onSubmit={(departTimes) => {
              if (departTimes !== props.departString) {
                const newDepartTimestamp = setTimeToTimestamp(
                  props.overviews.depart_times[props.day],
                  departTimes
                );
                const newDepartTimes = Array.from(props.overviews.depart_times);
                newDepartTimes.splice(props.day, 1, newDepartTimestamp);
                props.updateOverviewsFields({ depart_times: newDepartTimes });
                props.updateTimeOfSchedule(
                  props.schedules,
                  { isUploadFirebase: true, isSetSchedule: true },
                  newDepartTimestamp
                );
                props.setDepartString(
                  timestampToString(newDepartTimestamp, 'time')
                );
              }
            }}>
            {props.departString}
          </EditableH2>
        </FlexDiv>
        {!props.isBrowse && (
          <FlexDiv alignItems="center" justifyContent="flex-end" gap="20px">
            <SelectAllCheckBox
              setAllChecked={() =>
                props.setSelectedSchedulesId(
                  props.schedules.map((schedule) => schedule.schedule_id)
                )
              }
              setAllUnchecked={() => props.setSelectedSchedulesId([])}
            />
            <select
              value={props.changeTime}
              onChange={(e) => props.setChangeTime(Number(e.target.value))}>
              <option value="" disabled>
                修改所選行程的日期
              </option>
              {props.overviews.depart_times.map((timestamp) => (
                <option value={timestamp} key={timestamp}>
                  {timestampToString(timestamp, 'date')}
                </option>
              ))}
            </select>
            <button type="button" onClick={props.changeSchedulesTime}>
              移動行程
            </button>
          </FlexDiv>
        )}
        <Pagination
          day={props.day}
          switchDay={props.switchDay}
          finalDay={props.overviews.depart_times.length - 1}
        />
      </FlexDiv>
    </>
  );
}

function AddSchedule(props) {
  const { uid, map } = useContext(Context);
  const { itineraryId } = useParams();
  const allSchedules = useRef();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(0);
  const [departString, setDepartString] = useState();
  const [isBrowse, setIsBrowse] = useState(props.browse);
  const [selectedSchedulesId, setSelectedSchedulesId] = useState([]);
  const [changeTime, setChangeTime] = useState();

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId, map, true)
        .then((res) => {
          if (res) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            setDepartString(
              timestampToString(res.overviews.depart_times[day], 'time')
            );
            res.schedules.sort((a, b) => a.start_time - b.start_time);
            setSchedules(
              filterDaySchedules(res.schedules, res.overviews.depart_times)[day]
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
      travel_mode: 'DRIVING',
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
  const changeSchedulesTime = async () => {
    const targetDay = overviews.depart_times.reduce((acc, timestamp, index) => {
      if (timestamp === changeTime) {
        acc = index;
      }
      console.log(timestamp);
      return acc;
    }, -1);
    console.log(changeTime, targetDay);
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <FlexDiv minHeight="100vh">
            {!isBrowse && (
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
            <FlexChildDiv direction="column" grow="1" gap="20px" order="-1">
              <Overview
                isBrowse={isBrowse}
                setIsBrowse={setIsBrowse}
                overviews={overviews}
                updateDate={updateDate}
                updateOverviewsFields={updateOverviewsFields}
                updateTimeOfSchedule={updateTimeOfSchedule}
                schedules={schedules}
                day={day}
                departString={departString}
                setDepartString={setDepartString}
                setSelectedSchedulesId={setSelectedSchedulesId}
                changeTime={changeTime}
                setChangeTime={setChangeTime}
                changeSchedulesTime={changeSchedulesTime}
                switchDay={switchDay}
              />
              <Droppable droppableId="scheduleArea" isDropDisabled={isBrowse}>
                {(provided) => (
                  <FlexDiv
                    addCss={styles.containerSetting}
                    width="100%"
                    direction="column"
                    gap="20px"
                    backgroundColor="#f0f0f0"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    {schedules?.length > 0 ? (
                      schedules.map((schedule, index) => (
                        <ScheduleCardDrag
                          isBrowse={isBrowse}
                          key={schedule.schedule_id}
                          index={index}
                          id={schedule.schedule_id}
                          changeTrasitWay={changeTrasitWay}
                          schedule={schedule}
                          updateDuration={updateDuration}
                          browse={isBrowse}>
                          {!isBrowse && (
                            <CheckboxCustom
                              id={schedule.schedule_id}
                              selectedList={selectedSchedulesId}
                              setSelectedList={setSelectedSchedulesId}
                            />
                          )}
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
                        </ScheduleCardDrag>
                      ))
                    ) : (
                      <p>
                        {isBrowse ? '點擊編輯新增行程' : '拖拉卡片以新增行程'}
                      </p>
                    )}
                    {provided.placeholder}
                  </FlexDiv>
                )}
              </Droppable>
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
