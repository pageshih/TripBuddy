import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firebaseAuth, firestore } from '../utils/firebase';
import { UidContext } from '../App';
import { RoundButton } from '../utils/Button';
import { FlexDiv, FlexChildDiv } from '../utils/Layout';
import markerIcon from '../images/place_black_48dp.svg';
import '../marker.css';

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

function Map({ center, zoom }) {
  const ref = useRef();
  const [map, setMap] = useState();
  const [marker, setMarker] = useState();
  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { center, zoom }));
    } else {
      map.setOptions({
        styles: featureShowPattern.default,
      });
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (ref.current && map) {
      window.google.maps.event.addListener(map, 'click', (e) => {
        if (e.placeId) {
          map.setOptions({
            styles: featureShowPattern.hideAll,
          });
          const placeRequest = {
            placeId: e.placeId,
            fields: ['name', 'formatted_address', 'place_id', 'geometry'],
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
                    label: {
                      text: place.name,
                      color: '#de3400',
                      className: 'label',
                    },
                    icon: {
                      url: markerIcon,
                      labelOrigin: new window.google.maps.Point(25, -10),
                      size: new window.google.maps.Size(48, 48),
                    },
                  })
                );
              }
            });
          }
        } else {
          if (marker) {
            marker.setMap(null);
            map.setOptions({
              styles: featureShowPattern.default,
            });
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
  const center = { lat: 25.038621247241373, lng: 121.53236932147014 };
  const zoom = 16;
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
        <FlexDiv>
          <FlexChildDiv basis="300px">
            <RoundButton size="48px">候補</RoundButton>
            <h1>Explore</h1>
          </FlexChildDiv>
          <Wrapper apiKey={googleMapApiKey} libraries={['places']}>
            <Map center={center} zoom={zoom} />
          </Wrapper>
        </FlexDiv>
      )}
    </>
  );
}

export default Explore;
