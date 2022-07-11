import { useContext, useEffect, useState, useRef } from 'react';
import { Close } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import 'animate.css';
import '../../css/animation.css';
import {
  uploadReviewFirestore,
  checkArraysIsTheSame,
} from '../../utils/utilities';
import { firestore } from '../../utils/firebase';
import { Context } from '../../App';
// import { TextAreaReview } from '../styledComponents/Form';
import ReviewInput from './ReviewInput';
import { RoundButtonSmall } from '../styledComponents/Buttons/RoundButton';
import { Button } from '../styledComponents/Buttons/Button';
import {
  palatte,
  styles,
  mediaQuery,
  PendingLoader,
} from '../styledComponents/basic/common';
import { P, H6 } from '../styledComponents/basic/Text';
import ReviewTags from './ReviewTags';
import ReviewGallery from './ReviewGallery';

const Container = styled.div`
  ${styles.flexColumn};
  margin-top: 10px;
  gap: 15px;
  position: relative;
  border-radius: 30px;
  ${(props) =>
    !props.isJournal
      ? `background-color: ${palatte.white};
    border: 1px solid ${palatte.primary.basic};
    padding: 30px 40px 40px 40px;
    `
      : null}
  max-width: 100%;
  flex: 1;
  position: relative;
  ${mediaQuery[0]} {
    ${(props) =>
      !props.isJournal
        ? `
      margin-top: 0;
      position: fixed;
      border-radius: 0;
      width: 100%;
      bottom: 75px;
      left: 0;
      z-index: 10;
      gap: 10px;
      `
        : null}
  }
`;
const DialogTriangle = styled.div`
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
const CloseButton = styled(RoundButtonSmall)`
  display: none;
  ${mediaQuery[0]} {
    width: fit-content;
    display: block;
    font-size: 18px;
    position: absolute;
    top: 5px;
    right: 5px;
    padding-top: 1px;
    padding-left: 1px;
  }
`;
const ReviewWrapper = styled.div`
  ${styles.flexColumn}
`;
const SaveButton = styled(Button)`
  width: fit-content;
  margin-top: 10px;
  align-self: flex-end;
  ${mediaQuery[0]} {
    width: 100%;
    font-size: 16px;
  }
