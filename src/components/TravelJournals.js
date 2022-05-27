import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import OverviewCard from './styledComponents/Cards/OverviewCard';
import { styles, Loader } from './styledComponents/basic/common';

const Container = styled.ul`
  ${styles.flex}
  ${styles.containerSetting}
  flex-wrap:wrap;
  gap: 30px;
  margin: auto auto 100px auto;
`;
function TravelJournals() {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [journals, setJournals] = useState();
  useEffect(() => {
    const now = new Date().getTime();
    firestore
      .getItineraries(uid, now, true)
      .then((overviews) => {
        setJournals(overviews);
      })
      .catch((error) => console.error(error));
  }, [uid]);
  return (
    <>
      {journals ? (
        <Container>
          {journals?.map((journal) => (
            <OverviewCard
              as="li"
              addCss={css`
                flex-basis: calc(50% - 15px);
                margin-bottom: 20px;
              `}
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
        </Container>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default TravelJournals;
