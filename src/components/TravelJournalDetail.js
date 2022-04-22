import { useNavigate, useParams } from 'react-router-dom';
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
import { ReviewTags, ReviewGallery, uploadReviewFirestore } from './EditReview';

function EditReview(props) {
  const { uid } = useContext(Context);
  const [reviewTags, setReviewTags] = useState(props.reviewTags);
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [gallery, setGallery] = useState();
  const [addTag, setAddTag] = useState();
  const [imageBuffer, setImageBuffer] = useState();
  const [showInput, setShowInput] = useState();

  const addCheckedTag = (e) => {
    e.preventDefault();
    if (addTag) {
      setReviewTags(reviewTags ? [...reviewTags, addTag] : [addTag]);
      setCheckedReviewTags(
        checkedReviewTags ? [...checkedReviewTags, addTag] : [addTag]
      );
      firestore.editProfile(uid, {
        reviews: reviewTags ? [...reviewTags, addTag] : [addTag],
      });
      setAddTag('');
    }
  };

  useEffect(() => {
    if (props.reviewTags?.length > 0) {
      setShowInput(false);
    } else {
      setShowInput(true);
    }
    setReviewTags(props.reviewTags);
    setGallery(props.reviews.gallery);
    setCheckedReviewTags(props.reviews.review_tags);
  }, []);
  return (
    <Container>
      <ReviewTags
        defaultTags={reviewTags}
        inputTag={addTag}
        setInputTag={setAddTag}
        checkedTags={checkedReviewTags}
        setCheckedTags={setCheckedReviewTags}
        onSubmit={addCheckedTag}
        isEdit={props.isEdit}
        showInput={showInput}
        setShowInput={setShowInput}
      />
      <ReviewGallery
        isEdit={props.isEdit}
        gallery={gallery}
        setGallery={setGallery}
        imageBuffer={imageBuffer}
        setImageBuffer={setImageBuffer}
      />
      {props.isEdit && (
        <button
          type="click"
          onClick={async () => {
            const uploadFirestore = new uploadReviewFirestore({
              uid,
              itineraryId: props.itineraryId,
              scheduleId: props.scheduleId,
              updateSchedule: {
                review_tags: checkedReviewTags,
              },
              imageBuffer,
              gallery,
            });
            uploadFirestore.doUpload().then((newGallery) => {
              setGallery(newGallery);
              setImageBuffer([]);
              setReviewTags(checkedReviewTags);
            });
          }}>
          儲存
        </button>
      )}
    </Container>
  );
}

function TravelJournalDetail() {
  const { uid } = useContext(Context);
  const { journalID } = useParams();
  const [scheduleList, setScheduleList] = useState();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  const [schedulesExpand, setSchedulesExpand] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [reviewTagsOfSchedules, setReviewTagsOfSchedules] = useState();

  const expandCard = (schedule) => {};
  useEffect(() => {
    firestore
      .getItinerary(uid, journalID)
      .then((res) => {
        setOverviews(res.overviews);
        setScheduleList(res.schedules);
        const schedulesTags = res.schedules.reduce((acc, schedule) => {
          acc[schedule.schedule_id] = schedule.review_tags;
          return acc;
        }, {});
        setReviewTagsOfSchedules(schedulesTags);
      })
      .catch((error) => console.error(error));
  }, []);
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
                      schedule.reviews
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
                  ) : null}
                </FlexDiv>
                {schedulesExpand?.some((id) => id === schedule.place_id) && (
                  <EditReview
                    isEdit={isEdit}
                    key={schedule.schedule_id}
                    reviewTags={schedule.review_tags}
                    itineraryId={journalID}
                    scheduleId={schedule.schedule_id}
                    reviews={{
                      review_tags: schedule.review_tags,
                      review: schedule.review,
                      gallery: schedule.gallery,
                    }}
                  />
                )}
              </FlexChildDiv>
            </Card>
          ))}
        </>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}

export default TravelJournalDetail;