`;
function AddReview({
  itineraryId,
  scheduleId,
  isShowReview,
  setIsShowReview,
  isEdit,
  allReviewTags,
  setAllReviewTags,
  showReviewTags,
  reviews,
  isJournal,
  updateOriginReviewState,
}) {
  const { uid, dispatchNotification } = useContext(Context);
  const [reviewTags, setReviewTags] = useState();
  const [checkedReviewTags, setCheckedReviewTags] = useState();
  const [gallery, setGallery] = useState();
  const [imageBuffer, setImageBuffer] = useState();
  const [isShowInput, setIsShowInput] = useState();
  const [review, setReview] = useState();
  const [isReviewShowInput, setIsReviewShowInput] = useState(false);
  const addReviewRef = useRef();
  const saveButtonRef = useRef();
  const addTagsForGlobal = useRef([]);
  const [isDesktop, setIsDesktop] = useState();
  const [isPending, setIsPending] = useState();

  const addCheckedTag = (addTag, setAddTag) => {
    if (addTag) {
      setReviewTags(reviewTags ? [addTag, ...reviewTags] : [addTag]);
      setCheckedReviewTags(
        checkedReviewTags ? [addTag, ...checkedReviewTags] : [addTag]
      );
      addTagsForGlobal.current.push(addTag);
      setAddTag('');
    }
  };
  const saveReviewToFirebase = async () => {
    setIsPending(true);
    const uploadFirestore = new uploadReviewFirestore({
      uid,
      itineraryId: itineraryId,
      scheduleId: scheduleId,
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
      setIsReviewShowInput(false);
      const checkTagList = checkedReviewTags ? [...checkedReviewTags] : [];
      setReviewTags(
        allReviewTags
          ? [
              ...checkTagList,
              ...reviewTags.filter(
                (tag) =>
                  checkedReviewTags.every((checked) => checked !== tag) && tag
              ),
            ]
          : checkTagList
      );
      if (addTagsForGlobal.current.length > 0) {
        firestore
          .setItinerariesSetting(uid, {
            review_tags: allReviewTags
              ? [...addTagsForGlobal.current, ...allReviewTags]
              : addTagsForGlobal.current,
          })
          .then(() => {
            setAllReviewTags((prev) => [...prev, ...addTagsForGlobal.current]);
          });
      }
      if (updateOriginReviewState) {
        updateOriginReviewState({
          schedule_id: scheduleId,
          review_tags: checkedReviewTags,
          review,
          gallery: newGallery,
        });
      }
      setIsPending(false);
      if (isShowReview && !isDesktop) {
        setIsShowReview(false);
      }
      dispatchNotification({
        type: 'fire',
        playload: {
          type: 'success',
          message: '上傳成功',
          id: 'toastify_uploadSuccess',
        },
      });
    });
  };
  useEffect(() => {
    if (!isEdit) {
      setImageBuffer(undefined);
    }
  }, [isEdit]);
  useEffect(() => {
    const checkDesktop = () => {
      if (window.innerWidth > 992) {
        setIsDesktop(true);
      } else {
        setIsDesktop(false);
      }
    };
    checkDesktop();
    if (setIsShowReview) {
      if (isDesktop) {
        setIsShowReview(true);
      } else {
        setIsShowReview(false);
      }
    }
    window.addEventListener('resize', checkDesktop);
    return () => {
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);
  useEffect(() => {
    if (allReviewTags?.length > 0) {
      setIsShowInput(false);
    } else {
      setIsShowInput(true);
    }
    const newReviewTags = () => {
      if (isEdit && allReviewTags) {
        if (showReviewTags) {
          return [
            ...showReviewTags,
            ...allReviewTags.filter(
              (tag) =>
                showReviewTags.every((recorded) => recorded !== tag) && tag
            ),
          ];
        } else {
          return [...allReviewTags];
        }
      } else {
        return showReviewTags;
      }
    };
    setReviewTags(newReviewTags());
    setGallery(reviews.gallery);
    setCheckedReviewTags(reviews.review_tags);
    setReview(reviews.review);
  }, [isEdit, allReviewTags]);

  return (
    <>
      <CSSTransition
        nodeRef={addReviewRef}
        timeout={600}
        in={isDesktop || isJournal ? true : isShowReview}
        classNames={{
          enter: 'animate__animated',
          enterActive: 'animate__fadeInUp',
          exit: 'animate__animated',
          exitActive: 'animate__fadeOutDown',
        }}
        unmountOnExit>
        <Container isJournal={isJournal} ref={addReviewRef}>
          {!isJournal && (
            <>
              <DialogTriangle />
              <H6>你覺得這個景點如何？</H6>
              <CloseButton
                styled="transparent"
                onClick={() => setIsShowReview && setIsShowReview(false)}>
                <Close />
              </CloseButton>
            </>
          )}
          {((!isEdit && checkedReviewTags && checkedReviewTags?.length > 0) ||
            isEdit) && (
            <ReviewTags
              defaultTags={reviewTags}
              checkedTags={checkedReviewTags}
              setCheckedTags={setCheckedReviewTags}
              addCheckedTag={addCheckedTag}
              isEdit={isEdit}
              isShowInput={isShowInput}
              setIsShowInput={setIsShowInput}
            />
          )}

          {((!isEdit && gallery && gallery?.length > 0) || isEdit) && (
            <ReviewGallery
              isEdit={isEdit}
              gallery={gallery}
              setGallery={setGallery}
              imageBuffer={imageBuffer}
              setImageBuffer={setImageBuffer}
            />
          )}

          {((!isEdit && review) || isEdit) && (
            <ReviewWrapper>
              <ReviewInput
                isEdit={isEdit && isJournal}
                review={review}
                setReview={setReview}
                isReviewShowInput={isReviewShowInput}
              />
              {/* {isEdit && isJournal ? (
                
                <TextAreaReview
                  type="textarea"
                  placeholder="添加一點旅行後的心得吧！"
                  value={review}
                  isEmptyInput={review && false}
                  readOnly={reviewShowInput}
                  onChange={(e) => {
                    let review = e.target.value;
                    setReview(review.replace(/[<>"']/, ''));
                  }}
                  onClick={() => {
                    setReviewShowInput(false);
                  }}
                />
              ) : (
                <P>{review}</P>
              )} */}
              <CSSTransition
                in={
                  isEdit &&
                  (!checkArraysIsTheSame(
                    checkedReviewTags,
                    reviews.review_tags
                  ) ||
                    !checkArraysIsTheSame(gallery, reviews.gallery) ||
                    imageBuffer?.length > 0 ||
                    review !== reviews.review)
                }
                timeout={400}
                nodeRef={saveButtonRef}
                classNames={{
                  enter: 'animate__animated',
                  enterActive: 'animate__fadeIn',
                  exit: 'animate__animated',
                  exitActive: 'animate__fadeOut',
                }}
                unmountOnExit>
                <SaveButton
                  ref={saveButtonRef}
                  disabled={isPending}
                  styled="primary"
                  type="button"
                  onClick={saveReviewToFirebase}>
                  {isPending ? (
                    <div
                      css={css`
                        width: 70px;
                      `}>
                      <PendingLoader size="24" />
                    </div>
                  ) : (
                    '儲存心得'
                  )}
                </SaveButton>
              </CSSTransition>
            </ReviewWrapper>
          )}
        </Container>
      </CSSTransition>
    </>
  );
}

AddReview.propTypes = {
  itineraryId: PropTypes.string,
  scheduleId: PropTypes.string,
  isShowReview: PropTypes.bool,
  setIsShowReview: PropTypes.func,
  isEdit: PropTypes.bool,
  allReviewTags: PropTypes.array,
  setAllReviewTags: PropTypes.func,
  showReviewTags: PropTypes.array,
  reviews: PropTypes.shape({
    gallery: PropTypes.array,
    review_tags: PropTypes.array,
    review: PropTypes.string,
  }),
  isJournal: PropTypes.bool,
  updateOriginReviewState: PropTypes.func,
};

export default AddReview;
