import { useContext, useEffect, useState, useRef, useReducer } from 'react';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { CSSTransition } from 'react-transition-group';
import 'animate.css';
import '../css/animation.css';
import { uploadReviewFirestore } from '../utils/utilities';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import { FlexDiv, Container, Image } from './styledComponents/Layout';
import {
  TextAreaReview,
  ReviewTag,
  inputBaseSmall,
  AddImages,
  uploadImageStyle,
} from './styledComponents/Form';
import {
  RoundButtonSmall,
  Button,
  RoundButtonSmallOutline,
  ButtonSmall,
} from './styledComponents/Button';
import { palatte, P, H6, mediaQuery } from './styledComponents/basicStyle';
import {
  Notification,
  defaultNotification,
  notificationReducer,
} from './styledComponents/Notification';

function ReviewTags(props) {
  const tagContainer = useRef();
  const [isShowShadow, setIsShowShadow] = useState();
  useEffect(() => {
    if (tagContainer.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (
          entries[0].borderBoxSize[0].inlineSize < entries[0].target.scrollWidth
        ) {
          setIsShowShadow(true);
        } else {
          setIsShowShadow(false);
        }
      });
      resizeObserver.observe(tagContainer.current, { box: 'border-box' });
      return function cleanup() {
        resizeObserver.disconnect();
      };
    }
  }, [tagContainer]);
  return (
    <FlexDiv alignItems="center" gap="10px" padding="0 0 10px 0">
      {props.defaultTags && (
        <FlexDiv
          gap="12px"
          overflowY="auto"
          ref={tagContainer}
          position="relative">
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
      )}
      <FlexDiv position="relative">
        {isShowShadow && (
          <div
            css={css`
              position: absolute;
              top: -6px;
              left: -18px;
              width: 10px;
              height: 38px;
              background: linear-gradient(
                90deg,
                rgba(0, 0, 0, 0),
                ${palatte.shadow}
              );
            `}></div>
        )}
        {props.isEdit ? (
          props.showInput ? (
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
                placeholder="新增心得標籤"
                value={props.inputTag}
                onChange={(e) => {
                  props.setInputTag(e.target.value);
                }}
              />
              <RoundButtonSmallOutline
                className="material-icons"
                type="submit"
                color="primary"
                addCss={css`
                  border-radius: 10px;
                `}>
                done
              </RoundButtonSmallOutline>
              <RoundButtonSmallOutline
                className="material-icons"
                type="button"
                color="danger"
                addCss={css`
                  border-radius: 10px;
                `}
                onClick={() => props.setShowInput(false)}>
                close
              </RoundButtonSmallOutline>
            </form>
          ) : (
            <RoundButtonSmall
              type="button"
              className="material-icons"
              onClick={() => {
                props.setShowInput(true);
              }}>
              add_circle
            </RoundButtonSmall>
          )
        ) : null}
      </FlexDiv>
    </FlexDiv>
  );
}

