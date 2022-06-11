import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { Delete, ArrowRightAlt } from '@mui/icons-material';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Context } from '../App';
import { firestore } from '../utils/firebase';
import { DurationText } from './styledComponents/Cards/SpotCard';
import {
  timestampToString,
  filterDaySchedules,
  createDepartTimeAry,
} from '../utils/utilities';
import AddReview from './EditReview/AddReview';
import Overview from './EditItinerary/Overview';
import {
  useUpdateOverviewsFields,
  useUpdateTimeOfSchedule,
  useUpdateDate,
} from './EditItinerary/editScheduleHooks';
import { Pagination } from './styledComponents/Pagination';
import { RoundButtonSmall } from './styledComponents/Buttons/RoundButton';
import {
  Loader,
  styles,
  palatte,
  mediaQuery,
} from './styledComponents/basic/common';
import { H3, H5, P } from './styledComponents/basic/Text';
import { Accordion } from './styledComponents/Accordion';
import AddScheduleController from './TravelJournalDetail/AddScheduleController';

const ScheduleAreaContainer = styled.div`
  ${styles.containerSetting}
  margin:0 auto 100px auto;
`;
const DayRouteWrapper = styled.div`
  ${styles.flex}
  gap: 30px;
  align-items: center;
  margin-bottom: 20px;
`;

const DayTextWrapper = styled.div`
  ${styles.flexColumn}
  align-items: center;
`;
const RouteWrapper = styled.div`
  ${styles.flex}
  align-items: center;
  flex-wrap: wrap;
`;
const RouteTextWrapper = styled.div`
  ${styles.flex}
  align-items: center;
  color: ${palatte.gray[700]};
`;
const ControllerWrapper = styled.div`
  ${styles.flex}
  justify-content:flex-end;
  gap: 20px;
  margin-bottom: 20px;
`;
const SchedulesContainer = styled.div`
  ${styles.flexColumn};
  gap: 20px;
`;

const ScheduleWrapper = styled.div`
  ${styles.flex}
  grow:1;
  gap: 10px;
  align-items: flex-start;
`;
const ScheduleHeaderWrapper = styled.div`
  ${styles.flex}
  gap:30px;
  align-items: center;
  ${mediaQuery[0]} {
    gap: 15px;
    align-items: flex-start;
  }
`;
const ScheduleTitleWrapper = styled(ScheduleHeaderWrapper)`
  ${mediaQuery[0]} {
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
`;
const ScheduleTime = styled(P)`
  color: ${palatte.gray[500]};
  ${mediaQuery[0]} {
    margin-top: 8px;
  }
`;
const AddReviewContainer = styled.div`
  ${styles.flex};
  padding: 0 20px 20px 70px;
  ${mediaQuery[0]} {
    padding: 0 0 5px 0;
  }
`;

