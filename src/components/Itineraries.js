import { useContext, useEffect, useState, useRef } from 'react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import { Card, CardWrapper } from './styledComponents/Layout';

function Itineraries() {
  const { uid } = useContext(Context);
  const [itineraries, setItineraries] = useState();
  useEffect(() => {
    firestore
      .getItineraries(uid)
      .then((res) => setItineraries(res))
      .catch((error) => console.log(error));
  }, []);
  return (
    <CardWrapper column gap="20px" padding="20px">
      {itineraries ? (
        itineraries.map((itinerary) => (
          <Card key={itinerary.itinerary_id} gap="20px">
            <div
              style={{
                width: '200px',
                height: '200px',
                overflow: 'hidden',
              }}>
              <img
                src={itinerary.cover_photo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                alt="cover"
              />
            </div>
            <h1>{itinerary.title}</h1>
          </Card>
        ))
      ) : (
        <p>loading...</p>
      )}
    </CardWrapper>
  );
}

export default Itineraries;
