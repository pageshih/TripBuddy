import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  mediaQuery,
  palatte,
  styles,
  Loader,
} from './styledComponents/basicStyle';
import { FlexDiv } from './styledComponents/Layout';
import { SpotCard } from './styledComponents/Cards';
import { SelectAllCheckBox, SelectSmall } from './styledComponents/Form';
import {
  Button,
  ButtonSmallOutline,
  ButtonSmall,
} from './styledComponents/Button';
import { Confirm } from './styledComponents/Modal';

function SavedSpots(props) {
  const { uid, map } = useContext(Context);
  const [savedSpots, setSavedSpots] = useState();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState();

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
      <Confirm
        isShowState={isDeleteConfirm}
        close={() => setIsDeleteConfirm(false)}
        confirmMessage="確定要刪除這些景點嗎？"
        subMessage="(此動作無法復原）"
        yesMessage="刪除"
        yesBtnStyle="danger"
        noBtnStyle="gray"
      />
      <FlexDiv
        direction="column"
        gap="40px"
        addCss={css`
          ${styles.containerSetting};
          padding-bottom: 80px;
        `}>
        <FlexDiv
          gap="20px"
          justifyContent="space-between"
          padding="0 10px 20px 10px"
          addCss={css`
            border-bottom: 1px solid ${palatte.gray['400']};
          `}>
          <SelectAllCheckBox
            isSelectAll={isSelectAll}
            setIsSelectAll={setIsSelectAll}
            setAllChecked={() =>
              setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
            }
            setAllUnchecked={() => setSelectedSpotList([])}
          />
          <FlexDiv gap="20px">
            <SelectSmall
              value={addAction}
              onChange={(e) => setAddAction(e.target.value)}>
              <option value="" disabled>
                ---選擇要加入景點的行程---
              </option>
              <option value="add">建立一個新行程</option>
              {createdItineraries?.map((itinerary) => (
                <option
                  key={itinerary.itinerary_id}
                  value={itinerary.itinerary_id}>
                  {itinerary.title}
                </option>
              ))}
            </SelectSmall>
            <ButtonSmall
              styled="primary"
              type="click"
              onClick={addSelectSpotsToItinerary}>
              加入行程
            </ButtonSmall>
            <ButtonSmallOutline
              styled="danger"
              type="click"
              onClick={() => setIsDeleteConfirm(true)}>
              刪除景點
            </ButtonSmallOutline>
          </FlexDiv>
        </FlexDiv>

        {savedSpots?.map((spot) => (
          <SpotCard
            key={spot.place_id}
            title={spot.name}
            address={spot.formatted_address}
            id={spot.place_id}
            selectedList={selectedSpotList}
            setSelectedList={setSelectedSpotList}
            imgSrc={spot.photos[0]}
            imgAlt={spot.name}
            rating={spot.rating}
            isEdit
          />
        ))}
        {!savedSpots && <Loader />}
        <Button
          styled="primary"
          type="click"
          addCss={css`
            margin: 20px auto;
            width: fit-content;
            ${mediaQuery[0]} {
              width: 100%;
            }
          `}
          onClick={() => navigate('/explore')}>
          新增景點
        </Button>
      </FlexDiv>
    </>
  );
}

export default SavedSpots;
