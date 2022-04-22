import { useContext, useEffect, useState } from 'react';
import { compressImages } from '../utils/utilities';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv, Container } from './styledComponents/Layout';
import { TextAreaReview } from './styledComponents/TextField';

function ReviewTags(props) {
  return (
    <FlexDiv alignItems="center" gap="10px">
      <FlexDiv gap="20px">
        {props.defaultTags?.map((tag) => (
          <label key={tag}>
            {tag}
            {props.isEdit && (
              <input
                value={tag}
                type="checkbox"
                checked={
                  props.checkedTags?.some((checked) => tag === checked) && true
                }
                onChange={(e) => {
                  const setChecked = (prev) => {
                    if (e.target.checked) {
                      return prev ? [...prev, tag] : [tag];
                    } else {
                      return prev.filter((tag) => e.target.value !== tag);
                    }
                  };
                  props.setCheckedTags((prev) => setChecked(prev));
                }}
              />
            )}
          </label>
        ))}
      </FlexDiv>
      {props.isEdit ? (
        props.showInput ? (
          <form onSubmit={props.onSubmit}>
            <input
              type="type"
              placeholder="按 + 新增心得標籤"
              value={props.inputTag}
              onChange={(e) => {
                props.setInputTag(e.target.value);
              }}
            />
            <button type="submit">+</button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              props.setShowInput(true);
            }}>
            +
          </button>
        )
      ) : null}
    </FlexDiv>
  );
}

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

function ReviewGallery(props) {
  return (
    <>
      <FlexDiv gap="20px">
        {props.gallery?.map((url, index) => (
          <FlexDiv alignItems="flex-start" key={index}>
            <div style={{ maxWidth: '300px', height: '200px' }}>
              <img
                src={url}
                alt="schedulePhoto"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {props.isEdit && (
              <button
                onClick={() => {
                  const newGallery = props.gallery.filter(
                    (_, newIndex) => index !== newIndex
                  );
                  props.setGallery(newGallery);
                }}>
                X
              </button>
            )}
          </FlexDiv>
        ))}
      </FlexDiv>
      <div>
        {props.imageBuffer?.length > 0 && <h4>圖片預覽</h4>}
        <FlexDiv gap="20px">
          {props.imageBuffer?.map((blob, index) => {
            const blobUrl = URL.createObjectURL(blob);
            return (
              <FlexDiv alignItems="flex-start" key={blob.lastModified}>
                <div style={{ maxWidth: '300px', height: '200px' }}>
                  <img
                    src={blobUrl}
                    alt={blob.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const newImagesBuffer = props.imageBuffer.filter(
                      (_, newIndex) => index !== newIndex
                    );
                    props.setImageBuffer(newImagesBuffer);
                  }}>
                  X
                </button>
              </FlexDiv>
            );
          })}
          {props.isEdit && (
            <AddImages
              imageBuffer={props.imageBuffer}
              setImageBuffer={props.setImageBuffer}
            />
          )}
        </FlexDiv>
      </div>
    </>
  );
}

class uploadReviewFirestore {
  constructor({
    uid,
    itineraryId,
    scheduleId,
    updateSchedule,
    imageBuffer,
    gallery,
  }) {
    this.updateSchedule = updateSchedule;
    this.uid = uid;
    this.itineraryId = itineraryId;
    this.imageBuffer = imageBuffer;
    this.scheduleId = scheduleId;
    this.gallery = gallery;
  }
  async uploadStorage() {
    return this.imageBuffer
      ? await firebaseStorage.uploadImagesOfReviews(
          {
            userUID: this.uid,
            scheduleId: this.scheduleId,
            itineraryId: this.itineraryId,
          },
          this.imageBuffer
        )
      : [];
  }
  async doUpload() {
    const newGallery = this.gallery
      ? [...this.gallery, ...(await this.uploadStorage())]
      : [...(await this.uploadStorage())];
    return firestore
      .editSchedules(
        this.uid,
        this.itineraryId,
        [
          {
            ...this.updateSchedule,
            schedule_id: this.scheduleId,
            gallery: newGallery,
          },
        ],
        'merge'
      )
      .then(() => {
        alert('上傳成功！');
        return Promise.resolve(newGallery);
      })
      .catch((error) => console.error(error));
  }
}

function AddReview(props) {
  const { uid } = useContext(Context);
  const [reviewTags, setReviewTags] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [gallery, setGallery] = useState();
  const [addTag, setAddTag] = useState();
  const [imageBuffer, setImageBuffer] = useState();
  const [showInput, setShowInput] = useState();
  const [review, setReview] = useState();
  const [reviewShowInput, setReviewShowInput] = useState(false);

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
    if (props.showReviewTags?.length > 0) {
      setShowInput(false);
    } else {
      setShowInput(true);
    }
    setReviewTags(
      props.isEdit && props.allReviewTags
        ? [
            ...props.showReviewTags,
            ...props.allReviewTags.filter(
              (tag) =>
                props.showReviewTags.every((recorded) => recorded !== tag) &&
                tag
            ),
          ]
        : props.showReviewTags
    );
    setGallery(props.reviews.gallery);
    setCheckedReviewTags(props.reviews.review_tags);
    setReview(props.reviews.review);
  }, [props.isEdit]);
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
      <FlexDiv direction="column">
        {props.isEdit && props.isJournal ? (
          <TextAreaReview
            type="textarea"
            placeholder="添加一點旅行後的心得吧！"
            value={review}
            readOnly={!reviewShowInput}
            onChange={(e) => {
              setReview(e.target.value);
            }}
            onClick={() => {
              setReviewShowInput(true);
            }}
          />
        ) : (
          <p>{review}</p>
        )}
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
                  review,
                },
                imageBuffer,
                gallery,
              });
              uploadFirestore.doUpload().then((newGallery) => {
                setGallery(newGallery);
                setImageBuffer([]);
                setReviewShowInput(false);
                setReviewTags(
                  props.allReviewTags
                    ? [
                        ...checkedReviewTags,
                        ...reviewTags.filter(
                          (tag) =>
                            checkedReviewTags.every(
                              (checked) => checked !== tag
                            ) && tag
                        ),
                      ]
                    : checkedReviewTags
                );
                props.setUploadedReview({
                  schedule_id: props.scheduleId,
                  review_tags: checkedReviewTags,
                  review,
                  gallery: newGallery,
                });
              });
            }}>
            儲存
          </button>
        )}
      </FlexDiv>
    </Container>
  );
}

export { ReviewTags, ReviewGallery, AddReview, uploadReviewFirestore };
