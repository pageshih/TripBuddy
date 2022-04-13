import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firebaseAuth, firestore } from '../utils/firebase';
import googleMap from '../utils/googleMap';
import { UidContext } from '../App';
import { RoundButton, Button } from '../utils/Button';
import { FlexDiv, FlexChildDiv } from '../utils/Layout';
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

const RoundBtnOnMap = styled(RoundButton)`
  width: 60px;
  height: 60px;
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: 1000;
  border: 2px solid white;
`;

function Map({ setPlaceDetail }) {
  const ref = useRef();
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  const center = {
    lat: 25.038621247241373,
    lng: 121.53236932147014,
  };
  const zoom = 16;

  useEffect(() => {
    if (ref.current && !map) {
      setMap(googleMap.initMap(ref.current, center, zoom));
    } else {
      googleMap.setMapStyle(map, featureShowPattern.default);
    }
  }, [ref, map]);

  useEffect(() => {
    if (ref.current && map) {
      window.google.maps.event.addListener(map, 'click', (e) => {
        if (e.placeId) {
          googleMap.setMapStyle(map, featureShowPattern.hideAll);
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
            googleMap.setMapStyle(map, featureShowPattern.default);
            setPlaceDetail(undefined);
          }
        }
        e.stop();
      });
    }
  }, [map, marker]);

  return <div style={{ width: '100%', height: '100vh' }} ref={ref} />;
}

function Explore() {
  const { uid, setUid } = useContext(UidContext);
  const navigate = useNavigate();
  const [placeDetail, setPlaceDetail] = useState();
  const [savedSpots, setSavedSpots] = useState();

  const addToSavedSpots = () => {
    firestore.setSavedSpots(uid, placeDetail);
  };
  const getSavedSpots = () => {
    firestore.getSavedSpots().then((res) => console.log(res));
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
            basis={placeDetail && '500px'}
            overflow="scroll"
            padding={placeDetail && '15px 20px'}>
            {placeDetail && (
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
                  primary
                  display="block"
                  width="100%"
                  onClick={addToSavedSpots}>
                  加入候補景點
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
          </FlexChildDiv>
          <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
            <RoundBtnOnMap onClick={getSavedSpots}>候補景點</RoundBtnOnMap>
            <Map setPlaceDetail={setPlaceDetail} />
          </Wrapper>
        </FlexDiv>
      )}
    </>
  );
}

export default Explore;
