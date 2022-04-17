import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
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
import { style } from '@mui/system';

function ChooseDate(props) {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FlexDiv gap="20px">
          <DatePicker
            label="date range"
            value={props.startDate}
            onChange={(newDate) => {
              props.setStartDate(newDate);
            }}
            renderInput={({ inputRef, inputProps, InputProps }) => (
              <FlexDiv alignItems="center">
                <TextInput
                  ref={inputRef}
                  {...inputProps}
                  placeholder="旅程開始日期"
                  readOnly
                />
                {InputProps?.endAdornment}
              </FlexDiv>
            )}
          />
          <p>到</p>
          <DatePicker
            label="date range"
            value={props.endDate}
            onChange={(newDate) => {
              props.setEndDate(newDate);
            }}
            renderInput={({ inputRef, inputProps, InputProps }) => (
              <FlexDiv alignItems="center">
                <TextInput
                  ref={inputRef}
                  {...inputProps}
                  placeholder="旅程結束日期"
                  readOnly
                />
                {InputProps?.endAdornment}
              </FlexDiv>
            )}
          />
        </FlexDiv>
      </LocalizationProvider>
    </>
  );
}
const timestampToString = (timestamp, type) => {
  const timeType = {
    date: new Date(timestamp).toLocaleDateString(),
    time: new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
  return timeType[type] || '';
};

function AddOverView(props) {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [title, setTitle] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

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
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
        <p>到</p>
        <TextInput
          type="date"
          value={endDate}
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
const SpotCard = (props) => {
  const SpotStyledCard = styled(Card)`
    background-color: white;
    flex-direction: column;
    gap: 20px;
    flex-basis: 300px;
    cursor: grab;
    &:hover {
      cursor: grab;
    }
  `;
  return (
    <Draggable draggableId={props.id} index={props.index}>
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
const ScheduleCard = (props) => {
  const [isEditDuration, setIsEditDuration] = useState();
  const [duration, setDuration] = useState(props.schedule.duration);
  const ScheduleStyledCard = styled.div`
    ${cardCss}
    flex-grow: 1;
    gap: 20px;
    flex-basis: 500px;
    cursor: grab;
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
  const transportMode = [
    {
      BICYCLING: '騎自行車',
    },
    {
      DRIVING: '開車',
    },
    {
      TRANSIT: '搭乘大眾運輸',
    },
    {
      WALKING: '走路',
    },
  ];
  return (
    <Draggable draggableId={props.id} index={props.index}>
      {(provided) => (
        <ScheduleWapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          {props.schedule.type === 'spot' ? (
            <>
              <FlexDiv
                alignItems="center"
                gap="5px"
                onClick={(e) => {
                  if (e.target.id !== 'duration') {
                    setIsEditDuration(true);
                  }
                }}>
                <p>停留</p>
                {isEditDuration ? (
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
              <ScheduleStyledCard>{props.children}</ScheduleStyledCard>
            </>
          ) : (
            <p>
              {transportMode.map((transport) => {
                return transport.mode === props.schedule.transport_mode
                  ? transport.text
                  : '沒有東西';
              })}
              <span>{props.schedule.duration}</span>
            </p>
          )}
        </ScheduleWapper>
      )}
    </Draggable>
  );
};
function AddSchedule() {
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [departTime, setDepartTime] = useState();
  const [edit, setEdit] = useState();
  const { itineraryId } = useParams();
  const { uid } = useContext(Context);

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId)
        .then((res) => {
          if (res) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            setDepartTime(res.overviews.start_date);
            res.schedules.sort((a, b) => a.start_time - b.start_time);
            setSchedules(res.schedules);
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
  const updateTimeOfSchedule = (list, sourceIndex, isSetSchedule) => {
    const updatedList = list.map((schedule, index, array) => {
      if (index > 0 && index >= sourceIndex) {
        const prevSchedule = array[index - 1];
        schedule.start_time =
          prevSchedule.start_time + prevSchedule.duration * 60 * 1000;
      } else {
        schedule.start_time = departTime;
      }
      return schedule;
    });
    firestore.editSchedule(uid, itineraryId, updatedList, 'merge');
    if (isSetSchedule) {
      setSchedules(updatedList);
    }
  };
  const addSchedule = (spotIndex, scheduleIndex, type) => {
    let startTime;
    let duration = 60;
    const newSpotsList = Array.from(waitingSpots);
    const newScheduleList = Array.from(schedules);
    const [remove] = newSpotsList.splice(spotIndex, 1);
    if (scheduleIndex > 0) {
      for (let i = 0; i < scheduleIndex; i += 1) {
        startTime =
          newScheduleList[i].duration * 60 * 1000 +
          newScheduleList[0].start_time;
      }
    } else {
      startTime = departTime;
    }
    updateTimeOfSchedule(newScheduleList, scheduleIndex);
    const addData = {
      start_time: startTime,
      place_id: remove.place_id,
      duration,
      type,
      placeDetail: remove,
      schedule_id: 'unknown',
    };
    firestore
      .setSchedule(uid, itineraryId, addData)
      .then(() => console.log('success'))
      .catch((error) => console.error(error));
    newScheduleList.splice(scheduleIndex, 0, addData);

    return {
      newSpotsList,
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
        startAndEnd.endIndex,
        'spot'
      );
      console.log(newSpotsList, newScheduleList);
      setWaitingSpots(newSpotsList);
      setSchedules(newScheduleList);
    } else if (startAndEnd.startId === startAndEnd.endId) {
      const list =
        startAndEnd.startId === 'scheduleArea' ? schedules : waitingSpots;
      const items = reorder(
        list,
        result.source.index,
        result.destination.index
      );
      if (startAndEnd.startId === 'scheduleArea') {
        updateTimeOfSchedule(items, startAndEnd.startIndex, true);
      } else {
        setWaitingSpots(items);
      }
    } else if (
      startAndEnd.startId === 'scheduleArea' &&
      startAndEnd.endId === 'waitingSpotsArea'
    ) {
    }
  };
  const updateDuration = (scheduleId, newDuration) => {
    const newSchedules = Array.from(schedules);
    newSchedules.forEach((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        schedule.duration = newDuration;
      }
    });
    const sourceIndex = schedules.reduce((acc, item, index) => {
      if (item.schedule_id === scheduleId) {
        acc = index;
      }
      return acc;
    }, -1);
    updateTimeOfSchedule(newSchedules, sourceIndex, true);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <FlexDiv minHeight="100vh">
            <FlexChildDiv
              padding="30px"
              style={{ backgroundColor: '#f7f7f7' }}
              basis="360px">
              <p>待定景點</p>
              <Droppable droppableId="waitingSpotsArea">
                {(provided) => (
                  <CardWrapper
                    column
                    gap="20px"
                    maxWidth="300px"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
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
                      </SpotCard>
                    ))}
                    {provided.placeholder}
                  </CardWrapper>
                )}
              </Droppable>
            </FlexChildDiv>
            <FlexChildDiv grow="1" order="-1" padding="30px">
              <Container>
                <h2>{overviews.title}</h2>
                <p>
                  {timestampToString(overviews.start_date, 'date')} -
                  {timestampToString(overviews.end_date, 'date')}
                </p>
              </Container>
              <FlexDiv
                alignItems="center"
                gap="20px"
                onClick={(e) => {
                  if (e.target.id !== 'save') {
                    setEdit('depart');
                  }
                }}>
                <p>出發時間</p>
                {edit === 'depart' ? (
                  <>
                    <input
                      type="text"
                      value={timestampToString(departTime, 'time')}
                      onChange={(e) => {
                        setDepartTime(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      id="save"
                      onClick={(e) => {
                        if (e.target.id === 'save') {
                          setEdit('save');
                        }
                      }}>
                      儲存
                    </button>
                  </>
                ) : (
                  <h2>{timestampToString(departTime, 'time')}</h2>
                )}
              </FlexDiv>
              <Droppable droppableId="scheduleArea">
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
                          key={schedule.schedule_id}
                          index={index}
                          id={schedule.schedule_id}
                          schedule={schedule}
                          updateDuration={updateDuration}>
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
                        </ScheduleCard>
                      ))
                    ) : (
                      <p>拖拉卡片以新增行程</p>
                    )}
                    {provided.placeholder}
                  </CardWrapper>
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