function ReviewGallery(props) {
  const galleryContainer = useRef();
  const [isShowShadow, setIsShowShadow] = useState();
  useEffect(() => {
    if (galleryContainer.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (
          entries[0].borderBoxSize[0].inlineSize < entries[0].target.scrollWidth
        ) {
          setIsShowShadow(true);
        } else {
          setIsShowShadow(false);
        }
      });
      resizeObserver.observe(galleryContainer.current, { box: 'border-box' });
      return function cleanup() {
        resizeObserver.disconnect();
      };
    }
  }, [galleryContainer]);
  const closeBtn = css`
    position: absolute;
    right: 4px;
    top: 7px;
    background-color: ${palatte.white};
    border-radius: 50%;
    color: ${palatte.gray['300']};
  `;
  const image = css`
    ${uploadImageStyle}
    box-shadow: 2px 2px 2px 2px ${palatte.shadow};
    margin-bottom: 4px;
  `;
  const preview = css`
    width: 60px;
    height: 40px;
    padding: 5px 10px;
    border: 5px solid ${palatte.primary['300']};
    border-radius: 30px;
    background-color: ${palatte.white};
    position: absolute;
    bottom: 4px;
    left: 0px;
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
    <FlexDiv gap="15px">
      {(props.gallery?.length > 0 || props.imageBuffer?.length > 0) && (
        <FlexDiv gap="15px" ref={galleryContainer} overflowY="auto">
          {props.gallery?.length > 0 && (
            <FlexDiv gap="15px">
              {props.gallery?.map((url, index) => (
                <Container key={index} position="relative" margin="0 5px 0 0">
                  <Image
                    addCss={image}
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
                </Container>
              ))}
            </FlexDiv>
          )}
          {props.imageBuffer?.length > 0 && (
            <FlexDiv gap="15px">
              {props.imageBuffer.map((blob, index) => {
                const blobUrl = URL.createObjectURL(blob);
                return (
                  <Container
                    key={blob.lastModified}
                    position="relative"
                    margin="0 5px 0 0">
                    <Image
                      addCss={css`
                        ${image}
                        border-radius: 10px;
                        border: 8px solid ${palatte.primary['300']};
                      `}
                      width="250px"
                      height="200px"
                      src={blobUrl}
                      alt={blob.name}
                    />
                    <P
                      fontSize="14px"
                      addCss={preview}
                      color={palatte.primary.basic}>
                      預覽
                    </P>
                    <RoundButtonSmall
                      className="material-icons"
                      close
                      addCss={closeBtn}
                      onClick={() => {
                        const newImagesBuffer = props.imageBuffer.filter(
                          (_, newIndex) => index !== newIndex
                        );
                        props.setImageBuffer(newImagesBuffer);
                      }}>
                      cancel
                    </RoundButtonSmall>
                  </Container>
                );
              })}
            </FlexDiv>
          )}
        </FlexDiv>
      )}
      {props.isEdit && (
        <AddImages
          imageBuffer={props.imageBuffer}
          setImageBuffer={props.setImageBuffer}
          isScroll={isShowShadow}
        />
      )}
    </FlexDiv>
  );
}

function AddReviewTags(props) {
  const { uid } = useContext(Context);
  const [reviewTags, setReviewTags] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [addTag, setAddTag] = useState('');
  const [showInput, setShowInput] = useState();

  const addCheckedTag = (e) => {
    e.preventDefault();
    if (addTag) {
      setReviewTags(reviewTags ? [...reviewTags, addTag] : [addTag]);
      setCheckedReviewTags(
        checkedReviewTags ? [...checkedReviewTags, addTag] : [addTag]
      );
      firestore.editProfile(uid, {
        review_tags: reviewTags ? [...reviewTags, addTag] : [addTag],
      });
      setAddTag('');
    }
  };

  useEffect(() => {
    if (props.allReviewTags?.length > 0) {
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
    setCheckedReviewTags(props.checkedReviewTags);
  }, [props.isEdit, props.allReviewTags]);
  return (
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
  );
}

function AddReview(props) {
  const { uid } = useContext(Context);
  const [reviewTags, setReviewTags] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [addTag, setAddTag] = useState('');
  const [gallery, setGallery] = useState();
  const [imageBuffer, setImageBuffer] = useState();
  const [showInput, setShowInput] = useState();
  const [review, setReview] = useState();
  const [reviewShowInput, setReviewShowInput] = useState(false);
  const addReviewRef = useRef();
  const [isDesktop, setIsDesktop] = useState();
  const [notification, dispatchNotification] = useReducer(
    notificationReducer,
    defaultNotification
  );

  const addCheckedTag = (e) => {
    e.preventDefault();
    if (addTag) {
      setReviewTags(reviewTags ? [addTag, ...reviewTags] : [addTag]);
      setCheckedReviewTags(
        checkedReviewTags ? [addTag, ...checkedReviewTags] : [addTag]
      );
      firestore.editProfile(uid, {
        review_tags: reviewTags ? [addTag, ...reviewTags] : [addTag],
      });
      setAddTag('');
    }
  };
  const saveReviewToFirebase = async () => {
    if (review || checkedReviewTags?.length > 0 || imageBuffer?.length > 0) {
      const uploadFirestore = new uploadReviewFirestore({
        uid,
        itineraryId: props.itineraryId,
        scheduleId: props.scheduleId,
        updateSchedule: {
          review_tags: checkedReviewTags ? checkedReviewTags : [],
          review: review ? review : '',
        },
        imageBuffer,
        gallery,
      });
      uploadFirestore.doUpload().then((newGallery) => {
        setGallery(newGallery);
        setImageBuffer([]);
        setReviewShowInput(false);
        const checkTagList = checkedReviewTags ? [...checkedReviewTags] : [];
        setReviewTags(
          props.allReviewTags
            ? [
                ...checkTagList,
                ...reviewTags.filter(
                  (tag) =>
                    checkedReviewTags.every((checked) => checked !== tag) && tag
                ),
              ]
            : checkTagList
        );

        if (props.setUploadedReview) {
          props.setUploadedReview({
            schedule_id: props.scheduleId,
            review_tags: checkedReviewTags,
            review,
            gallery: newGallery,
          });
        }
        if (props.showReview && !isDesktop) {
          props.setShowReview(false);
        }
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'success',
            message: '上傳成功',
            id: 'toastifyUploadSuccess',
          },
        });
      });
    } else {
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'warn',
          message: '還沒有加入內容喔！',
          id: 'toastifyEmpty',
        },
      });
    }
  };
  useEffect(() => {
    const checkDesktop = () => {
      if (window.innerWidth > 992) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };
    checkDesktop();
    if (props.setShowReview) {
      if (isDesktop) {
        props.setShowReview(true);
      } else {
        props.setShowReview(false);
      }
    }
    window.addEventListener('resize', checkDesktop);
    return () => {
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);
  useEffect(() => {
    if (props.allReviewTags?.length > 0) {
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
  }, [props.isEdit, props.allReviewTags]);
  const reviewContainer = css`
    border-radius: 30px;
    ${!props.isJournal &&
    `background-color: ${palatte.white};
    border: 1px solid ${palatte.primary.basic};
    padding: 30px 40px 40px 40px;
    `}
    max-width: 100%;
    flex: 1;
    position: relative;
    ${mediaQuery[0]} {
      ${!props.isJournal &&
      `
      position: fixed;
      border-radius: 0;
      width: 100%;
      bottom: 75px;
      left: 0;
      z-index: 10;
      gap: 10px;
      `}
    }
    ${props.addCss}
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
    <>
      <Notification
        type={notification.type}
        fire={notification.fire}
        message={notification.message}
        id={notification.id}
        resetFireState={() => dispatchNotification({ type: 'close' })}
      />
      <CSSTransition
        nodeRef={addReviewRef}
        timeout={600}
        in={isDesktop ? true : props.showReview}
        classNames={{
          enter: 'animate__animated',
          enterActive: 'animate__fadeInUp',
          exit: 'animate__animated',
          exitActive: 'animate__fadeOutDown',
        }}
        unmountOnExit>
        <FlexDiv
          ref={addReviewRef}
          direction="column"
          gap="15px"
          css={reviewContainer}
          position="relative"
          display={props.display}>
          {!props.isJournal && (
            <>
              <div css={dialogTriangle}></div>
              <H6>你覺得這個景點如何？</H6>
              <RoundButtonSmall
                styled="transparent"
                className="material-icons"
                width="fit-content"
                addCss={css`
                  display: none;
                  ${mediaQuery[0]} {
                    display: block;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    padding: 5px;
                  }
                `}
                onClick={() =>
                  props.setShowReview && props.setShowReview(false)
                }>
                close
              </RoundButtonSmall>
            </>
          )}
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
                isEmptyInput={review && false}
                readOnly={reviewShowInput}
                onChange={(e) => {
                  setReview(e.target.value);
                }}
                onClick={() => {
                  setReviewShowInput(false);
                }}
              />
            ) : (
              <P>{review}</P>
            )}
            {props.isEdit && (
              <Button
                addCss={css`
                  margin-top: 10px;
                  align-self: flex-end;
                  ${mediaQuery[0]} {
                    width: 100%;
                    font-size: 16px;
                  }
                `}
                styled="primary"
                width="fit-content"
                type="click"
                onClick={saveReviewToFirebase}>
                儲存心得
              </Button>
            )}
          </FlexDiv>
        </FlexDiv>
      </CSSTransition>
    </>
  );
}

export {
  ReviewTags,
  ReviewGallery,
  AddReview,
  uploadReviewFirestore,
  AddReviewTags,
};
