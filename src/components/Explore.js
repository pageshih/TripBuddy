import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firebaseAuth, firestore } from '../utils/firebase';
import { UidContext } from '../App';
import { RoundButton, Button } from '../utils/Button';
import { FlexDiv, FlexChildDiv } from '../utils/Layout';
import markerIcon from '../images/place_black_48dp.svg';
import '../marker.css';
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
  const selectedMarkerStyle = (labelName) => ({
    label: {
      text: labelName,
      color: '#de3400',
      className: 'label',
    },
    icon: {
      url: markerIcon,
      labelOrigin: new window.google.maps.Point(25, -10),
      size: new window.google.maps.Size(48, 48),
    },
  });

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { center, zoom }));
    } else {
      map.setOptions({
        styles: featureShowPattern.default,
      });
    }
  }, [ref, map]);

  useEffect(() => {
    if (ref.current && map) {
      window.google.maps.event.addListener(map, 'click', (e) => {
        if (e.placeId) {
          map.setOptions({
            styles: featureShowPattern.hideAll,
          });
          const placeRequest = {
            placeId: e.placeId,
          };
          if (marker) {
            marker.setMap(null);
          } else {
            const placeService = new window.google.maps.places.PlacesService(
              map
            );
            placeService.getDetails(placeRequest, (place, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.geometry &&
                place.geometry.location &&
                place.name
              ) {
                setMarker(
                  new window.google.maps.Marker({
                    map,
                    position: place.geometry.location,
                    ...selectedMarkerStyle(place.name),
                  })
                );
                map.panTo(place.geometry.location);
                const removeMethodsInPlaceDetail = {
                  name: place.name,
                  place_id: place.place_id,
                  formatted_address: place.formatted_address,
                  geometry: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  },
                  opening_hours: {
                    open_now: place.opening_hours.open_now,
                    periods: place.opening_hours.periods,
                    weekday_text: place.opening_hours.weekday_text,
                  },
                  photos: place.photos.map((item) => item.getUrl()),
                  reviews: place.reviews,
                  website: place.website,
                  rating: place.rating,
                  types: place.types,
                };
                setPlaceDetail(removeMethodsInPlaceDetail);
                console.log(place);
              }
            });
          }
        } else {
          if (marker) {
            marker.setMap(null);
            map.setOptions({
              styles: featureShowPattern.default,
            });
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
