import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
} from './styledComponents/Layout';
import {
  CheckboxCustom,
  SelectAllCheckBox,
} from './styledComponents/TextField';

function SavedSpots(props) {
  const { uid, map } = useContext(Context);
  const [savedSpots, setSavedSpots] = useState();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState();
  const [createdItineraries, setCreatedItineraries] = useState();

  const navigate = useNavigate();
  const deleteSpots = () => {
    const isDelete = window.confirm('確定要刪除這些景點嗎？(此動作無法復原）');
    if (isDelete) {
      const newSavedSpots = savedSpots.filter((spot) => {
        return (
          selectedSpotList.every(
            (selectedId) => selectedId !== spot.place_id
          ) && spot
        );
      });
      setSavedSpots(newSavedSpots);
      firestore
        .deleteSavedSpots(uid, selectedSpotList)
        .then(() => alert('景點已刪除！'))
        .catch((error) => console.error(error));
    }
  };
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0) {
      const waitingSpots = savedSpots.filter(
        (spot) =>
          selectedSpotList.some((selectedId) => spot.place_id === selectedId) &&
          spot
      );

      if (addAction === 'add') {
        props.setWaitingSpots(waitingSpots);
        navigate('/add');
      } else {
        firestore
          .setWaitingSpots(uid, addAction, waitingSpots)
          .then(() => navigate(`/add/${addAction}`))
          .catch((error) => console.error(error));
      }
    } else {
      alert('還沒有選擇景點喔！');
    }
  };
  useEffect(() => {
    if (map) {
      firestore
        .getSavedSpots(uid, map)
        .then((res) => setSavedSpots(res))
        .catch((error) => console.error(error));
      firestore
        .getItineraries(uid, new Date().getTime())
        .then((res) => setCreatedItineraries(res))
        .catch((error) => console.error(error));
    }
  }, [map]);
  return (
    <>
      <FlexDiv gap="20px" justifyContent="flex-end" padding="20px">
        <select onChange={(e) => setAddAction(e.target.value)}>
          <option value="">---選擇要加入景點的行程---</option>
          <option value="add">建立一個新行程</option>
          {createdItineraries?.map((itinerary) => (
            <option key={itinerary.itinerary_id} value={itinerary.itinerary_id}>
              {itinerary.title}
            </option>
          ))}
        </select>
        <button type="click" onClick={addSelectSpotsToItinerary}>
          加入行程
        </button>
        <button type="click" onClick={deleteSpots}>
          刪除景點
        </button>
      </FlexDiv>
      <SelectAllCheckBox
        padding="0 12px"
        setAllChecked={() =>
          setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
        }
        setAllUnchecked={() => setSelectedSpotList([])}
      />
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
        <button type="click" onClick={() => navigate('/explore')}>
          新增景點
        </button>
      </CardWrapper>
    </>
  );
}

export default SavedSpots;
