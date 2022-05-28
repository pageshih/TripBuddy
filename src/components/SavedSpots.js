import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  mediaQuery,
  palatte,
  styles,
  Loader,
} from './styledComponents/basic/common';
import { P } from './styledComponents/basic/Text';
import { SpotCard } from './styledComponents/Cards/SpotCard';
import { SelectAllCheckBox } from './styledComponents/Form';
import { Button } from './styledComponents/Buttons/Button';
import { AddSpotToItineraryController } from './EditItinerary/AddSpotToItineraryController';

const Container = styled.div`
  ${styles.flexColumn};
  ${styles.containerSetting};
  gap: 40px;
  padding-bottom: 80px;
`;
const ControllerWrapper = styled.div`
  ${styles.flex}
  gap: 20px;
  justify-content: space-between;
  padding: 0 10px 20px 10px;
  border-bottom: 1px solid ${palatte.gray['400']};
`;
const Description = styled(P)`
  text-align: center;
  color: ${palatte.gray[700]};
`;
const ExploreButton = styled(Button)`
  margin: 20px auto;
  width: fit-content;
  ${mediaQuery[0]} {
    width: 100%;
  }
`;
function SavedSpots({ setWaitingSpots }) {
  const { uid, map, dispatchNotification } = useContext(Context);
  const [savedSpots, setSavedSpots] = useState();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);

  const navigate = useNavigate();
  const deleteSpots = () => {
    const newSavedSpots = savedSpots.filter((spot) => {
      return (
        selectedSpotList.every((selectedId) => selectedId !== spot.place_id) &&
        spot
      );
    });
    setSavedSpots(newSavedSpots);
    firestore
      .deleteSavedSpots(uid, selectedSpotList)
      .catch((error) => console.error(error));
  };
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0 && addAction) {
      const waitingSpots = savedSpots.filter(
        (spot) =>
          selectedSpotList.some((selectedId) => spot.place_id === selectedId) &&
          spot
      );

      if (addAction === 'add') {
        setWaitingSpots(waitingSpots);
        navigate('/add');
      } else {
        firestore
          .setWaitingSpots(uid, addAction, waitingSpots)
          .then(() => navigate(`/add/${addAction}`))
          .catch((error) => console.error(error));
      }
    } else {
      const playload = {
        type: 'warn',
        message: '還沒有選擇景點喔！',
        id: 'tooltip_addSpots',
      };
      if (selectedSpotList?.length <= 0) {
        dispatchNotification({
          type: 'fire',
          playload,
        });
      } else if (!addAction) {
        playload.message = '請選擇要加入景點的行程';
        dispatchNotification({
          type: 'fire',
          playload,
        });
      }
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
      <Container>
        <ControllerWrapper>
          <SelectAllCheckBox
            isSelectAll={isSelectAll}
            setIsSelectAll={setIsSelectAll}
            setAllChecked={() =>
              setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
            }
            setAllUnchecked={() => setSelectedSpotList([])}
          />
          <AddSpotToItineraryController
            createdItineraries={createdItineraries}
            choseItinerary={addAction}
            onChangeItinerary={(e) => setAddAction(e.target.value)}
            addAction={addSelectSpotsToItinerary}
            deleteAction={deleteSpots}
            selectedSpots={selectedSpotList}
          />
        </ControllerWrapper>

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
        {savedSpots ? (
          savedSpots.length === 0 && (
            <Description>沒有已儲存的候補景點</Description>
          )
        ) : (
          <Loader />
        )}
        <ExploreButton
          styled="primary"
          type="click"
          onClick={() => navigate('/explore')}>
          新增景點
        </ExploreButton>
      </Container>
    </>
  );
}

SavedSpots.propTypes = {
  setWaitingSpots: PropTypes.func,
};

export default SavedSpots;
