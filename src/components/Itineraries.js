import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import {
  styles,
  palatte,
  H4,
  P,
  mediaQuery,
} from './styledComponents/basicStyle';
import { FlexDiv, Container, FlexChildDiv } from './styledComponents/Layout';
import { ScheduleCard, OverviewCard } from './styledComponents/Cards';
import { AddReview } from './EditReview';
import { Button } from './styledComponents/Button';

const ExploreSpot = (props) => {
  const navigate = useNavigate();
  return (
    <FlexChildDiv
      direction="column"
      gap="20px"
      width="250px"
      margin="30px 0"
      alignSelf="center"
      addCss={css`
        ${mediaQuery[0]} {
          display: none;
        }
      `}>
      {props.nothing ? (
        <P textAlign="center" color={palatte.gray['700']}>
          沒有行程可以顯示
        </P>
      ) : (
        <P textAlign="center" color={palatte.gray['700']}>
          想要新建行程？
          <br /> 把想去的景點加到候補清單吧！
        </P>
      )}
      <Button styled="primary" onClick={() => navigate('/explore')}>
        探索景點
      </Button>
    </FlexChildDiv>
  );
};

function Itineraries() {
  const { uid, map } = useContext(Context);
  const navigate = useNavigate();
  const [empty, setEmpty] = useState();
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();
  const { reviewTags } = useOutletContext();
  const [showReview, setShowReview] = useState(false);

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
    ${mediaQuery[0]} {
      padding: 20px;
    }
  `;
  const itinerariesContainer = css`
    flex-direction: column;
    gap: 40px;
    ${mediaQuery[0]} {
      padding: 0 20px;
    }
  `;
  return (
    <>
      <Container
        padding={`0 ${styles.container_padding} 100px ${styles.container_padding}`}
        maxWidth={styles.container_maxWidth}
        margin="0 auto">
        {!empty ? (
          <>
            <FlexDiv direction="column" gap="70px">
              {progressing?.overview && (
                <div css={foldContainer}>
                  <FlexDiv justifyContent="space-between" align-items="center">
                    <H4>進行中的 {progressing.overview.title}</H4>
                    <span className="material-icons">expand_more</span>
                  </FlexDiv>
                  <FlexDiv
                    as="ul"
                    direction="column"
                    gap="30px"
                    key={progressing.overview.itinerary_id}>
                    {progressing.schedule.length > 0
                      ? progressing.schedule?.map((schedule) => {
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
                                navigate(
                                  `/${progressing.overview.itinerary_id}`
                                )
                              }>
                              {schedule.end_time > now &&
                                schedule.start_time < now && (
                                  <>
                                    <Button
                                      styled="primary"
                                      addCss={css`
                                        display: none;
                                        ${mediaQuery[0]} {
                                          display: block;
                                        }
                                      `}
                                      onClick={() =>
                                        setShowReview((prev) => !prev)
                                      }>
                                      添加心得
                                    </Button>
                                    <AddReview
                                      key={schedule.schedule_id}
                                      itineraryId={
                                        progressing.overview.itinerary_id
                                      }
                                      scheduleId={schedule.schedule_id}
                                      allReviewTags={reviewTags}
                                      showReviewTags={schedule.review_tags}
                                      reviews={reviews}
                                      isEdit
                                    />
                                  </>
                                )}
                            </ScheduleCard>
                          );
                        })
                      : progressing.overview && (
                          <OverviewCard
                            row
                            src={progressing.overview.cover_photo}
                            as="li"
                            alt="cover"
                            title={progressing.overview.title}
                            startDate={progressing.overview.start_date}
                            endDate={progressing.overview.end_date}
                            key={progressing.overview.itinerary_id}
                            onClick={() => {
                              navigate(`/${progressing.overview.itinerary_id}`);
                            }}
                          />
                        )}
                  </FlexDiv>
                </div>
              )}
              {coming?.length > 0 && (
                <FlexDiv addCss={itinerariesContainer}>
                  <H4>即將到來的行程</H4>
                  <FlexDiv as="ul" gap="30px" overflowY="scroll">
                    {coming?.map((itinerary) => (
                      <OverviewCard
                        src={itinerary.cover_photo}
                        as="li"
                        alt="cover"
                        title={itinerary.title}
                        start_date={itinerary.start_date}
                        end_date={itinerary.end_date}
                        key={itinerary.itinerary_id}
                        onClick={() => {
                          navigate(`/${itinerary.itinerary_id}`);
                        }}
                      />
                    ))}
                  </FlexDiv>
                </FlexDiv>
              )}
              {future?.length > 0 && (
                <FlexDiv addCss={itinerariesContainer}>
                  <H4>其他行程</H4>
                  <FlexDiv as="ul" gap="60px" overflowY="scroll">
                    {future?.map((itinerary) => (
                      <OverviewCard
                        as="li"
                        src={itinerary.cover_photo}
                        alt="cover"
                        key={itinerary.itinerary_id}
                        title={itinerary.title}
                        startDate={itinerary.start_date}
                        endDate={itinerary.end_date}
                        onClick={() => {
                          navigate(`/${itinerary.itinerary_id}`);
                        }}
                      />
                    ))}
                  </FlexDiv>
                </FlexDiv>
              )}
              <ExploreSpot />
            </FlexDiv>
          </>
        ) : (
          <>
            {empty === undefined ? <p>loading...</p> : <ExploreSpot nothing />}
          </>
        )}
      </Container>
    </>
  );
}

export default Itineraries;
