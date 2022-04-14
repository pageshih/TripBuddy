import { useContext, useEffect, useState } from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Context } from '../App';
import { TextInput } from './styledComponents/TextField';
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

function AddItinerary({ setWaitingSpots, waitingSpots }) {
  const { uid, setUid } = useContext(Context);
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

  return (
    <Container maxWidth="1200px" margin="80px auto 0px auto">
      <h2>為這趟旅程取個名字吧！</h2>
      <TextInput
        type="text"
        placeholder="請輸入行程名稱"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <h2>您選擇了這些景點：</h2>
      <CardWrapper gap="20px">
        {waitingSpots?.map((spot) => {
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
      {/* <ChooseDate
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      /> */}
    </Container>
  );
}

export default AddItinerary;
