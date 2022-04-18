import { useContext, useEffect, useState, useRef } from 'react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  Card,
  CardWrapper,
  Container,
  FlexDiv,
} from './styledComponents/Layout';

function InProgressItinerary() {
  return <></>;
}
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

function Itineraries() {
  const { uid } = useContext(Context);
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();

  useEffect(() => {
    firestore
      .getItineraries(uid)
      .then((res) => {
        const itineraries = {
          coming: [],
          future: [],
        };
        let progressingSchedules;
        res?.forEach(async (itinerary) => {
          const countDownDay = Math.floor(
            (itinerary.start_date - now) / (24 * 60 * 60 * 1000)
          );
          console.log(countDownDay);
          if (countDownDay <= 0 && countDownDay >= -1) {
            firestore
              .getScheduleWithTime(uid, itinerary.itinerary_id, now)
              .then((res) => {
                if (res) {
                  console.log(res, now);
                  progressingSchedules = res;
                  setProgressing({
                    overview: itinerary,
                    schedule: progressingSchedules,
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
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <CardWrapper column gap="20px" padding="20px">
      {progressing && coming && future ? (
        <Container>
          {progressing.overview && <h2>進行中的行程</h2>}
          {progressing.overview && (
            <div>
              <Card key={progressing.overview.itinerary_id} gap="20px">
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
                  <Card gap="20px" column>
                    <FlexDiv gap="20px">
                      <p>{timestampToString(schedule.start_time, 'time')}</p>
                      <img
                        src={schedule.placeDetail.photos[0]}
                        alt={schedule.placeDetail.name}
                      />
                      <h3>{schedule.placeDetail.name}</h3>
                    </FlexDiv>
                    {Math.floor((schedule.start_time - now) / (60 * 1000)) <=
                      0 && (
                      <Container>
                        <FlexDiv>
                          <label>
                            餐點可口
                            <input type="checkbox" />
                          </label>
                        </FlexDiv>
                        <button>上傳照片</button>
                        <button>儲存</button>
                      </Container>
                    )}
                  </Card>
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
        <p>loading...</p>
      )}
    </CardWrapper>
  );
}

export default Itineraries;
