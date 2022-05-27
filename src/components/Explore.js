import { Wrapper } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { googleMapApiKey } from '../utils/apiKey';
import { firestore } from '../utils/firebase';
import { googleMap, SearchBar } from '../utils/googleMap';
import { Context } from '../App';
import {
  RoundButton,
  RoundButtonSmall,
} from './styledComponents/Buttons/RoundButton';
import { palatte, mediaQuery, styles } from './styledComponents/basic/common';
import { P } from './styledComponents/basic/Text';
import Map from './Explore/Map';
import PlaceOverview from './Explore/PlaceOverview';
import PlaceReview from './Explore/PlaceReview';
import SavedSpotsList from './Explore/SavedSpotsList';

const Container = styled.div`
  ${styles.flex}
  height: 100vh;
  ${mediaQuery[0]} {
    flex-direction: column;
  }
`;

const SideBarContainer = styled.div`
  ${styles.flexColumn}
  background-color: ${palatte.gray[100]};
  height: 100%;
  position: relative;
  ${(props) =>
    props.placeDetail || props.isShowSavedSpots
      ? `
    flex-basis: 400px;
    max-width: 400px;
    `
      : null}
  padding: ${(props) =>
    props.isShowSavedSpots ? '30px' : props.placeDetail && '0px'};
  border-right: 1px solid ${palatte.white};
  ${mediaQuery[0]} {
    order: 1;
    height: 30%;
    max-width: 100%;
    padding: ${(props) => props.isShowSavedSpots && '20px'};
  }
`;
const MapContainer = styled.div`
  ${styles.flex}
  flex-grow:1;
  position: relative;
  ${mediaQuery[0]} {
    height: 70%;
  }
`;
const PlaceDetailContainer = styled.div`
  ${styles.flexColumn};
  height: 100%;
  gap: 20px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  ${mediaQuery[0]} {
    padding: 30px 20px;
  }
`;

