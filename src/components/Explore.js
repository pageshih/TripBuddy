import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapApiKey } from '../utils/apiKey';
import { firebaseAuth, firestore } from '../utils/firebase';
import { UidContext } from '../App';
import { RoundButton } from '../utils/Button';

function Map({ center, zoom }) {
  const ref = useRef();
  const [map, setMap] = useState();
  const [infoWindow, setInfoWindow] = useState();
  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, { center, zoom }));
      setInfoWindow(new window.google.maps.InfoWindow());
    } else {
      window.google.maps.event.addListener(map, 'click', (e) => {
        console.log(e);
        e.stop();
      });
    }
  }, [ref, map]);

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
        <Wrapper apiKey={googleMapApiKey}>
          <Map center={center} zoom={zoom} />
          <RoundButton size="48px">候補</RoundButton>
          <h1>Explore</h1>
        </Wrapper>
      )}
    </>
  );
}

export default Explore;
