import { useNavigate, useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useContext, useEffect, useRef, useState, useReducer } from 'react';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import {
  Container,
  FlexDiv,
  Image,
  FlexChildDiv,
} from './styledComponents/Layout';
import { SpotCard, DurationText } from './styledComponents/Cards';
import {
  timestampToString,
  filterDaySchedules,
  timestampToTimeInput,
  timestampToDateInput,
} from '../utils/utilities';
import { AddReview, AddReviewTags } from './EditReview';
import { Overview } from './EditItinerary';
import { Pagination } from './Pagination';
import { Modal, Confirm } from './styledComponents/Modal';
import { SearchBar } from '../utils/googleMap';
import {
  Button,
  ButtonSmall,
  RoundButtonSmall,
} from './styledComponents/Button';
import {
  Loader,
  H3,
  H5,
  P,
  styles,
  palatte,
} from './styledComponents/basicStyle';
import { Accordion } from './styledComponents/Accordion';
import { Select, TextInput, CustomTimePicker } from './styledComponents/Form';
import {
  Notification,
  defaultNotification,
  notificationReducer,
} from './styledComponents/Notification';

function TravelJournalDetail() {
  const { uid, map } = useContext(Context);
  const { journalID } = useParams();
  const [scheduleList, setScheduleList] = useState();
  const allSchedules = useRef();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  const [schedulesExpand, setSchedulesExpand] = useState();
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [reviewTags, setReviewTags] = useState();
  const [uploadedReview, setUploadedReview] = useState();
  const [showAddSchedule, setShowAddSchedule] = useState();
  const [isAddingSchedule, setIsAddingSchedule] = useState();
  const [notification, dispatchNotification] = useReducer(
    notificationReducer,
    defaultNotification
  );

  const initialSchedule = {
    start_time: '',
    end_time: 0,
    duration: 30,
    placeDetail: undefined,
    place_id: '',
    travel_mode: 'DRIVING',
    transit_detail: '',
  };
  const addScheduleReducer = (state, action) => {
    switch (action.type) {
      case 'changePlace':
        return {
          ...state,
          placeDetail: action.playload,
          place_id: action.playload.place_id,
        };
      case 'choseDate':
        return {
          ...state,
          start_time: action.playload,
        };
      case 'choseTime':
        const startTime = new Date(action.playload).setDate(
          new Date(state.start_time).getDate()
        );
        return {
          ...state,
          start_time: startTime,
          end_time: startTime + state.duration * 60 * 1000,
        };
      case 'addDuration':
        return {
          ...state,
          duration: action.playload,
          end_time: state.start_time + action.playload * 60 * 1000,
        };
      case 'reset':
        return initialSchedule;
      default:
        return state;
    }
  };
  const [addSchedule, dispatchAddSchedule] = useReducer(
    addScheduleReducer,
    initialSchedule
  );

  const uploadNewSchedule = () => {
    if (addSchedule.start_time && addSchedule.placeDetail) {
      setIsAddingSchedule(true);
      firestore
        .addSchedule(uid, overviews.itinerary_id, addSchedule)
        .then((newSchedule) => {
          setShowAddSchedule(false);
          dispatchNotification({
            type: 'fire',
            playload: {
              type: 'success',
              message: '已加入行程',
              id: 'toastifyUpload',
            },
          });
          setIsAddingSchedule(false);
          overviews.depart_times.forEach((timestamp, index, array) => {
            if (
              new Date(newSchedule.start_time).getDate() ===
              new Date(timestamp).getDate()
            ) {
              allSchedules.current[index].push(newSchedule);
              allSchedules.current[index].sort(
                (a, b) => a.start_time - b.start_time
              );
            }
            setScheduleList([...allSchedules.current[day]]);
            dispatchAddSchedule({ type: 'reset' });
          });
        })
        .catch((error) => console.error(error));
    }
  };
  const deleteSchedule = (scheduleId) => {
    firestore
      .deleteSchedule(uid, journalID, scheduleId)
      .then(() => {
        const newScheduleList = scheduleList.filter(
          (oldSchedule) => oldSchedule.schedule_id !== scheduleId
        );
        setScheduleList(newScheduleList);
        allSchedules.current[day] = newScheduleList;
        dispatchNotification({
          type: 'fire',
          playload: {
            type: 'success',
            message: '刪除成功',
            id: 'toastifyDeleted',
          },
        });
        dispatchNotification({ type: 'close' });
      })
      .catch((error) => console.error(error));
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const itineraryRes = await firestore.getItinerary(uid, journalID);
        setOverviews(itineraryRes.overviews);
        allSchedules.current = filterDaySchedules(
          itineraryRes.schedules,
          itineraryRes.overviews.depart_times
        );
        setScheduleList([...allSchedules.current[day]]);
        const profile = await firestore.getProfile(uid);
        setReviewTags(profile.review_tags);
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
      setScheduleList([...newScheduleList]);
      allSchedules.current[day] = [...newScheduleList];
    }
  }, [uploadedReview]);

  const switchDay = (nextDay) => {
    setDay(nextDay);
    setScheduleList(allSchedules.current[nextDay]);
    window.scrollTo(0, 0);
  };
  return (
    <>
      <Notification
        type={notification.type}
        fire={
          notification.fire && notification.id.match('toastify')?.length > 0
        }
        message={notification.message}
        id={notification.id}
        resetFireState={() => dispatchNotification({ type: 'close' })}
      />
      <Confirm
        dispatchIsShowReducer={dispatchNotification}
        isShowState={
          notification.fire && notification.id.match('confirm')?.length > 0
        }
        confirmMessage={notification.message}
        yesMessage="刪除"
        yesBtnStyle="danger"
        noBtnStyle="gray"
        yesAction={notification.yesAction}
      />
      {overviews && scheduleList ? (
        <>
          <Modal
            isShowState={showAddSchedule}
            close={() => setShowAddSchedule(false)}
            minWidth="80%"
            height="80%">
            <FlexDiv direction="column" height="100%">
              {isAddingSchedule ? (
                <Loader />
              ) : (
                <>
                  <SearchBar
                    placeholder="輸入要加入的景點"
                    dispatch={(place) =>
                      dispatchAddSchedule({
                        type: 'changePlace',
                        playload: place,
                      })
                    }
                    map={map}
                    addCss={{
                      container: { position: 'relative', width: '100%' },
                    }}
                    option={{
                      fields: [
                        'name',
                        'place_id',
                        'formatted_address',
                        'photos',
                        'url',
                      ],
                    }}
                  />
                  {addSchedule.placeDetail && (
                    <SpotCard
                      imgSrc={addSchedule.placeDetail.photos[0]}
                      imgAlt={addSchedule.placeDetail.name}
                      title={addSchedule.placeDetail.name}
                      address={addSchedule.placeDetail.formatted_address}
                      onClick={() =>
                        window.open(addSchedule.placeDetail.url, '_blank')
                      }
                      addCss={css`
                        padding: 20px;
                      `}
                    />
                  )}
                  <FlexChildDiv
                    display="flex"
                    direction="column"
                    gap="20px"
                    padding="20px"
                    grow="1">
                    <Select
                      defaultValue=""
                      onChange={(e) =>
                        dispatchAddSchedule({
                          type: 'choseDate',
                          playload: Number(e.target.value),
                        })
                      }>
                      <option value="" disabled>
                        ---請選擇日期---
                      </option>
                      {overviews.depart_times.map((timestamp) => (
                        <option value={timestamp} key={timestamp}>
                          {timestampToString(timestamp, 'date')}
                        </option>
                      ))}
                    </Select>
                    <CustomTimePicker
                      value={addSchedule.start_time}
                      onChange={(newValue) => {
                        console.log(newValue);
                        dispatchAddSchedule({
                          type: 'choseTime',
                          playload: newValue,
                        });
                      }}
                    />
                    <FlexDiv gap="10px" alignItems="center">
                      <P>停留時間</P>
                      <TextInput
                        type="number"
                        min="30"
                        max="1440"
                        value={addSchedule.duration}
                        step="30"
                        width="fit-content"
                        onChange={(e) =>
                          dispatchAddSchedule({
                            type: 'addDuration',
                            playload: Number(e.target.value),
                          })
                        }
                      />
                      <P>分鐘</P>
                    </FlexDiv>
                    <Button
                      styled="primary"
                      margin="auto 0 0 0"
                      onClick={uploadNewSchedule}>
                      新增行程
                    </Button>
                  </FlexChildDiv>
                </>
              )}
            </FlexDiv>
          </Modal>

          <Overview
            containerCss={styles.containerSetting}
            overviews={overviews}
            day={day}
            isAllowEdit={isAllowEdit}
            setIsAllowEdit={setIsAllowEdit}
            isShowCloseBtn
            hideDay
            isJournal
          />
          <Container
            addCss={styles.containerSetting}
            margin="0 auto 100px auto">
            <FlexDiv gap="30px" alignItems="center" margin="0 0 20px 0">
              <FlexDiv direction="column" alignItems="center">
                <H3 whiteSpace="nowrap" color={palatte.primary.basic}>
                  Day {day + 1}
                </H3>
                <P
                  color={palatte.gray[700]}
                  addCss={css`
                    letter-spacing: 2px;
                  `}>
                  {timestampToString(overviews.depart_times[day], 'date')}
                </P>
              </FlexDiv>
              <FlexDiv alignItems="center" wrap="wrap">
                {scheduleList.map((schedule, index, array) => (
                  <P key={schedule.schedule_id} color={palatte.gray[700]}>
                    {schedule.placeDetail.name}
                    {index < array.length - 1 && (
                      <span
                        className="material-icons"
                        css={css`
                          vertical-align: text-bottom;
                          color: inherit;
                        `}>
                        arrow_right_alt
                      </span>
                    )}
                  </P>
                ))}
              </FlexDiv>
            </FlexDiv>
            <FlexDiv justifyContent="flex-end" gap="20px" margin="0 0 20px 0">
              {isAllowEdit && (
                <FlexDiv
                  alignItems="center"
                  gap="10px"
                  justifyContent="flex-end">
                  <P>有計畫外的行程？</P>
                  <ButtonSmall
                    styled="primary"
                    width="fit-content"
                    type="button"
                    onClick={() => {
                      setShowAddSchedule(true);
                    }}>
                    加入行程
                  </ButtonSmall>
                </FlexDiv>
              )}
              <Pagination
                day={day}
                switchDay={switchDay}
                finalDay={overviews.depart_times.length - 1}
              />
            </FlexDiv>
            <FlexDiv direction="column" gap="20px">
              {scheduleList.map((schedule) => (
                <FlexChildDiv
                  grow="1"
                  gap="10px"
                  alignItems="flex-start"
                  key={schedule.schedule_id}>
                  <Accordion
                    isDefualtExpand
                    addCss={css`
                      max-width: ${isAllowEdit && 'calc(100% - 40px)'};
                    `}
                    isHideContent={
                      (!schedule.review_tags ||
                        schedule.review_tags?.length === 0) &&
                      (!schedule.gallery || schedule.gallery?.length === 0) &&
                      !schedule.review
                        ? true
                        : false
                    }
                    titleElement={
                      <FlexDiv gap="30px" alignItems="center">
                        <P color={palatte.gray[500]}>
                          {timestampToString(schedule.start_time, 'time')}
                        </P>
                        <H5 fontSize="24px">{schedule.placeDetail.name}</H5>
                        <DurationText duration={schedule.duration} />
                      </FlexDiv>
                    }
                    isAllowEdit={isAllowEdit}
                    isDisableExpand={
                      schedule.gallery?.length > 0 ||
                      schedule.review_tags?.length > 0 ||
                      schedule.reviews
                        ? false
                        : true
                    }
                    isShowAddIcon={schedulesExpand?.every(
                      (id) => id !== schedule.schedule_id
                    )}>
                    <FlexDiv padding="0 20px 20px 70px">
                      <AddReview
                        isEdit={isAllowEdit}
                        key={schedule.schedule_id}
                        allReviewTags={reviewTags}
                        showReviewTags={
                          schedule.review_tags?.length > 0 ||
                          schedule.gallery?.length > 0 ||
                          schedule.reviews
                            ? schedule.review_tags
                            : reviewTags
                        }
                        itineraryId={journalID}
                        scheduleId={schedule.schedule_id}
                        updateOriginReviewState={setUploadedReview}
                        reviews={{
                          review_tags: schedule.review_tags,
                          review: schedule.review,
                          gallery: schedule.gallery,
                        }}
                        isJournal
                      />
                    </FlexDiv>
                  </Accordion>
                  {isAllowEdit && (
                    <RoundButtonSmall
                      styled="transparent"
                      size="30px"
                      close
                      padding="2px 0 0 2px"
                      fontSize="24px"
                      addCss={css`
                        margin-top: 18px;
                        &:hover {
                          background-color: ${palatte.white};
                        }
                      `}
                      className="material-icons"
                      onClick={() => {
                        dispatchNotification({
                          type: 'fire',
                          playload: {
                            id: 'confirmDelete',
                            message: `確定要刪除 ${schedule.placeDetail.name} 這筆行程嗎？`,
                            yesAction: () => {
                              deleteSchedule(schedule.schedule_id);
                            },
                          },
                        });
                      }}>
                      delete
                    </RoundButtonSmall>
                  )}
                </FlexChildDiv>
              ))}
            </FlexDiv>
          </Container>
        </>
      ) : (
        <FlexDiv justifyContent="center" padding="100px 0">
          <Loader />
        </FlexDiv>
      )}
    </>
  );
}

export default TravelJournalDetail;
