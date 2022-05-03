import { useContext, useEffect, useState } from 'react';
import { compressImages } from '../utils/utilities';
import { firestore, firebaseStorage } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv, Container, Image } from './styledComponents/Layout';
import {
  TextAreaReview,
  ReviewTag,
  inputBaseSmall,
  AddImages,
  uploadImageStyle,
} from './styledComponents/Form';
import { RoundButtonSmall, Button } from './styledComponents/Button';
import { palatte, P, H6, mediaQuery } from './styledComponents/basicStyle';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';

function ReviewTags(props) {
  const [showInput, setShowInput] = useState();
  useEffect(() => {
    if (!props.defaultTags) {
      setShowInput(true);
    } else {
      setShowInput(false);
    }
  }, []);
  return (
    <FlexDiv
      alignItems="center"
      gap="10px"
      overflowY="scroll"
      padding="0 0 10px 0">
      <FlexDiv gap="12px">
        {props.defaultTags?.map((tag) => (
          <ReviewTag
            key={tag}
            isEdit={props.isEdit}
            tag={tag}
            selectedList={props.checkedTags}
            setSelectedList={props.setCheckedTags}>
            {tag}
          </ReviewTag>
        ))}
      </FlexDiv>
      {props.isEdit ? (
        showInput ? (
          <form
            onSubmit={props.onSubmit}
            css={css`
              display: flex;
              align-items: center;
              gap: 5px;
            `}>
            <input
              css={inputBaseSmall}
              type="type"
              placeholder="按 + 新增心得標籤"
              value={props.inputTag}
              onChange={(e) => {
                props.setInputTag(e.target.value);
              }}
            />
            <RoundButtonSmall className="material-icons" type="submit">
              add_circle
            </RoundButtonSmall>
          </form>
        ) : (
          <RoundButtonSmall
            type="button"
            className="material-icons"
            onClick={() => {
              setShowInput(true);
            }}>
            add_circle
          </RoundButtonSmall>
        )
      ) : null}
    </FlexDiv>
  );
}

function ReviewGallery(props) {
  const closeBtn = css`
    position: absolute;
    right: 10px;
    top: 10px;
    background-color: ${palatte.white};
    border-radius: 50%;
  `;
  const previewBtn = css`
    width: 60px;
    height: 40px;
    padding: 5px 10px;
    border: 5px solid ${palatte.primary['300']};
    border-radius: 30px;
    background-color: ${palatte.white};
    position: absolute;
    top: 20px;
    right: -10px;
    & span {
      display: none;
    }
    &:hover {
      & p {
        display: none;
      }
      & span {
        font-size: 20px;
        display: block;
        color: ${palatte.danger.basic};
      }
    }
  `;
  return (
    <FlexDiv gap="20px" overflowY="scroll">
      {props.gallery && (
        <FlexDiv gap="20px">
          {props.gallery?.map((url, index) => (
            <FlexDiv alignItems="flex-start" key={index} position="relative">
              <Image
                addCss={uploadImageStyle}
                width="250px"
                height="200px"
                src={url}
                alt="schedulePhoto"
              />
              {props.isEdit && (
                <RoundButtonSmall
                  addCss={closeBtn}
                  close
                  className="material-icons"
                  onClick={() => {
                    const newGallery = props.gallery.filter(
                      (_, newIndex) => index !== newIndex
                    );
                    props.setGallery(newGallery);
                  }}>
                  cancel
                </RoundButtonSmall>
              )}
            </FlexDiv>
          ))}
        </FlexDiv>
      )}
      <FlexDiv gap="20px" position="relative">
        {props.imageBuffer?.map((blob, index) => {
          const blobUrl = URL.createObjectURL(blob);
          return (
            <FlexDiv
              alignItems="flex-start"
              key={blob.lastModified}
              position="relative">
              <Image
                addCss={css`
                  ${uploadImageStyle}
                  border-radius: 10px;
                  border: 8px solid ${palatte.primary['300']};
                `}
                width="250px"
                height="200px"
                src={blobUrl}
                alt={blob.name}
              />
              <RoundButtonSmall
                addCss={previewBtn}
                close
                onClick={() => {
                  const newImagesBuffer = props.imageBuffer.filter(
                    (_, newIndex) => index !== newIndex
                  );
                  props.setImageBuffer(newImagesBuffer);
                }}>
                <P fontSize="14px" color={palatte.primary.basic}>
                  預覽
                </P>
                <span className="material-icons">cancel</span>
              </RoundButtonSmall>
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
    </FlexDiv>
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
    const newReviewTags = () => {
      if (props.isEdit && props.allReviewTags) {
        if (props.showReviewTags) {
          return [
            ...props.showReviewTags,
            ...props.allReviewTags.filter(
              (tag) =>
                props.showReviewTags.every((recorded) => recorded !== tag) &&
                tag
            ),
          ];
        } else {
          return [...props.allReviewTags];
        }
      } else {
        return props.showReviewTags;
      }
    };
    setReviewTags(newReviewTags());
    setGallery(props.reviews.gallery);
    setCheckedReviewTags(props.reviews.review_tags);
    setReview(props.reviews.review);
  }, [props.isEdit]);
  const reviewContainer = css`
    border-radius: 30px;
    background-color: ${palatte.white};
    border: 1px solid ${palatte.primary.basic};
    padding: 30px 40px 40px 40px;
    position: relative;
    ${mediaQuery[0]} {
      position: fixed;
      border-radius: 0;
      width: 100%;
      bottom: 75px;
      left: 0;
      z-index: 10;
    }
  `;
  const dialogTriangle = css`
    width: 20px;
    height: 20px;
    background-color: ${palatte.white};
    border-top: 1px solid ${palatte.primary.basic};
    border-right: 1px solid ${palatte.primary.basic};
    transform: rotate(-45deg);
    position: absolute;
    top: -10px;
    left: 60px;
    ${mediaQuery[0]} {
      display: none;
    }
  `;

  return (
    <FlexDiv
      direction="column"
      gap="15px"
      css={reviewContainer}
      display={props.display}>
      <div css={dialogTriangle}></div>
      <H6>你覺得這個景點如何？</H6>
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
          <Button
            addCss={css`
              align-self: flex-end;
              ${mediaQuery[0]} {
                width: 100%;
                font-size: 16px;
              }
            `}
            styled="primary"
            width="fit-content"
            type="click"
            onClick={async () => {
              const uploadFirestore = new uploadReviewFirestore({
                uid,
                itineraryId: props.itineraryId,
                scheduleId: props.scheduleId,
                updateSchedule: {
                  review_tags: checkedReviewTags,
                  review: review ? review : '',
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
                if (props.setUploadedReview) {
                  props.setUploadedReview({
                    schedule_id: props.scheduleId,
                    review_tags: checkedReviewTags,
                    review,
                    gallery: newGallery,
                  });
                }
              });
            }}>
            儲存心得
          </Button>
        )}
      </FlexDiv>
    </FlexDiv>
  );
}

export { ReviewTags, ReviewGallery, AddReview, uploadReviewFirestore };
