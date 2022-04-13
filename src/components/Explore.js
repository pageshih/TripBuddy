import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firebaseAuth, firestore } from '../utils/firebase';
import googleMap from '../utils/googleMap';
import { UidContext } from '../App';
import { RoundButton, Button } from '../utils/Button';
import { FlexDiv, FlexChildDiv, Card, CardWrapper } from '../utils/Layout';
import styled from '@emotion/styled';

const featureShowPattern = {
  default: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'poi.attraction',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'poi.park',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'poi.place_of_worship',
      stylers: [{ visibility: 'on' }],
    },
  ],
  hideAll: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

function Map({
  setPlaceDetail,
  setMap,
  map,
  marker,
  setMarker,
  setShowSavedSpots,
}) {
  const ref = useRef();
  const center = {
    lat: 25.038621247241373,
    lng: 121.53236932147014,
  };
  const zoom = 16;

  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current, center, zoom));
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

function Explore() {
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  const { uid, setUid } = useContext(UidContext);
  const navigate = useNavigate();
  const [placeDetail, setPlaceDetail] = useState();
  const [savedSpots, setSavedSpots] = useState();
  const [showSavedSpots, setShowSavedSpots] = useState(false);
  const [addSpotList, setAddSpotList] = useState([]);

  const CheckboxDiv = styled.div`
    color: white;
    border: 1px solid lightgray;
    border-radius: 5px;
    align-self: flex-start;
    position: absolute;
    top: -10px;
    left: -10px;
    background-color: ${(props) =>
      addSpotList?.some((item) => item === props.id) ? 'skyblue' : 'white'};
    cursor: pointer;
  `;
  const addToSavedSpots = () => {
    firestore.setSavedSpots(uid, placeDetail);
  };
  const getSavedSpots = () => {
    if (!showSavedSpots) {
      setShowSavedSpots(true);
      if (!savedSpots) {
        firestore
          .getSavedSpots(uid)
          .then((res) => setSavedSpots(res))
          .catch((error) => console.error(error));
      }
    } else if (showSavedSpots) {
      setShowSavedSpots(false);
    }
  };
  const savedSpotDetail = (spot) => {
    setShowSavedSpots(false);
    setPlaceDetail({ ...spot, savedSpot: true });
    googleMap.deleteMarker(marker);
    map.panTo(spot.geometry);
    setMarker(googleMap.setSelectedMarker(map, spot.geometry, spot.name));
  };
  useEffect(() => {
    if (uid) {
      console.log(uid);
    } else {
      firebaseAuth.checkIsLogIn(
        (userImpl) => {
          if (userImpl) {
            setUid(userImpl.uid);
          } else {
            alert('請先登入');
            navigate('/login');
          }
        },
        (error) => console.log(error)
      );
    }
  }, [uid, setUid]);
  return (
    <>
      {uid && (
        <FlexDiv height="100vh">
          <FlexChildDiv
            basis={placeDetail || showSavedSpots ? '500px' : null}
            overflow="scroll"
            padding={placeDetail || showSavedSpots ? '15px 20px' : null}>
            {!showSavedSpots && placeDetail && (
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
                  onClick={addToSavedSpots}>
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
            )}
            {showSavedSpots && savedSpots && (
              <CardWrapper column gap="20px">
                {savedSpots.map((spot) => (
                  <Card
                    column
                    gap="20px"
                    position="relative"
                    key={spot.place_id}
                    onClick={savedSpotDetail(spot)}>
                    <label name={spot.place_id}>
                      <CheckboxDiv
                        id={spot.place_id}
                        className="material-icons">
                        check
                      </CheckboxDiv>
                      <input
                        type="checkbox"
                        style={{ display: 'none' }}
                        id={spot.place_id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddSpotList([...addSpotList, e.target.id]);
                          } else {
                            setAddSpotList(
                              addSpotList.filter((item) => item !== e.target.id)
                            );
                          }
                        }}
                      />
                    </label>
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
                  </Card>
                ))}
                <Button styled="danger">刪除景點</Button>
                <Button styled="primary">加入行程</Button>
              </CardWrapper>
            )}
          </FlexChildDiv>
          <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
            <RoundBtnOnMap onClick={getSavedSpots}>候補景點</RoundBtnOnMap>
            <Map
              setPlaceDetail={setPlaceDetail}
              setMap={setMap}
              map={map}
              setMarker={setMarker}
              marker={marker}
              setShowSavedSpots={setShowSavedSpots}
            />
          </Wrapper>
        </FlexDiv>
      )}
    </>
  );
}

export default Explore;
