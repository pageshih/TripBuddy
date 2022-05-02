import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import { styles, palatte, H4 } from './styledComponents/basicStyle';
import { FlexDiv, Container } from './styledComponents/Layout';
import { Card, ScheduleCard } from './styledComponents/Cards';
import { AddReview } from './EditReview';

function Itineraries() {
  const { uid, map } = useContext(Context);
  const navigate = useNavigate();
  const [empty, setEmpty] = useState();
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();
  const { reviewTags } = useOutletContext();

  useEffect(() => {
    firestore
      .getItineraries(uid, now)
      .then((overviews) => {
        if (overviews?.length <= 0) {
          setEmpty(true);
        } else {
          setEmpty(false);
          const itineraries = {
            coming: [],
            future: [],
          };
          overviews.forEach(async (itinerary) => {
            const countDownDay = Math.floor(
              (itinerary.start_date - now) / (24 * 60 * 60 * 1000)
            );
            const tripDays =
              (itinerary.end_date - itinerary.start_date) /
              (24 * 60 * 60 * 1000);
            if (countDownDay <= 0 && countDownDay + tripDays >= -1) {
              firestore
                .getScheduleWithTime(uid, itinerary.itinerary_id, now, map)
                .then((scheduleProcessing) => {
                  if (scheduleProcessing) {
                    setProgressing({
                      overview: itinerary,
                      schedule: scheduleProcessing,
                    });
                  }
                })
                .catch((error) => console.error(error));
            } else if (countDownDay < 7 && countDownDay > 0) {
              itineraries.coming.push(itinerary);
            } else if (countDownDay > 7) {
              itineraries.future.push(itinerary);
            }
          });
          setComing(itineraries.coming);
          setFuture(itineraries.future);
        }
      })
      .catch((error) => console.error(error));
  }, []);
  const foldContainer = css`
    display: flex;
    gap: 50px;
    flex-direction: column;
    border-radius: 10px;
    background-color: ${palatte.gray['100']};
    padding: 40px 60px;
  `;

  return (
    <Container
      padding={`0 ${styles.container_padding} 100px ${styles.container_padding}`}
      maxWidth={styles.container_maxWidth}
      margin="0 auto">
      {!empty ? (
        <Container>
          <div css={foldContainer}>
            {progressing?.overview && (
              <FlexDiv justifyContent="space-between" align-items="center">
                <H4>進行中的 {progressing.overview.title}</H4>
                <span className="material-icons">expand_more</span>
              </FlexDiv>
            )}
            {progressing?.overview && (
              <FlexDiv
                as="ul"
                direction="column"
                gap="30px"
                key={progressing.overview.itinerary_id}>
                {progressing.schedule?.map((schedule) => {
                  const reviews = {
                    review_tags: schedule.review_tags,
                    gallery: schedule.gallery,
                  };
                  return (
                    <ScheduleCard
                      as="li"
                      address={schedule.placeDetail.formatted_address}
                      duration={schedule.duration}
                      transit={{
                        travelMode: schedule.travel_mode,
                        detail: schedule.transit_detail,
                      }}
                      schedule={schedule}
                      key={schedule.schedule_id}
                      onClick={() =>
                        navigate(`/${progressing.overview.itinerary_id}`)
                      }>
                      {schedule.end_time > now && schedule.start_time < now && (
                        <AddReview
                          key={schedule.schedule_id}
                          itineraryId={progressing.overview.itinerary_id}
                          scheduleId={schedule.schedule_id}
                          allReviewTags={reviewTags}
                          showReviewTags={schedule.review_tags}
                          reviews={reviews}
                          isEdit
                        />
                      )}
                    </ScheduleCard>
                  );
                })}
              </FlexDiv>
            )}
          </div>
          {coming?.length > 0 && <h2>即將到來的行程</h2>}
          {coming?.map((itinerary) => (
            <Card
              key={itinerary.itinerary_id}
              gap="20px"
              onClick={() => {
                navigate(`/${itinerary.itinerary_id}`);
              }}>
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
          ))}
          {future?.length > 0 && <h2>其他行程</h2>}
          {future?.map((itinerary) => (
            <Card
              key={itinerary.itinerary_id}
              gap="20px"
              onClick={() => {
                navigate(`/${itinerary.itinerary_id}`);
              }}>
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
          ))}
        </Container>
      ) : (
        <>
          {empty === undefined ? (
            <p>loading...</p>
          ) : (
            <>
              <p>沒有行程可以顯示</p>
              <Link to="/explore">探索景點</Link>
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default Itineraries;
