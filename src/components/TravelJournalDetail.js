import { useNavigate, useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useContext, useEffect, useRef, useState, useReducer } from 'react';
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
import { timestampToString, filterDaySchedules } from '../utils/utilities';
import { AddReview } from './EditReview';
import { Pagination } from './Pagination';
import { Modal } from './styledComponents/Modal';
import { SearchBar } from '../utils/googleMap';
import { Button } from './styledComponents/Button';

function TravelJournalDetail() {
  const { uid, map } = useContext(Context);
  const { journalID } = useParams();
  const [scheduleList, setScheduleList] = useState();
  const allSchedules = useRef();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  const [schedulesExpand, setSchedulesExpand] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [reviewTags, setReviewTags] = useState();
  const [uploadedReview, setUploadedReview] = useState();
  const [showAddSchedule, setShowAddSchedule] = useState();
  // const [addSchesule, setAddSchedule] = useState({});
  // const addScheduleReducer = (state, action) => {
  //   switch(action.type){
  //     case 'changePlace':
  //       return {
  //         placeDetail:
  //       }
  //   }
  // };
  // const [addSchedule, dispatchAddSchedule] = useReducer(addScheduleReducer, addSchesule);

  useEffect(() => {
    async function fetchData() {
      try {
        const itineraryRes = await firestore.getItinerary(uid, journalID);
        setOverviews(itineraryRes.overviews);
        allSchedules.current = filterDaySchedules(
          itineraryRes.schedules,
          itineraryRes.overviews.depart_times
        );
        setScheduleList(allSchedules.current[day]);
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

  const switchDay = (nextDay) => {
    setDay(nextDay);
    setScheduleList(allSchedules.current[nextDay]);
    window.scrollTo(0, 0);
  };
  return (
    <>
      {overviews && scheduleList ? (
        <>
          {showAddSchedule && (
            <Modal close={() => setShowAddSchedule(false)}>
              <FlexDiv direction="column" height="100%">
                <SearchBar
                  setPlaceDetail={setPlaceDetail}
                  map={map}
                  css={{
                    container: { position: 'relative', width: '100%' },
                  }}
                  option={{
                    fields: ['name', 'place_id', 'formatted_address'],
                  }}
                />
                {placeDetail && (
                  <>
                    <h2>{placeDetail.name}</h2>
                    <p>{placeDetail.formatted_address}</p>
                  </>
                )}
                <FlexChildDiv
                  display="flex"
                  direction="column"
                  gap="20px"
                  padding="20px"
                  grow="1">
                  <select>
                    <option value="" disabled>
                      ---請選擇日期---
                    </option>
                    {overviews.depart_times.map((timestamp) => (
                      <option value={timestamp} key={timestamp}>
                        {timestampToString(timestamp, 'date')}
                      </option>
                    ))}
                  </select>
                  <input type="time" />
                  <Button styled="primary" margin="auto 0 0 0">
                    新增
                  </Button>
                </FlexChildDiv>
              </FlexDiv>
            </Modal>
          )}

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
          <p>{timestampToString(overviews.depart_times[day], 'simpleDate')}</p>
          <FlexDiv alignItems="center">
            {scheduleList.map((schedule, index, array) => (
              <p key={schedule.schedule_id}>
                {schedule.placeDetail.name}
                {index < array.length - 1 && (
                  <span
                    className="material-icons"
                    style={{ verticalAlign: 'text-bottom' }}>
                    arrow_right_alt
                  </span>
                )}
              </p>
            ))}
          </FlexDiv>
          <FlexDiv alignItems="center" gap="10px" justifyContent="flex-end">
            <p>有計畫外的行程？</p>
            <button
              type="button"
              onClick={() => {
                setShowAddSchedule(true);
                console.log(showAddSchedule);
              }}>
              加入行程
            </button>
          </FlexDiv>
          {scheduleList.map((schedule) => (
            <Card gap="20px" alignItems="center" key={schedule.schedule_id}>
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
                        schedulesExpand?.some(
                          (id) => id === schedule.schedule_id
                        )
                      ) {
                        setSchedulesExpand(
                          schedulesExpand.filter(
                            (id) => id !== schedule.schedule_id
                          )
                        );
                      } else {
                        setSchedulesExpand(
                          schedulesExpand
                            ? [...schedulesExpand, schedule.schedule_id]
                            : [schedule.schedule_id]
                        );
                      }
                    }
                  }}>
                  <h3>{schedule.placeDetail.name}</h3>
                  {schedule.review_tags ||
                  schedule.gallery ||
                  schedule.reviews ? (
                    <span className="material-icons">
                      {schedulesExpand?.every(
                        (id) => id !== schedule.schedule_id
                      )
                        ? 'expand_more'
                        : 'expand_less'}
                    </span>
                  ) : (
                    isEdit && (
                      <span className="material-icons">
                        {schedulesExpand?.every(
                          (id) => id !== schedule.schedule_id
                        )
                          ? 'add_circle'
                          : 'cancel'}
                      </span>
                    )
                  )}
                </FlexDiv>
                {schedulesExpand?.some((id) => id === schedule.schedule_id) && (
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
          <Pagination
            day={day}
            switchDay={switchDay}
            finalDay={overviews.depart_times.length - 1}
          />
        </>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}

export default TravelJournalDetail;
