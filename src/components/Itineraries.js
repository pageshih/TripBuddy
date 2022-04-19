import { useContext, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
} from './styledComponents/Layout';

const timestampToString = (timestamp, type) => {
  const timeType = {
    date: new Date(timestamp).toLocaleDateString(),
    time: new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
  return timeType[type] || '';
};

function AddReview(props) {
  const [addTag, setAddTag] = useState('');
  const [showInput, setShowInput] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [reviewTags, setReviewTags] = useState();

  const AddBtn = (props) => {
    return (
      <button type="text" onClick={props.onClickFn}>
        +
      </button>
    );
  };
  const addCheckedTag = () => {
    if (addTag) {
      const newReviewTags = reviewTags ? [...reviewTags] : [];
      const newCheckedTags = checkedReviewTags ? [...checkedReviewTags] : [];
      setReviewTags([...newReviewTags, addTag]);
      setCheckedReviewTags([...newCheckedTags, addTag]);
      setAddTag('');
    }
  };
  useEffect(() => {
    if (reviewTags && reviewTags.length > 0) {
      setShowInput(false);
    } else {
      setShowInput(true);
    }
  }, []);
  return (
    <Container>
      <FlexDiv alignItems="center" gap="10px">
        <form>
          {reviewTags &&
            reviewTags.map((tag) => (
              <label key={tag}>
                {tag}
                <input
                  value={tag}
                  type="checkbox"
                  checked={
                    checkedReviewTags?.some((checked) => tag === checked) &&
                    true
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCheckedReviewTags([
                        ...checkedReviewTags,
                        e.target.value,
                      ]);
                    } else {
                      const newCheckedTags = checkedReviewTags.filter(
                        (tag) => e.target.value !== tag
                      );
                      setCheckedReviewTags(newCheckedTags);
                    }
                  }}
                />
              </label>
            ))}
          {showInput ? (
            <>
              <input
                type="type"
                placeholder="按 + 新增心得標籤"
                value={addTag}
                onChange={(e) => {
                  setAddTag(e.target.value);
                }}
              />
              <AddBtn onClickFn={addCheckedTag} />
            </>
          ) : (
            <AddBtn
              onClickFn={() => {
                setShowInput(true);
              }}
            />
          )}
        </form>
      </FlexDiv>
      <button>上傳照片</button>
      <button>儲存</button>
    </Container>
  );
}

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
  const [empty, setEmpty] = useState();
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();

  useEffect(() => {
    firestore
      .getItineraries(uid, now)
      .then((overviews) => {
        if (overviews.length <= 0) {
          setEmpty(true);
        } else {
          setEmpty(false);
          const itineraries = {
            coming: [],
            future: [],
          };
          overviews?.forEach(async (itinerary) => {
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
      {progressing && coming && future ? (
        <Container>
          {progressing.overview && <h2>進行中的行程</h2>}
          {progressing.overview && (
            <div key={progressing.overview.itinerary_id}>
              <Card gap="20px">
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
                return (
                  <ScheduleCard schedule={schedule} key={schedule.schedule_id}>
                    {Math.floor((schedule.start_time - now) / (60 * 1000)) <=
                      0 && <AddReview key={schedule.schedule_id} />}
                  </ScheduleCard>
                );
              })}
            </div>
          )}
          {coming?.length > 0 && <h2>即將到來的行程</h2>}
          {coming.map((itinerary) => (
            <Card key={itinerary.itinerary_id} gap="20px">
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
          {future.map((itinerary) => (
            <Card key={itinerary.itinerary_id} gap="20px">
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
