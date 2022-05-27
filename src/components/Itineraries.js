import { useContext, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  styles,
  palatte,
  mediaQuery,
  Loader,
} from './styledComponents/basic/common';
import { H4, P } from './styledComponents/basic/Text';
import ScheduleCard from './styledComponents/Cards/ScheduleCard';
import OverviewCard from './styledComponents/Cards/OverviewCard';
import AddReview from './EditReview/AddReview';
import { Button } from './styledComponents/Buttons/Button';
import { Accordion } from './styledComponents/Accordion';

const Container = styled.div`
  ${styles.containerSetting}
  ${styles.flexColumn};
  gap: 70px;
  margin-bottom: 100px;
`;

const Description = styled(P)`
  text-align: center;
  color: ${palatte.gray['700']};
`;
const ExploreSpot = ({ isNothing }) => {
  const navigate = useNavigate();
  return (
    <div
      css={css`
        ${styles.flexColumn}
        gap:20px;
        width: 250px;
        margin: 30px auto;
        align-self: center;
        ${mediaQuery[0]} {
          display: none;
        }
      `}>
      {isNothing ? (
        <Description>沒有行程可以顯示</Description>
      ) : (
        <Description>
          想要新建行程？
          <br /> 把想去的景點加到候補清單吧！
        </Description>
      )}
      <Button styled="primary" onClick={() => navigate('/explore')}>
        探索景點
      </Button>
    </div>
  );
};
ExploreSpot.propTypes = {
  isNothing: PropTypes.bool,
};

const foldContainer = css`
  padding: 40px 60px;
  ${mediaQuery[0]} {
    padding: 20px;
  }
`;
const ItinerariesContainer = styled.div`
  ${styles.flexColumn}
  gap: 40px;
  ${mediaQuery[0]} {
    padding: 0 20px;
  }
`;

const ItineraryCardsWrapper = styled.ul`
  ${styles.flex};
  gap: 30px;
  overflow-x: auto;
  ${mediaQuery[0]} {
    flex-wrap: wrap;
    overflow-x: unset;
    gap: 30px;
  }
`;

const ProgressingSchedulesWrapper = styled.ul`
  ${styles.flexColumn};
  gap: 30px;
`;

const AddReviewButton = styled(Button)`
  display: none;
  ${mediaQuery[0]} {
    display: block;
  }
`;

function Itineraries() {
  const { uid, map } = useContext(Context);
  const { reviewTags } = useOutletContext();
  const navigate = useNavigate();
  const [hasItinerary, setHasItinerary] = useState();
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();
  const [isShowReview, setIsShowReview] = useState(false);

  useEffect(() => {
    firestore
      .getItineraries(uid, now)
      .then((overviews) => {
        if (overviews.length === 0) {
          setHasItinerary(false);
        } else {
          setHasItinerary(true);
          const itineraries = {
            coming: [],
            future: [],
          };
          setProgressing([]);
          overviews.forEach(async (itinerary) => {
            const countDownDay =
              new Date(itinerary.start_date).getDate() -
              new Date(now).getDate();
            const tripDays =
              new Date(itinerary.end_date).getDate() -
              new Date(itinerary.start_date).getDate();
            if (countDownDay <= 0 && countDownDay + tripDays >= 0) {
              firestore
                .getScheduleWithTime(uid, itinerary.itinerary_id, now, map)
                .then((scheduleProcessing) => {
                  if (scheduleProcessing) {
                    const todaySchedule = scheduleProcessing.filter(
                      (schedule) => {
                        return (
                          new Date(schedule.start_time).getDate() ===
                          new Date(now).getDate()
                        );
                      }
                    );
                    setProgressing({
                      overview: itinerary,
                      schedule: todaySchedule,
                    });
                  }
                })
                .catch((error) => console.error(error));
            } else if (countDownDay <= 7 && countDownDay > 0) {
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
    <>
      <Container>
        {hasItinerary ? (
          <>
            {progressing?.overview && (
              <Accordion
                addCss={foldContainer}
                gap="50px"
                isDefualtExpand
                titleElement={<H4>進行中的 {progressing.overview.title}</H4>}>
                <ProgressingSchedulesWrapper
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
                            duration={schedule.duration}
                            travelMode={schedule.travel_mode}
                            transitDetail={schedule.transit_detail}
                            schedule={schedule}
                            key={schedule.schedule_id}
                            onClick={() =>
                              navigate(
                                `/itinerary/${progressing.overview.itinerary_id}`
                              )
                            }>
                            {schedule.start_time < now ? (
                              <>
                                <AddReviewButton
                                  styled="primary"
                                  onClick={() =>
                                    setIsShowReview((prev) => !prev)
                                  }>
                                  添加心得
                                </AddReviewButton>
                                <AddReview
                                  isShowReview={isShowReview}
                                  setIsShowReview={setIsShowReview}
                                  key={schedule.schedule_id}
                                  itineraryId={
                                    progressing.overview.itinerary_id
                                  }
                                  updateOriginReviewState={(
                                    updatedSchedule
                                  ) => {
                                    setProgressing({
                                      ...progressing,
                                      schedule: progressing.schedule.map(
                                        (schedule) =>
                                          schedule.schedule_id ===
                                          updatedSchedule.schedule_id
                                            ? {
                                                ...schedule,
                                                ...updatedSchedule,
                                              }
                                            : schedule
                                      ),
                                    });
                                  }}
                                  scheduleId={schedule.schedule_id}
                                  allReviewTags={reviewTags}
                                  showReviewTags={schedule.review_tags}
                                  reviews={reviews}
                                  isEdit
                                />
                              </>
                            ) : null}
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
                            navigate(
                              `/itinerary/${progressing.overview.itinerary_id}`
                            );
                          }}
                        />
                      )}
                </ProgressingSchedulesWrapper>
              </Accordion>
            )}
            {coming?.length > 0 && (
              <ItinerariesContainer>
                <H4>即將到來的行程</H4>
                <ItineraryCardsWrapper>
                  {coming?.map((itinerary) => (
                    <OverviewCard
                      src={itinerary.cover_photo}
                      as="li"
                      alt="cover"
                      title={itinerary.title}
                      startDate={itinerary.start_date}
                      endDate={itinerary.end_date}
                      key={itinerary.itinerary_id}
                      onClick={() => {
                        navigate(`/itinerary/${itinerary.itinerary_id}`);
                      }}
                    />
                  ))}
                </ItineraryCardsWrapper>
              </ItinerariesContainer>
            )}
            {future?.length > 0 && (
              <ItinerariesContainer>
                <H4>其他行程</H4>
                <ItineraryCardsWrapper>
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
                        navigate(`/itinerary/${itinerary.itinerary_id}`);
                      }}
                    />
                  ))}
                </ItineraryCardsWrapper>
              </ItinerariesContainer>
            )}
            {!progressing || !coming || !future ? <Loader /> : null}
            <ExploreSpot />
          </>
        ) : (
          <>
            {hasItinerary === undefined ? (
              <Loader />
            ) : (
              <ExploreSpot isNothing />
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default Itineraries;
