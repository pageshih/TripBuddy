import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import OverviewCard from './styledComponents/Cards/OverviewCard';
import { styles, Loader, palatte } from './styledComponents/basic/common';
import { P } from './styledComponents/basic/Text';

const Container = styled.ul`
  ${styles.flex}
  ${styles.containerSetting}
  flex-wrap:wrap;
  gap: 30px;
  margin: auto auto 100px auto;
`;
const Description = styled(P)`
  text-align: center;
  color: ${palatte.gray['700']};
`;
function TravelJournals() {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [journals, setJournals] = useState();
  useEffect(() => {
    if (uid) {
      const now = new Date().getTime();
      firestore
        .getItineraries(uid, now, true)
        .then((overviews) => {
          setJournals(overviews);
        })
        .catch((error) => console.error(error));
    }
  }, [uid]);
  return (
    <>
      {journals ? (
        <>
          {journals.length > 0 ? (
            <Container>
              {journals.map((journal) => (
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
            <Description>沒有可顯示的遊記</Description>
          )}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}

export default TravelJournals;