const ButtonOnMap = (props) => (
  <div
    css={css`
      ${styles.flexColumn}
      gap:2px;
      align-items: center;
    `}>
    <RoundButton
      className="material-icons"
      size="60px"
      css={css`
        ${mediaQuery[0]} {
          width: 40px;
          height: 40px;
          font-size: 25px;
        }
      `}
      onClick={props.onClick}>
      {props.iconName}
    </RoundButton>
    <P
      css={css`
        font-size: 14px;
        font-weight: 500;
        color: ${palatte.gray[200]};
        &:hover {
          color: ${palatte.primary[300]};
        }
      `}>
      {props.children}
    </P>
  </div>
);
const NavigateButtonsOnMap = (props) => {
  return (
    <div
      css={css`
        ${styles.flexColumn}
        align-items: center;
        gap: 10px;
        padding: 20px 30px 20px 20px;
        position: absolute;
        background-color: ${palatte.gray[700]};
        border-radius: 20px 0 0 20px;
        top: 100px;
        right: 0px;
        z-index: 1000;
        ${mediaQuery[0]} {
          padding: 15px;
        }
      `}>
      <ButtonOnMap iconName="add_location" onClick={props.onWaitingSpotClick}>
        候補景點
      </ButtonOnMap>
      <ButtonOnMap iconName="home" onClick={props.onHomeClick}>
        回首頁
      </ButtonOnMap>
    </div>
  );
};
const ExpandButton = (props) => (
  <RoundButtonSmall
    size="30px"
    className="material-icons"
    styled="gray700"
    css={css`
      position: absolute;
      right: -15px;
      top: 10px;
      z-index: 1;
      padding: 10px;
      border: 1px solid ${palatte.white};
      ${mediaQuery[0]} {
        right: 15px;
        top: -15px;
        transform: rotate(-90deg);
      }
    `}
    onClick={props.onClick}>
    chevron_left
  </RoundButtonSmall>
);
function Explore({ setWaitingSpots }) {
  const { uid } = useContext(Context);
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  const [placeDetail, setPlaceDetail] = useState();
  const [savedSpots, setSavedSpots] = useState();
  const [isShowSavedSpots, setIsShowSavedSpots] = useState(false);
  const [isShowSideColumn, setIsShowSideColumn] = useState(false);
  const sideWindowRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (map && !savedSpots && uid) {
      firestore
        .getSavedSpots(uid, map)
        .then((res) => {
          setSavedSpots(res);
        })
        .catch((error) => console.error(error));
    }
  }, [map, savedSpots, uid]);
  const addToSavedSpots = () => {
    if (savedSpots.every((spot) => spot.place_id !== placeDetail.place_id)) {
      firestore.setSavedSpots(uid, [placeDetail]);
      if (savedSpots?.length > 0) {
        setSavedSpots([...savedSpots, placeDetail]);
      } else {
        setSavedSpots([placeDetail]);
      }
      setIsShowSavedSpots(true);
      setIsShowSideColumn(true);
      sideWindowRef.current.scrollTop = sideWindowRef.current.scrollHeight;
    }
  };
  const removeFromSavedSpots = (idAry) => {
    let newSavedSpots = [...savedSpots];
    idAry.forEach((id) => {
      newSavedSpots.forEach((spot, index, array) => {
        if (spot.place_id === id) {
          array.splice(index, 1);
        }
      });
    });
    firestore
      .deleteSavedSpots(uid, idAry)
      .then(() => {
        setSavedSpots(newSavedSpots);
      })
      .catch((error) => console.error(error));
  };

  const getSavedSpotDetail = (spot) => {
    setIsShowSavedSpots(false);
    setPlaceDetail({ ...spot, savedSpot: true });
    if (marker) {
      googleMap.deleteMarker(marker);
    }
    map.panTo(spot.geometry);
    setMarker(googleMap.setSelectedMarker(map, spot.geometry, spot.name));
  };
  const getPlaceShowOnMap = (detail) => {
    setMarker(googleMap.setSelectedMarker(map, detail.geometry, detail.name));
    map.panTo(detail.geometry);
    setPlaceDetail(detail);
    setIsShowSideColumn(true);
  };
  const resetMap = (closeSideColumn) => {
    googleMap.deleteMarker(marker);
    googleMap.setMapStyle(map, 'default');
    if (closeSideColumn) {
      setIsShowSideColumn(false);
    }
  };
  return (
    <>
      {uid && (
        <>
          <Container>
            {isShowSideColumn && (
              <SideBarContainer
                placeDetail={placeDetail && true}
                isShowSavedSpots={isShowSavedSpots}
                ref={sideWindowRef}>
                <ExpandButton
                  onClick={() => {
                    setIsShowSideColumn(false);
                    if (placeDetail) {
                      googleMap.deleteMarker(marker);
                      googleMap.setMapStyle(map, 'default');
                    }
                  }}
                />
                {!isShowSavedSpots && placeDetail && (
                  <PlaceDetailContainer>
                    <PlaceOverview
                      isSavedSpot={savedSpots.some(
                        (spot) => spot.place_id === placeDetail.place_id
                      )}
                      spotName={placeDetail.name}
                      address={placeDetail.formatted_address}
                      imgUrl={placeDetail.photos[0]}
                      rating={placeDetail.rating}
                      website={
                        placeDetail.website !== '未提供' && placeDetail.website
                      }
                      buttonAction={() =>
                        savedSpots.some(
                          (spot) => spot.place_id === placeDetail.place_id
                        )
                          ? removeFromSavedSpots([placeDetail.place_id])
                          : addToSavedSpots()
                      }
                      openingHours={
                        placeDetail.opening_hours.weekday_text !== '未提供' &&
                        placeDetail.opening_hours.weekday_text
                      }
                    />
                    <PlaceReview
                      reviews={
                        placeDetail.reviews !== '未提供' && placeDetail.reviews
                      }
                    />
                  </PlaceDetailContainer>
                )}
                {isShowSavedSpots && savedSpots?.length > 0 && (
                  <SavedSpotsList
                    savedSpots={savedSpots}
                    removeFromSavedSpots={removeFromSavedSpots}
                    getSavedSpotDetail={getSavedSpotDetail}
                    setWaitingSpots={setWaitingSpots}
                  />
                )}
                {isShowSavedSpots && savedSpots?.length === 0 && (
                  <P>還沒有加入的景點喔！請點選地圖上的圖標加入景點</P>
                )}
              </SideBarContainer>
            )}
            <MapContainer>
              <NavigateButtonsOnMap
                onWaitingSpotClick={() => {
                  if (!isShowSideColumn) {
                    setIsShowSavedSpots(true);
                    setIsShowSideColumn(true);
                  } else if (isShowSavedSpots) {
                    setIsShowSideColumn(false);
                    setIsShowSavedSpots(false);
                  } else {
                    setIsShowSavedSpots(true);
                    resetMap();
                  }
                }}
                onHomeClick={() => navigate('/itineraries')}
              />
              {map && (
                <SearchBar
                  placeholder="請輸入地址或關鍵字搜尋"
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  option="default"
                  addCss={{
                    container: {
                      left: '15px',
                      [mediaQuery[0]]: {
                        left: '0',
                      },
                    },
                  }}
                />
              )}
              <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
                <Map
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  setMap={setMap}
                  map={map}
                  setMarker={setMarker}
                  marker={marker}
                  setIsShowSavedSpots={setIsShowSavedSpots}
                  resetMap={resetMap}
                />
              </Wrapper>
            </MapContainer>
          </Container>
        </>
      )}
    </>
  );
}

export default Explore;
