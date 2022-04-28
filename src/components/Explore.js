import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firestore } from '../utils/firebase';
import { googleMap } from '../utils/googleMap';
import { Context } from '../App';
import { RoundButton, Button } from './styledComponents/Button';
import {
  FlexDiv,
  FlexChildDiv,
  Card,
  CardWrapper,
} from './styledComponents/Layout';
import {
  CheckboxCustom,
  inputBase,
  TextInput,
  SelectAllCheckBox,
} from './styledComponents/Form';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

function Map({
  setPlaceDetail,
  setMap,
  map,
  marker,
  setMarker,
  setShowSavedSpots,
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
          setShowSavedSpots(false);
          if (marker) {
            googleMap.deleteMarker(marker);
          } else {
            googleMap
              .getPlaceDetails(map, e.placeId)
              .then((detail) => {
                setMarker(
                  googleMap.setSelectedMarker(map, detail.geometry, detail.name)
                );
                map.panTo(detail.geometry);
                setPlaceDetail(detail);
              })
              .catch((status) => {
                console.log(status);
              });
          }
        } else {
          if (marker) {
            googleMap.deleteMarker(marker);
            googleMap.setMapStyle(map, 'default');
            setPlaceDetail(undefined);
          }
        }
        e.stop();
      });
    }
  }, [map, marker]);

  return <div style={{ width: '100%', height: '100vh' }} ref={ref} />;
}

const RoundBtnOnMap = styled(RoundButton)`
  width: 60px;
  height: 60px;
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: 1000;
  border: 2px solid white;
`;

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
        {placeDetail.reviews.map((review) => (
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
  const [addAction, setAddAction] = useState();
  const [createdItineraries, setCreatedItineraries] = useState();

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
  return (
    <>
      <SelectAllCheckBox
        setAllChecked={() =>
          setSelectedSpotList(props.savedSpots.map((spot) => spot.place_id))
        }
        setAllUnchecked={() => setSelectedSpotList([])}
      />

      <CardWrapper column gap="20px" padding="15px 5px 15px 7px">
        {props.savedSpots.map((spot) => (
          <Card column gap="20px" position="relative" key={spot.place_id}>
            <CheckboxCustom
              id={spot.place_id}
              selectedList={selectedSpotList}
              setSelectedList={setSelectedSpotList}
            />
            <div onClick={() => props.getSavedSpotDetail(spot)}>
              <img
                src={spot?.photos[0]}
                style={{ width: '100%', objectFit: 'cover' }}
                alt="spot"
              />
              <FlexChildDiv>
                <h3>{spot.name}</h3>
                <p>{spot.formatted_address}</p>
                <p>{spot.rating}</p>
              </FlexChildDiv>
            </div>
          </Card>
        ))}
        <TextInput as="select" onChange={(e) => setAddAction(e.target.value)}>
          <option value="">---請選擇要加入景點的行程---</option>
          <option value="add">新行程</option>
          {createdItineraries?.map((itinerary) => (
            <option value={itinerary.itinerary_id} key={itinerary.itinerary_id}>
              {itinerary.title}
            </option>
          ))}
        </TextInput>
        <Button styled="primary" onClick={addSelectSpotsToItinerary}>
          加入行程
        </Button>
        <Button
          styled="danger"
          onClick={() => props.removeFromSavedSpots(selectedSpotList)}>
          刪除景點
        </Button>
      </CardWrapper>
    </>
  );
}

const searchIcon = css`
  position: absolute;
  background-color: transparent;
  right: 6px;
  top: calc(50% - 12px);
`;
function SearchBar(props) {
  const ref = useRef();
  const [input, setInput] = useState();

  useEffect(() => {
    if (ref.current) {
      const autocomplete = googleMap.initAutocomplete(ref.current);
      autocomplete.addListener('place_changed', () => {
        const place = googleMap.composePlaceDetailData(autocomplete.getPlace());
        console.log(place);
        if (place.geometry && place.name) {
          props.setPlaceDetail(place);
          props.setMarker(
            googleMap.setSelectedMarker(props.map, place.geometry, place.name)
          );
          props.map.panTo(place.geometry);
          props.setShowSavedSpots(false);
        }
      });
    }
  }, []);
  useEffect(() => {
    if (props.inputValue) {
      setInput(props.inputValue);
    }
  }, [props.inputValue]);

  return (
    <div
      css={css`
        position: absolute;
        z-index: 8;
        width: 500px;
        padding: 20px;
      `}>
      <div
        css={css`
          position: relative;
        `}>
        <input
          onFocus={(e) => e.target.select()}
          css={css`
            ${inputBase}
            width: 100%;
          `}
          ref={ref}
        />
        <div
          css={css`
            ${searchIcon}
          `}
          className="material-icons">
          search
        </div>
      </div>
    </div>
  );
}
function Explore({ setWaitingSpots }) {
  const { uid } = useContext(Context);
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  const [placeDetail, setPlaceDetail] = useState();
  const [savedSpots, setSavedSpots] = useState();
  const [showSavedSpots, setShowSavedSpots] = useState(false);
  const sideWindowRef = useRef();
  const [searchInputValue, setSearchInputValue] = useState('');

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
      setShowSavedSpots(true);
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
    setShowSavedSpots(false);
    setPlaceDetail({ ...spot, savedSpot: true });
    if (marker) {
      googleMap.deleteMarker(marker);
    }
    map.panTo(spot.geometry);
    setMarker(googleMap.setSelectedMarker(map, spot.geometry, spot.name));
  };
  return (
    <>
      {uid && (
        <>
          <FlexDiv height="100vh">
            <FlexChildDiv
              ref={sideWindowRef}
              basis={placeDetail || showSavedSpots ? '400px' : null}
              overflow="scroll"
              padding={placeDetail || showSavedSpots ? '15px 15px' : null}>
              {!showSavedSpots && placeDetail && (
                <PlaceDetail
                  placeDetail={placeDetail}
                  addToSavedSpots={addToSavedSpots}
                  removeFromSavedSpots={removeFromSavedSpots}
                />
              )}
              {showSavedSpots && savedSpots?.length > 0 && (
                <SavedSpotsList
                  savedSpots={savedSpots}
                  removeFromSavedSpots={removeFromSavedSpots}
                  getSavedSpotDetail={getSavedSpotDetail}
                  setWaitingSpots={setWaitingSpots}
                />
              )}
              {showSavedSpots && savedSpots?.length === 0 && (
                <h3>還沒有加入的景點喔！請點選地圖上的圖標加入景點</h3>
              )}
            </FlexChildDiv>
            <FlexChildDiv grow="1" position="relative">
              <RoundBtnOnMap onClick={() => setShowSavedSpots((prev) => !prev)}>
                候補景點
              </RoundBtnOnMap>
              <SearchBar
                setPlaceDetail={setPlaceDetail}
                map={map}
                setMarker={setMarker}
                setShowSavedSpots={setShowSavedSpots}
                inputValue={searchInputValue}
                setInputValue={setSearchInputValue}
              />
              <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
                <Map
                  setPlaceDetail={setPlaceDetail}
                  setMap={setMap}
                  map={map}
                  setMarker={setMarker}
                  marker={marker}
                  setShowSavedSpots={setShowSavedSpots}
                  setSearchInputValue={setSearchInputValue}
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
