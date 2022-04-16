import { useContext, useEffect, useState } from 'react';
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
  const ScheduleStyledCard = styled(Card)`
    gap: 20px;
    flex-basis: 500px;
    cursor: grab;
    &:hover {
      cursor: grab;
    }
  `;
  return (
    <Draggable draggableId={props.id} index={props.index}>
      {(provided) => (
        <FlexDiv>
          <p>停留 {props.duration} 分鐘</p>
          <ScheduleStyledCard
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}>
            {props.children}
          </ScheduleStyledCard>
        </FlexDiv>
      )}
    </Draggable>
  );
};
function AddSchedule() {
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState();
  const [departTime, setDepartTime] = useState('9:00');
  const [edit, setEdit] = useState();
  const { itineraryId } = useParams();
  const { uid } = useContext(Context);
  const timestampToString = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId)
        .then((res) => {
          setWaitingSpots(res.waitingSpots);
          setOverviews(res.overviews);
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
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      waitingSpots,
      result.source.index,
      result.destination.index
    );
    setWaitingSpots(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <p>id: {itineraryId}</p>
      {overviews && (
        <>
          <h2>{overviews.title}</h2>
          <p>
            {timestampToString(overviews.start_date)} -
            {timestampToString(overviews.end_date)}
          </p>
          <div>
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
            <Container backgroundColor="#fffff5">
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
                      value={departTime}
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
                  <h2>{departTime}</h2>
                )}
              </FlexDiv>
              <Droppable droppableId="scheduleArea">
                {(provided) => (
                  <CardWrapper
                    column
                    gap="20px"
                    backgroundColor="gray"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    {schedules ? (
                      schedules.map((schedule, index) => (
                        <ScheduleCard key={index}></ScheduleCard>
                      ))
                    ) : (
                      <Button styled="primary">新增行程</Button>
                    )}
                    {provided.placeholder}
                  </CardWrapper>
                )}
              </Droppable>
            </Container>
          </div>
        </>
      )}
    </DragDropContext>
  );
}
function AddItinerary() {
  return <Outlet />;
}

export { AddOverView, AddSchedule, AddItinerary };
