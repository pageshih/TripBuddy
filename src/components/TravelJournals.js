import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import { Image } from './styledComponents/Layout';
import { OverviewCard } from './styledComponents/Cards';
import { FlexDiv } from './styledComponents/Layout';
import { palatte, styles, Loader } from './styledComponents/basic/common';
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
        <FlexDiv
          as="ul"
          wrap="wrap"
          gap="30px"
          addCss={styles.containerSetting}
          margin="auto auto 100px auto">
          {journals?.map((journal) => (
            <OverviewCard
              as="li"
              basis="calc(50% - 15px)"
              margin="0 0 20px 0"
              key={journal.itinerary_id}
              src={journal.cover_photo}
              alt={journal.title}
              title={journal.title}
              startDate={journal.start_date}
              endDate={journal.end_date}
              onClick={() =>
                navigate(`/travel-journals/${journal.itinerary_id}`)
              }
            />
          ))}
        </FlexDiv>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default TravelJournals;
