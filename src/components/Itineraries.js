import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import styled from '@emotion/styled';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
} from './styledComponents/Layout';
import { timestampToString } from '../utils/utilities';
import { AddReview } from './EditReview';

function ScheduleCard(props) {
  return (
    <Card gap="20px" column>
      <FlexDiv gap="20px">
        <p>{timestampToString(props.schedule.start_time, 'time')}</p>
        <div style={{ width: '200px', height: '150px' }}>
          <img
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            src={props.schedule.placeDetail.photos[0]}
            alt={props.schedule.placeDetail.name}
          />
        </div>
        <h3>{props.schedule.placeDetail.name}</h3>
      </FlexDiv>
      {props.children}
    </Card>
  );
}

function Itineraries() {
  const { uid } = useContext(Context);
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
                .getScheduleWithTime(uid, itinerary.itinerary_id, now)
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

  return (
    <CardWrapper column gap="20px" padding="20px">
      {!empty ? (
        <Container>
          {progressing?.overview && <h2>進行中的行程</h2>}
          {progressing?.overview && (
            <div key={progressing.overview.itinerary_id}>
              <Card
                gap="20px"
                onClick={() => {
                  navigate(`/${progressing.overview.itinerary_id}`);
                }}>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    overflow: 'hidden',
                  }}>
                  <img
                    src={progressing.overview.cover_photo}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    alt="cover"
                  />
                </div>
                <h1>{progressing.overview.title}</h1>
              </Card>
              {progressing.schedule?.map((schedule) => {
                const reviews = {
                  review_tags: schedule.review_tags,
                  gallery: schedule.gallery,
                };
                return (
                  <ScheduleCard schedule={schedule} key={schedule.schedule_id}>
                    {Math.floor((schedule.start_time - now) / (60 * 1000)) <=
                      0 && (
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
            </div>
          )}
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
    </CardWrapper>
  );
}

export default Itineraries;
