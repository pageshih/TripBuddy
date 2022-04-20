import { useContext, useEffect, useState, useRef } from 'react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
} from './styledComponents/Layout';
import { CheckboxCustom } from './styledComponents/TextField';

function SavedSpots() {
  const { uid } = useContext(Context);
  const [savedSpots, setSavedSpots] = useState();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  useEffect(() => {
    firestore
      .getSavedSpots(uid)
      .then((res) => setSavedSpots(res))
      .catch((error) => console.error(error));
  }, []);
  return (
    <>
      <FlexDiv gap="20px" justifyContent="flex-end" padding="20px">
        <button>全選</button>
        <button>刪除景點</button>
        <button>加入既定行程</button>
        <button>加入新建立的行程</button>
      </FlexDiv>
      <CardWrapper column padding="20px" gap="20px">
        {savedSpots?.map((spot) => (
          <Card gap="20px" position="relative">
            <CheckboxCustom
              id={spot.place_id}
              selectedList={selectedSpotList}
              setSelectedList={setSelectedSpotList}
            />
            <div style={{ width: '300px', height: '200px' }}>
              <img
                src={spot.photos[0]}
                alt={spot.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3>{spot.name}</h3>
              <p>{spot.formatted_address}</p>
              <p>{spot.rating}</p>
            </div>
          </Card>
        ))}
        <button>新增景點</button>
      </CardWrapper>
    </>
  );
}

export default SavedSpots;