const DeleteButton = styled(RoundButtonSmall)`
  padding: 2px 0 0 2px;
  font-size: 24px;
  margin-top: 18px;
  &:hover {
    background-color: ${palatte.white};
  }
`;
function TravelJournalDetail() {
  const { uid, dispatchNotification } = useContext(Context);
  const { journalId } = useParams();
  const navigate = useNavigate();
  const [scheduleList, setScheduleList] = useState();
  const allSchedules = useRef();
  const [overviews, setOverviews] = useState();
  const [day, setDay] = useState(0);
  const [isAllowEdit, setIsAllowEdit] = useState(false);
  const [reviewTags, setReviewTags] = useState();
  const [uploadedReview, setUploadedReview] = useState();
  const updateOverviewsFields = useUpdateOverviewsFields(
    overviews,
    setOverviews
  );
  const updateScheduleState = (newSchedules) => {
    setScheduleList(newSchedules);
    allSchedules.current[day] = newSchedules;
  };
  const updateTimeOfSchedule = useUpdateTimeOfSchedule(updateScheduleState);
  const updateDate = useUpdateDate({
    overviews,
    allSchedules,
    setSchedules: setScheduleList,
    day,
    setDay,
    updateOverviewsFields,
    updateTimeOfSchedule,
  });

  const deleteSchedule = (scheduleId) => {
    firestore
      .deleteSchedule(uid, journalId, scheduleId)
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
            id: 'toastify_deleted',
          },
        });
      })
      .catch((error) => console.error(error));
  };
  useEffect(() => {
    async function fetchData() {
      try {
        const itineraryRes = await firestore.getItinerary(uid, journalId);
        if (itineraryRes.overviews.depart_times) {
          let depart_times = itineraryRes.overviews.depart_times;
          if (itineraryRes.overviews.depart_times.length === 0) {
            depart_times = createDepartTimeAry({
              start_date: itineraryRes.overviews.start_date,
              end_date: itineraryRes.overviews.end_date,
            });
            updateOverviewsFields({
              ...itineraryRes.overviews,
              depart_times,
            });
          } else {
            setOverviews(itineraryRes.overviews);
          }
          allSchedules.current = filterDaySchedules(
            itineraryRes.schedules,
            depart_times
          );
          setScheduleList([...allSchedules.current[day]]);
          const itinerariesSetting = await firestore.getItinerariesSetting(uid);
          setReviewTags(itinerariesSetting.review_tags);
        } else {
          navigate('/error');
        }
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
      {overviews && scheduleList ? (
        <>
          <Overview
            containerCss={styles.containerSetting}
            overviews={overviews}
            setOverviews={setOverviews}
            day={day}
            isAllowEdit={isAllowEdit}
            setIsAllowEdit={setIsAllowEdit}
            updateOverviewsFields={updateOverviewsFields}
            updateDate={updateDate}
            isShowCloseBtn
            isHideDay
            isJournal
          />
          <ScheduleAreaContainer>
            <DayRouteWrapper>
              <DayTextWrapper>
                <H3
                  css={css`
                    white-space: nowrap;
                    color: ${palatte.primary.basic};
                  `}>
                  Day {day + 1}
                </H3>
                <P
                  css={css`
                    letter-spacing: 2px;
                    color: ${palatte.gray[700]};
                  `}>
                  {timestampToString(overviews.depart_times[day], 'date')}
                </P>
              </DayTextWrapper>
              <RouteWrapper>
                {scheduleList.map((schedule, index, array) => (
                  <RouteTextWrapper key={schedule.schedule_id}>
                    <P>{schedule.placeDetail.name}</P>
                    {index < array.length - 1 && <ArrowRightAlt />}
                  </RouteTextWrapper>
                ))}
              </RouteWrapper>
            </DayRouteWrapper>
            <ControllerWrapper>
              {isAllowEdit && (
                <AddScheduleController
                  departTimes={overviews.depart_times}
                  itineraryId={journalId}
                  allSchedules={allSchedules}
                  setScheduleList={setScheduleList}
                  day={day}
                />
              )}
              <Pagination
                day={day}
                switchDay={switchDay}
                finalDay={overviews.depart_times.length - 1}
              />
            </ControllerWrapper>
            <SchedulesContainer>
              {scheduleList.map((schedule) => (
                <ScheduleWrapper key={schedule.schedule_id}>
                  <Accordion
                    isDefualtExpand
                    addCss={css`
                      max-width: ${isAllowEdit ? 'calc(100% - 40px)' : null};
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
                      <ScheduleHeaderWrapper>
                        <ScheduleTime>
                          {timestampToString(schedule.start_time, 'time')}
                        </ScheduleTime>
                        <ScheduleTitleWrapper>
                          <H5 fontSize="24px">{schedule.placeDetail.name}</H5>
                          <DurationText duration={schedule.duration} />
                        </ScheduleTitleWrapper>
                      </ScheduleHeaderWrapper>
                    }
                    isAllowEdit={isAllowEdit}
                    isDisableExpand={
                      schedule.gallery?.length > 0 ||
                      schedule.review_tags?.length > 0 ||
                      schedule.reviews
                        ? false
                        : true
                    }>
                    <AddReviewContainer>
                      <AddReview
                        isEdit={isAllowEdit}
                        key={schedule.schedule_id}
                        allReviewTags={reviewTags}
                        setAllReviewTags={setReviewTags}
                        showReviewTags={
                          schedule.review_tags?.length > 0 ||
                          schedule.gallery?.length > 0 ||
                          schedule.reviews
                            ? schedule.review_tags
                            : reviewTags
                        }
                        itineraryId={journalId}
                        scheduleId={schedule.schedule_id}
                        updateOriginReviewState={setUploadedReview}
                        reviews={{
                          review_tags: schedule.review_tags,
                          review: schedule.review,
                          gallery: schedule.gallery,
                        }}
                        isJournal
                      />
                    </AddReviewContainer>
                  </Accordion>
                  {isAllowEdit && (
                    <DeleteButton
                      styled="transparent"
                      size="30px"
                      close
                      onClick={() => {
                        dispatchNotification({
                          type: 'fire',
                          playload: {
                            type: 'danger',
                            id: 'confirm_delete',
                            message: `確定要刪除 ${schedule.placeDetail.name} 這筆行程嗎？`,
                            subMessage: '(此動作無法復原)',
                            yesAction: () => {
                              deleteSchedule(schedule.schedule_id);
                            },
                          },
                        });
                      }}>
                      <Delete />
                    </DeleteButton>
                  )}
                </ScheduleWrapper>
              ))}
            </SchedulesContainer>
          </ScheduleAreaContainer>
        </>
      ) : (
        <div
          css={css`
            justify-content: center;
            padding: 100px 0;
          `}>
          <Loader />
        </div>
      )}
    </>
  );
}

export default TravelJournalDetail;
