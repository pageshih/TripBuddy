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

function TravelJournalDetail() {
  const { uid } = useContext(Context);
  const { journalID } = useParams();
  const [scheduleList, setScheduleList] = useState();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  useEffect(() => {
    firestore
      .getItinerary(uid, journalID)
      .then((res) => {
        setOverviews(res.overviews);
        setScheduleList(res.schedules);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <>
      {overviews && scheduleList ? (
        <>
          <h2>{overviews.title}</h2>
          <p>
            {timestampToString(overviews.start_date, 'date')} -{' '}
            {timestampToString(overviews.end_date, 'date')}
          </p>
          <img src={overviews.cover_photo} alt={overviews.title} />
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
            <FlexDiv gap="20px" alignItems="center" key={schedule.place_id}>
              <p>{timestampToString(schedule.start_time, 'time')}</p>
              <FlexChildDiv>
                <h3>{schedule.placeDetail.name}</h3>
                <FlexDiv gap="20px">
                  {schedule.review_tags?.map((tag) => (
                    <p key={tag} style={{ backgroundColor: 'skyblue' }}>
                      {tag}
                    </p>
                  ))}
                </FlexDiv>
                <FlexDiv gap="20px">
                  {schedule.gallery?.map((url, index) => (
                    <CardImage
                      src={url}
                      alt="gallery"
                      key={index}
                      width="200px"
                      height="200px"
                    />
                  ))}
                </FlexDiv>
              </FlexChildDiv>
            </FlexDiv>
          ))}
        </>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}

export default TravelJournalDetail;
