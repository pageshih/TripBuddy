import { useNavigate, useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
  CardImage,
  FlexChildDiv,
} from './styledComponents/Layout';
import { timestampToString } from '../utils/utilities';
import { AddReview } from './EditReview';

function TravelJournalDetail() {
  const { uid } = useContext(Context);
  const { journalID } = useParams();
  const [scheduleList, setScheduleList] = useState();
  const [allSchedule, setAllSchedule] = useState();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  const [schedulesExpand, setSchedulesExpand] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [reviewTags, setReviewTags] = useState();
  const [uploadedReview, setUploadedReview] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        const itineraryRes = await firestore.getItinerary(uid, journalID);
        setOverviews(itineraryRes.overviews);
        setAllSchedule(itineraryRes.schedules);
        setScheduleList(
          itineraryRes.schedules.filter(
            (schedule) =>
              schedule.end_time > itineraryRes.overviews.depart_times[day] &&
              schedule.end_time <
                itineraryRes.overviews.depart_times[day] + 24 * 60 * 60 * 1000
          )
        );
        const profile = await firestore.getProfile(uid);
        setReviewTags(profile.reviews);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (uploadedReview) {
      const newScheduleList = scheduleList.map((schedule) =>
        schedule.schedule_id === uploadedReview.schedule_id
          ? { ...schedule, ...uploadedReview }
          : schedule
      );
      setScheduleList(newScheduleList);
    }
  }, [uploadedReview]);
  return (
    <>
      {overviews && scheduleList ? (
        <>
          <Container>
            <h2>{overviews.title}</h2>
            <p>
              {timestampToString(overviews.start_date, 'date')} -{' '}
              {timestampToString(overviews.end_date, 'date')}
            </p>
            <img src={overviews.cover_photo} alt={overviews.title} />
            <button type="button" onClick={() => setIsEdit((prev) => !prev)}>
              {isEdit ? '結束編輯' : '編輯'}
            </button>
          </Container>
          <h3>Day {day + 1}</h3>
          <p>{timestampToString(overviews.depart_times[day], 'date')}</p>
          <FlexDiv alignItems="center">
            {scheduleList.map((schedule, index, array) => (
              <p key={index}>
                {schedule.placeDetail.name}
                {index < array.length - 1 && (
                  <span
                    class="material-icons"
                    style={{ verticalAlign: 'text-bottom' }}>
                    arrow_right_alt
                  </span>
                )}
              </p>
            ))}
          </FlexDiv>
          {scheduleList.map((schedule) => (
            <Card gap="20px" alignItems="center" key={schedule.place_id}>
              <p>{timestampToString(schedule.start_time, 'time')}</p>
              <FlexChildDiv style={{ flexGrow: 1 }}>
                <FlexDiv
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => {
                    if (
                      schedule.review_tags ||
                      schedule.gallery ||
                      schedule.reviews ||
                      isEdit
                    ) {
                      if (
                        schedulesExpand?.some((id) => id === schedule.place_id)
                      ) {
                        setSchedulesExpand(
                          schedulesExpand.filter(
                            (id) => id !== schedule.place_id
                          )
                        );
                      } else {
                        setSchedulesExpand(
                          schedulesExpand
                            ? [...schedulesExpand, schedule.place_id]
                            : [schedule.place_id]
                        );
                      }
                    }
                  }}>
                  <h3>{schedule.placeDetail.name}</h3>
                  {schedule.review_tags ||
                  schedule.gallery ||
                  schedule.reviews ? (
                    <span className="material-icons">expand_more</span>
                  ) : (
                    isEdit && <span className="material-icons">add_circle</span>
                  )}
                </FlexDiv>
                {schedulesExpand?.some((id) => id === schedule.place_id) && (
                  <AddReview
                    isEdit={isEdit}
                    key={schedule.schedule_id}
                    allReviewTags={reviewTags}
                    showReviewTags={
                      schedule.review_tags ||
                      schedule.gallery ||
                      schedule.reviews
                        ? schedule.review_tags
                        : reviewTags
                    }
                    itineraryId={journalID}
                    scheduleId={schedule.schedule_id}
                    setUploadedReview={setUploadedReview}
                    reviews={{
                      review_tags: schedule.review_tags,
                      review: schedule.review,
                      gallery: schedule.gallery,
                    }}
                    isJournal
                  />
                )}
              </FlexChildDiv>
            </Card>
          ))}
          <FlexDiv justifyContent="flex-end" margin="30px 10px">
            {overviews.depart_times.map((_, index, array) => {
              let nextIndex;
              if (index !== day) {
                if (array[index]) {
                  nextIndex = index;
                } else {
                  nextIndex = index - 2;
                }
              } else {
                nextIndex = null;
              }

              return (
                nextIndex !== null && (
                  <FlexDiv
                    as="button"
                    alignItems="center"
                    type="button"
                    onClick={() => {
                      setDay(nextIndex);
                      setScheduleList(
                        allSchedule.filter((schedule) => {
                          return (
                            schedule.end_time >
                              overviews.depart_times[nextIndex] &&
                            schedule.end_time <
                              overviews.depart_times[nextIndex] +
                                24 * 60 * 60 * 1000
                          );
                        })
                      );
                    }}>
                    第{nextIndex + 1}天
                    <span className="material-icons">trending_flat</span>
                  </FlexDiv>
                )
              );
            })}
          </FlexDiv>
        </>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}

export default TravelJournalDetail;
