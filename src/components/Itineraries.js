import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import styled from '@emotion/styled';
import { firestore, firebaseStorage } from '../utils/firebase';
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
const compressImages = async (files) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const images = [...files].map((image) => {
    return imageCompression(image, options);
  });
  return Promise.all(images);
};
function AddImages(props) {
  return (
    <label
      style={{
        backgroundColor: 'lightgray',
        fontSize: '13px',
        padding: '1px 5px',
      }}>
      <input
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        multiple
        onChange={async (e) => {
          let addCompressed = await compressImages(e.target.files);
          if (props.imageBuffer?.length > 0) {
            addCompressed = [...props.imageBuffer, ...addCompressed];
          }
          props.setImageBuffer(addCompressed);
        }}
      />
      上傳照片
    </label>
  );
}
function AddReview(props) {
  const { uid } = useContext(Context);
  const [reviewTags, setReviewTags] = useOutletContext();
  const [addTag, setAddTag] = useState('');
  const [showInput, setShowInput] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [imageBuffer, setImageBuffer] = useState();
  const [gallery, setGallery] = useState();

  const addCheckedTag = (e) => {
    e.preventDefault();
    if (addTag) {
      const newReviewTags = reviewTags ? [...reviewTags] : [];
      const newCheckedTags = checkedReviewTags ? [...checkedReviewTags] : [];
      setReviewTags([...newReviewTags, addTag]);
      firestore.editProfile(uid, {
        reviews: [...newReviewTags, addTag],
      });
      setCheckedReviewTags([...newCheckedTags, addTag]);
      setAddTag('');
    }
  };
  const uploadFirestore = async () => {
    const addGallery =
      imageBuffer &&
      (await firebaseStorage.uploadImagesOfReviews(
        {
          userUID: uid,
          scheduleId: props.scheduleId,
          itineraryId: props.itineraryId,
        },
        imageBuffer
      ));
    const updateSchedule = [
      {
        schedule_id: props.scheduleId,
        review_tags: checkedReviewTags,
        gallery: gallery
          ? addGallery
            ? [...gallery, ...addGallery]
            : gallery
          : addGallery,
      },
    ];
    firestore
      .editSchedules(uid, props.itineraryId, updateSchedule, 'merge')
      .then(() => {
        setCheckedReviewTags([]);
        setImageBuffer([]);
        setGallery([...gallery, ...addGallery]);
        alert('上傳成功！');
      })
      .catch((error) => console.error(error));
  };
  useEffect(() => {
    if (reviewTags && reviewTags.length > 0) {
      setShowInput(false);
      setCheckedReviewTags(props.reviews.review_tags);
      setGallery(props.reviews.gallery);
    } else {
      setShowInput(true);
    }
  }, []);
  return (
    <Container>
      <FlexDiv alignItems="center" gap="10px">
        <div>
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
                    let newCheckedTags;
                    if (e.target.checked) {
                      newCheckedTags = checkedReviewTags
                        ? [...checkedReviewTags, e.target.value]
                        : [e.target.value];
                    } else {
                      newCheckedTags = checkedReviewTags.filter(
                        (tag) => e.target.value !== tag
                      );
                    }
                    setCheckedReviewTags(newCheckedTags);
                  }}
                />
              </label>
            ))}
        </div>
        {showInput ? (
          <form onSubmit={addCheckedTag}>
            <input
              type="type"
              placeholder="按 + 新增心得標籤"
              value={addTag}
              onChange={(e) => {
                setAddTag(e.target.value);
              }}
            />
            <button type="submit">+</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowInput(true);
            }}>
            +
          </button>
        )}
      </FlexDiv>
      <FlexDiv gap="20px">
        {gallery?.map((url, index) => (
          <FlexDiv alignItems="flex-start" key={index}>
            <div style={{ maxWidth: '300px', height: '200px' }}>
              <img
                src={url}
                alt="schedulePhoto"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <button
              onClick={() => {
                const newGallery = gallery.filter(
                  (_, newIndex) => index !== newIndex
                );
                setGallery(newGallery);
              }}>
              X
            </button>
          </FlexDiv>
        ))}
      </FlexDiv>
      <div>
        {imageBuffer?.length > 0 && <h4>圖片預覽</h4>}
        {imageBuffer?.map((blob, index) => {
          const blobUrl = URL.createObjectURL(blob);
          return (
            <FlexDiv alignItems="flex-start" key={blob.lastModified}>
              <div style={{ maxWidth: '300px', height: '200px' }}>
                <img
                  src={blobUrl}
                  alt={blob.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button
                onClick={() => {
                  const newImagesBuffer = imageBuffer.filter(
                    (_, newIndex) => index !== newIndex
                  );
                  setImageBuffer(newImagesBuffer);
                }}>
                X
              </button>
            </FlexDiv>
          );
        })}
      </div>
      <AddImages imageBuffer={imageBuffer} setImageBuffer={setImageBuffer} />
      <button type="click" onClick={uploadFirestore}>
        儲存
      </button>
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
  const navigate = useNavigate();
  const [empty, setEmpty] = useState();
  const [progressing, setProgressing] = useState();
  const [coming, setComing] = useState();
  const [future, setFuture] = useState();
  const now = new Date().getTime();

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
                        reviews={reviews}
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
