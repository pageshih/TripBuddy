import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import { Context } from '../../App';
import { firestore } from '../../utils/firebase';
import { styles, mediaQuery } from '../styledComponents/basic/common';
import { H2 } from '../styledComponents/basic/Text';
import { SelectAllCheckBox } from '../styledComponents/Form';
import { SpotCard } from '../styledComponents/Cards/SpotCard';
import { AddSpotToItineraryController } from '../EditItinerary/AddSpotToItineraryController';

const Container = styled.div`
  ${styles.flexColumn};
  height: 100%;
  gap: 25px;
  ${mediaQuery[0]} {
    gap: 10px;
  }
`;

const HeaderContainer = styled.div`
  ${styles.flex}
  justify-content: space-between;
  align-items: flex-end;
  ${mediaQuery[0]} {
    align-items: center;
  }
`;

const SpotsContainer = styled.div`
  ${styles.flexColumn};
  overflow-y: auto;
  flex-shrink: 1;
  gap: 30px;
  padding: 0 4px 10px 0;
  position: relative;
  &::-webkit-scrollbar {
    display: none;
  }
  ${mediaQuery[0]} {
    gap: 15px;
    flex-direction: row;
    overflow-y: initial;
    overflow-x: auto;
    padding: 0;
    flex-basis: 100%;
  }
`;

const MainTitle = styled(H2)`
  font-size: 24px;
  ${mediaQuery[0]} {
    font-size: 20px;
  }
`;
const SpotsListContainer = styled.div`
  ${styles.flexColumn};
  height: calc(100% - 30px);
  gap: 20px;
  ${mediaQuery[0]} {
    gap: 10px;
  }
`;
function SavedSpotsList({
  savedSpots,
  setWaitingSpots,
  getSavedSpotDetail,
  removeFromSavedSpots,
}) {
  const { uid, dispatchNotification } = useContext(Context);
  const navigate = useNavigate();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [choseItinerary, setChoseItinerary] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    firestore
      .getItineraries(uid, new Date().getTime())
      .then((res) => setCreatedItineraries(res))
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    if (
      selectedSpotList.length === savedSpots?.length &&
      selectedSpotList.length !== 0
    ) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedSpotList, savedSpots]);
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0 && choseItinerary) {
      const waitingSpots = savedSpots.filter(
        (spot) =>
          selectedSpotList.some((selectedId) => spot.place_id === selectedId) &&
          spot
      );
      if (choseItinerary === 'add') {
        setWaitingSpots(waitingSpots);
        navigate('/add');
      } else {
        firestore
          .setWaitingSpots(uid, choseItinerary, waitingSpots)
          .then(() => navigate(`/add/${choseItinerary}`))
          .catch((error) => console.error(error));
      }
    } else {
      if (!choseItinerary) {
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'error',
            message: '請選擇要加入的行程',
            id: 'textNotification_emptyValue',
          },
        });
      }
    }
  };
  return (
    <>
      <Container>
        <HeaderContainer>
          <MainTitle>候補景點</MainTitle>
          <SelectAllCheckBox
            size="20px"
            isSelectAll={isSelectAll}
            setIsSelectAll={setIsSelectAll}
            setAllChecked={() =>
              setSelectedSpotList(savedSpots.map((spot) => spot.place_id))
            }
            setAllUnchecked={() => setSelectedSpotList([])}
          />
        </HeaderContainer>
        <SpotsListContainer>
          <SpotsContainer>
            {savedSpots.map((spot) => (
              <SpotCard
                isSmall
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
                onClick={() => getSavedSpotDetail(spot)}
              />
            ))}
          </SpotsContainer>

          {selectedSpotList?.length > 0 && (
            <AddSpotToItineraryController
              createdItineraries={createdItineraries}
              choseItinerary={choseItinerary}
              addAction={addSelectSpotsToItinerary}
              deleteAction={() => removeFromSavedSpots(selectedSpotList)}
              selectedSpots={selectedSpotList}
              onChangeItinerary={(e) => {
                setChoseItinerary(e.target.value);
              }}
              isColumn
              isShowShadow
            />
          )}
        </SpotsListContainer>
      </Container>
    </>
  );
}

SavedSpotsList.propTypes = {
  savedSpots: PropTypes.array,
  setWaitingSpots: PropTypes.func,
  getSavedSpotDetail: PropTypes.func,
  removeFromSavedSpots: PropTypes.func,
};
export default SavedSpotsList;
