import { Wrapper, Status } from '@googlemaps/react-wrapper';
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
  Button,
  ButtonSmall,
  RoundButtonSmall,
} from './styledComponents/Button';
import { FlexDiv, FlexChildDiv } from './styledComponents/Layout';
import { SpotCard } from './styledComponents/Cards';
import { SelectAllCheckBox, SelectSmall } from './styledComponents/Form';
import { P, H2, palatte } from './styledComponents/basicStyle';

function Map({
  setMap,
  map,
  marker,
  setIsShowSavedSpots,
  setIsShowSideColumn,
  getPlaceShowOnMap,
}) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current));
    } else {
      googleMap.setMapStyle(map, 'default');
    }
  }, [ref, map]);

  useEffect(() => {
    if (ref.current && map) {
      window.google.maps.event.addListener(map, 'click', (e) => {
        if (e.placeId) {
          setIsShowSavedSpots(false);
          if (marker) {
            googleMap.deleteMarker(marker);
          } else {
            googleMap
              .getPlaceDetails(map, e.placeId)
              .then((detail) => {
                getPlaceShowOnMap(detail);
              })
              .catch((status) => {
                console.log(status);
              });
          }
        } else {
          if (marker) {
            googleMap.deleteMarker(marker);
            googleMap.setMapStyle(map, 'default');
            setIsShowSideColumn(false);
          }
        }
        e.stop();
      });
    }
  }, [map, marker]);

  return <div style={{ width: '100%', height: '100vh' }} ref={ref} />;
}

function PlaceDetail({ placeDetail, removeFromSavedSpots, addToSavedSpots }) {
  return (
    <>
      <img
        src={placeDetail.photos[0]}
        alt="placePhoto"
        style={{ width: '100%' }}
      />
      <h2>{placeDetail.name}</h2>
      <p>{}</p>
      <p>評分：{placeDetail.rating}</p>
      <p>地址：{placeDetail.formatted_address}</p>
      <a href={placeDetail.website}>官方網站</a>
      <Button
        styled={placeDetail.savedSpot ? 'danger' : 'primary'}
        type="button"
        display="block"
        width="100%"
        onClick={() =>
          placeDetail.savedSpot
            ? removeFromSavedSpots([placeDetail.place_id])
            : addToSavedSpots()
        }>
        {placeDetail.savedSpot ? '從候補景點中移除' : '加入候補景點'}
      </Button>
      <h3>評論</h3>
      <ul>
        {placeDetail.reviews !== '未提供' &&
          placeDetail.reviews.map((review) => (
            <li key={review.time}>
              <FlexDiv>
                <a href={review.author_url}>{review.author_name}</a>
              </FlexDiv>
              <p>{review.relative_time_description}</p>
              <p>評分：{review.rating}</p>
              <p>{review.text}</p>
            </li>
          ))}
      </ul>
    </>
  );
}

