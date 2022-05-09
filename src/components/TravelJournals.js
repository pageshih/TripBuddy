import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import { Image } from './styledComponents/Layout';
import { Card, CardWrapper } from './styledComponents/Cards';
import { palatte, Loader } from './styledComponents/basicStyle';
import { timestampToString } from '../utils/utilities';

function TravelJournals() {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [journals, setJournals] = useState();
  const now = new Date().getTime();
  useEffect(() => {
    firestore
      .getItineraries(uid, now, true)
      .then((overviews) => {
        setJournals(overviews);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <>
      {journals ? (
        <CardWrapper column gap="20px" padding="20px">
          {journals?.map((journal) => (
            <Card
              gap="20px"
              key={journal.itinerary_id}
              onClick={() =>
                navigate(`/travel-journals/${journal.itinerary_id}`)
              }>
              <Image
                src={journal.cover_photo}
                alt={journal.title}
                width="300px"
                height="200px"
              />
              <div>
                <h2>{journal.title}</h2>
                <p>
                  {timestampToString(journal.start_date, 'date')} -{' '}
                  {timestampToString(journal.end_date, 'date')}
                </p>
              </div>
            </Card>
          ))}
        </CardWrapper>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default TravelJournals;
