import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
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

function AddSchedule() {
  const [data, setData] = useState();
  const { itineraryId } = useParams();
  const { uid } = useContext(Context);
  const timestampToString = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };
  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId)
        .then((res) => setData(res))
        .catch((error) => console.log(error));
    }
  }, [uid, itineraryId]);
  return (
    <>
      <p>id: {itineraryId}</p>
      {data && (
        <>
          <h2>{data.title}</h2>
          <p>
            {timestampToString(data.start_date)} -
            {timestampToString(data.end_date)}
          </p>
          <div>
            <p>待定景點</p>
            <CardWrapper>
              {data.waitingSpots?.map((spot) => (
                <Card
                  key={spot.place_id}
                  column
                  gap="20px"
                  position="relative"
                  basis="350px">
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
                </Card>
              ))}
            </CardWrapper>
          </div>
        </>
      )}
    </>
  );
}
function AddItinerary() {
  return <Outlet />;
}

export { AddOverView, AddSchedule, AddItinerary };
