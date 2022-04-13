import { useContext, useEffect, useState } from 'react';
import { Context } from '../App';
import { TextInput } from '../utils/TextField';
import { Container } from '../utils/Layout';
import { FlexDiv, FlexChildDiv, Card, CardWrapper } from '../utils/Layout';

function AddItinerary({ setWaitingSpots, waitingSpots }) {
  const { uid, setUid } = useContext(Context);
  const [step, setStep] = useState(0);
  const addOverView = [
    {
      title: '為這趟旅程取個名字吧！',
      type: 'text',
      placeholder: '請輸入行程名稱',
    },
    {
      title: '您選擇了這些景點：',
      type: 'cards',
    },
    {
      title: '預計要去玩幾天呢？',
      type: 'calender',
    },
  ];

  return (
    <Container maxWidth="1200px" margin="80px auto 0px auto">
      <h2>為這趟旅程取個名字吧！</h2>
      <TextInput type="text" placeholder="請輸入行程名稱" />
      <h2>您選擇了這些景點：</h2>
      <CardWrapper gap="20px">
        {waitingSpots?.map((spot) => {
          return (
            <Card column gap="20px" position="relative" key={spot.place_id}>
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
    </Container>
  );
}

export default AddItinerary;