function SavedSpotsList(props) {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [selectedSpotList, setSelectedSpotList] = useState([]);
  const [addAction, setAddAction] = useState('');
  const [createdItineraries, setCreatedItineraries] = useState();
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    firestore
      .getItineraries(uid, new Date().getTime())
      .then((res) => setCreatedItineraries(res))
      .catch((error) => console.error(error));
  }, []);
  const addSelectSpotsToItinerary = () => {
    if (selectedSpotList?.length > 0) {
      const waitingSpots = props.savedSpots.filter(
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
  const shadow = css`
    position: absolute;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0),
      ${palatte.shadow}
    );
    width: 100%;
    height: 30px;
    top: -50px;
  `;
  return (
    <FlexDiv direction="column" maxHeight="calc(100% - 30px)" gap="25px">
      <FlexDiv justifyContent="space-between" alignItems="flex-end">
        <H2 fontSize="24px">候補景點</H2>
        <SelectAllCheckBox
          size="20px"
          isSelectAll={isSelectAll}
          setIsSelectAll={setIsSelectAll}
          setAllChecked={() =>
            setSelectedSpotList(props.savedSpots.map((spot) => spot.place_id))
          }
          setAllUnchecked={() => setSelectedSpotList([])}
        />
      </FlexDiv>
      <FlexChildDiv direction="column" height="calc(100% - 30px)" gap="20px">
        <FlexChildDiv
          direction="column"
          overflowY="auto"
          shrink="1"
          gap="30px"
          padding="0 0 10px 0"
          position="relative"
          addCss={css`
            &::-webkit-scrollbar {
              display: none;
            }
          `}>
          {props.savedSpots.map((spot) => (
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
              onClick={() => props.getSavedSpotDetail(spot)}
            />
          ))}
        </FlexChildDiv>
        {selectedSpotList?.length > 0 && (
          <FlexChildDiv
            direction="column"
            gap="15px"
            padding="0 0 10px 0"
            position="relative">
            <div css={shadow}></div>
            <SelectSmall
              value={addAction}
              onChange={(e) => setAddAction(e.target.value)}>
              <option value="" disabled>
                ---請選擇要加入景點的行程---
              </option>
              <option value="add">新行程</option>
              {createdItineraries?.map((itinerary) => (
                <option
                  value={itinerary.itinerary_id}
                  key={itinerary.itinerary_id}>
                  {itinerary.title}
                </option>
              ))}
            </SelectSmall>
            <ButtonSmall styled="primary" onClick={addSelectSpotsToItinerary}>
              加入行程
            </ButtonSmall>
            <ButtonSmall
              styled="danger"
              onClick={() => props.removeFromSavedSpots(selectedSpotList)}>
              刪除景點
            </ButtonSmall>
          </FlexChildDiv>
        )}
      </FlexChildDiv>
    </FlexDiv>
  );
}
const ButtonOnMap = (props) => (
  <FlexDiv direction="column" gap="2px" alignItems="center">
    <RoundButton
      className="material-icons"
      size="60px"
      border
      borderColor={palatte.white}
      onClick={props.onClick}>
      {props.iconName}
    </RoundButton>
    <P
      fontSize="14px"
      fontWeight="700"
      color={palatte.gray[700]}
      addCss={css`
        text-shadow: -2px -2px 0 ${palatte.white}, 2px -2px 0 ${palatte.white},
          -2px 2px ${palatte.white}, 2px 2px ${palatte.white};
      `}>
      {props.children}
    </P>
  </FlexDiv>
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
    } else {
      alert('此景點已在候補清單中！');
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
      .catch((error) => console.log(error));
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
  const expandButton = css`
    position: absolute;
    right: -15px;
    top: 10px;
    z-index: 1;
    padding: 5px;
    border: 1px solid ${palatte.white};
  `;
  return (
    <>
      {uid && (
        <>
          <FlexDiv height="100vh">
            {isShowSideColumn ? (
              <FlexChildDiv
                backgroundColor={palatte.gray[100]}
                direction="column"
                height="100%"
                position="relative"
                addCss={css`
                  border-right: 1px solid ${palatte.white};
                `}
                ref={sideWindowRef}
                basis={placeDetail || isShowSavedSpots ? '400px' : null}
                padding={placeDetail || isShowSavedSpots ? '30px' : null}>
                <RoundButtonSmall
                  size="20px"
                  className="material-icons"
                  styled="gray500"
                  addCss={expandButton}
                  onClick={() => {
                    setIsShowSideColumn(false);
                    if (placeDetail) {
                      googleMap.deleteMarker(marker);
                      googleMap.setMapStyle(map, 'default');
                    }
                  }}>
                  chevron_left
                </RoundButtonSmall>
                <FlexDiv direction="column" overflowY="auto">
                  {!isShowSavedSpots && placeDetail && (
                    <PlaceDetail
                      placeDetail={placeDetail}
                      addToSavedSpots={addToSavedSpots}
                      removeFromSavedSpots={removeFromSavedSpots}
                    />
                  )}
                </FlexDiv>
                {isShowSavedSpots && savedSpots?.length > 0 && (
                  <SavedSpotsList
                    savedSpots={savedSpots}
                    removeFromSavedSpots={removeFromSavedSpots}
                    getSavedSpotDetail={getSavedSpotDetail}
                    setWaitingSpots={setWaitingSpots}
                  />
                )}
                {isShowSavedSpots && savedSpots?.length === 0 && (
                  <h3>還沒有加入的景點喔！請點選地圖上的圖標加入景點</h3>
                )}
              </FlexChildDiv>
            ) : null}
            <FlexChildDiv grow="1" position="relative">
              <FlexDiv
                direction="column"
                alignItems="center"
                gap="10px"
                css={css`
                  position: absolute;
                  top: 100px;
                  right: 30px;
                  z-index: 1000;
                `}>
                <ButtonOnMap
                  iconName="add_location"
                  onClick={() => {
                    setIsShowSavedSpots(true);
                    setIsShowSideColumn(true);
                  }}>
                  候補景點
                </ButtonOnMap>
                <ButtonOnMap
                  iconName="home"
                  onClick={() => navigate('/itineraries')}>
                  回首頁
                </ButtonOnMap>
              </FlexDiv>
              {map && (
                <SearchBar
                  placeholder="請輸入地址或關鍵字搜尋"
                  getPlaceShowOnMap={getPlaceShowOnMap}
                  option="default"
                  addCss={{
                    container: {
                      left: '15px',
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
                  setIsShowSideColumn={setIsShowSideColumn}
                />
              </Wrapper>
            </FlexChildDiv>
          </FlexDiv>
        </>
      )}
    </>
  );
}

export default Explore;
