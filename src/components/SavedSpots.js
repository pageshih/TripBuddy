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
  const deleteSpots = () => {
    const isDelete = window.confirm('確定要刪除這些景點嗎？(此動作無法復原）');
    if (isDelete) {
      const newSavedSpots = savedSpots.filter((spot) => {
        return (
          selectedSpotList.every((selected) => selected !== spot.place_id) &&
          spot
        );
      });
      setSavedSpots(newSavedSpots);
      firestore
        .deleteSavedSpots(uid, selectedSpotList)
        .then(() => alert('景點已刪除！'))
        .catch((error) => console.error(error));
    }
  };
  useEffect(() => {
    firestore
      .getSavedSpots(uid)
      .then((res) => setSavedSpots(res))
      .catch((error) => console.error(error));
  }, []);
  return (
    <>
      <FlexDiv gap="20px" justifyContent="flex-end" padding="20px">
        <button
          type="click"
          onClick={() =>
            setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
          }>
          全選
        </button>
        <button type="click" onClick={() => setSelectedSpotList([])}>
          取消全選
        </button>
        <button type="click" onClick={deleteSpots}>
          刪除景點
        </button>
        <button>加入既定行程</button>
        <button>加入新建立的行程</button>
      </FlexDiv>
      <CardWrapper column padding="20px" gap="20px">
        {savedSpots?.map((spot) => (
          <Card gap="20px" position="relative" key={spot.place_id}>
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
