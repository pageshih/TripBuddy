import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import styled from '@emotion/styled';
/** @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { firestore } from '../utils/firebase';
import { Context } from '../App';
import {
  TextInput,
  SelectAllCheckBox,
  AddImageRoundBtn,
  SelectSmall,
} from './styledComponents/Form';
import {
  Button,
  RoundButtonSmallWhite,
  ButtonOutline,
  HyperLink,
  RoundButtonSmall,
  ButtonSmall,
  ButtonIconColumn,
} from './styledComponents/Button';
import {
  Container,
  FlexDiv,
  FlexChildDiv,
  Image,
} from './styledComponents/Layout';
import {
  Card,
  cardCss,
  ScheduleCard,
  SpotCard,
  TextWithIcon,
  transportMode,
} from './styledComponents/Cards';
import {
  timestampToString,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
  updateItineraryCoverPhoto,
} from '../utils/utilities';
import { googleMap } from '../utils/googleMap';
import { Pagination } from './Pagination';
import {
  palatte,
  styles,
  H2,
  H3,
  H5,
  H6,
  P,
} from './styledComponents/basicStyle';
import { EditableText, EditableDate } from './styledComponents/EditableText';
import {
  Overview,
  DepartController,
  MoveScheduleController,
} from './EditItinerary';
// import { style } from '@mui/system';

// function ChooseDate(props) {
//   return (
//     <>
//       <LocalizationProvider dateAdapter={AdapterLuxon}>
//         <FlexDiv gap="20px">
//           <DatePicker
//             label="date range"
//             value={props.startDate}
//             onChange={(newDate) => {
//               props.setStartDate(newDate);
//             }}
//             renderInput={({ inputRef, inputProps, InputProps }) => (
//               <FlexDiv alignItems="center">
//                 <TextInput
//                   ref={inputRef}
//                   {...inputProps}
//                   placeholder="旅程開始日期"
//                   readOnly
//                 />
//                 {InputProps?.endAdornment}
//               </FlexDiv>
//             )}
//           />
//           <p>到</p>
//           <DatePicker
//             label="date range"
//             value={props.endDate}
//             onChange={(newDate) => {
//               props.setEndDate(newDate);
//             }}
//             renderInput={({ inputRef, inputProps, InputProps }) => (
//               <FlexDiv alignItems="center">
//                 <TextInput
//                   ref={inputRef}
//                   {...inputProps}
//                   placeholder="旅程結束日期"
//                   readOnly
//                 />
//                 {InputProps?.endAdornment}
//               </FlexDiv>
//             )}
//           />
//         </FlexDiv>
//       </LocalizationProvider>
//     </>
//   );
// }

function AddOverView(props) {
  const { uid } = useContext(Context);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime());
  const [step, setStep] = useState(0);

  const addOverView = [
    {
      title: '為這趟旅程取個名字吧！',
      type: 'text',
      placeholder: '請輸入行程名稱',
      alert: '行程名稱還沒填喔！',
    },
    {
      title: '您選擇了這些景點：',
      type: 'cards',
      alert: '請加入景點再創建行程',
    },
    {
      title: '預計要去玩幾天呢？',
      type: 'calendar',
      alert: '日期不完整，請確認後再送出！',
    },
  ];
  const createItinerary = () => {
    const getTimestamp = (date) => new Date(date).getTime();
    const basicInfo = {
      title,
      start_date: getTimestamp(startDate),
      end_date: getTimestamp(endDate),
    };
    firestore
      .createItinerary(uid, basicInfo, props.waitingSpots)
      .then((itineraryId) => {
        navigate(`/add/${itineraryId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const nextStep = () => {
    if (
      (step === 0 && title) ||
      (step === 1 && props.waitingSpots?.length > 0) ||
      (step === 2 && startDate && endDate)
    ) {
      setStep((prev) => prev + 1);
    } else {
      alert(addOverView[step].alert);
    }
  };
  return (
    <Container backgroundColor={palatte.gray[100]}>
      <FlexDiv
        as="form"
        height="100vh"
        gap="60px"
        direction="column"
        justifyContent="center"
        addCss={styles.containerSetting}
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) {
            nextStep();
          } else {
            createItinerary();
          }
        }}>
        <FlexDiv direction="column" gap="20px">
          <H5>{addOverView[step].title}</H5>
          {addOverView[step].type === 'text' && (
            <TextInput
              type="text"
              placeholder={addOverView[step].placeholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          )}
          {addOverView[step].type === 'cards' &&
            (props.waitingSpots.length > 0 ? (
              <FlexChildDiv
                padding="20px 20px 20px 0"
                gap="30px"
                wrap="wrap"
                overflowY="auto"
                basis="60vh"
                maxHeight="100%">
                {props.waitingSpots?.map((spot) => {
                  return (
                    <SpotCard
                      imgSrc={spot.photos[0]}
                      imgAlt={spot.name}
                      title={spot.name}
                      address={spot.formatted_address}
                      rating={spot.rating}
                      id={spot.place_id}
                      key={spot.place_id}
                      isSmall
                      isShowCloseBtn
                      onCloseClick={() =>
                        props.setWaitingSpots((prev) =>
                          prev.filter(
                            (oldSpot) => oldSpot.place_id !== spot.place_id
                          )
                        )
                      }
                      addCss={css`
                        flex-basis: 30%;
                      `}
                    />
                  );
                })}
              </FlexChildDiv>
            ) : (
              <>
                <P>現在景點清單是空的，請加入景點，再創建行程</P>
                <HyperLink
                  onClick={() => navigate('/explore')}
                  iconName="chevron_right"
                  alignSelf="flex-start">
                  前往探索景點
                </HyperLink>
              </>
            ))}
          {addOverView[step].type === 'calendar' && (
            <FlexDiv gap="20px" alignItems="center">
              <TextInput
                type="date"
                value={timestampToDateInput(startDate)}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
              />
              <P>到</P>
              <TextInput
                type="date"
                value={timestampToDateInput(endDate)}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
              />
            </FlexDiv>
          )}
        </FlexDiv>
        <FlexDiv justifyContent={step < 1 ? 'flex-end' : 'space-between'}>
          {step > 0 && (
            <ButtonOutline
              type="button"
              width="fit-content"
              styled="gray"
              padding="10px 20px 10px 10px"
              onClick={() => setStep((prev) => prev - 1)}>
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_left
              </span>
              上一步
            </ButtonOutline>
          )}
          <Button
            styled="primary"
            type="submit"
            width="fit-content"
            padding={step < 2 && '10px 10px 10px 20px'}>
            {step < 2 ? '下一步' : '新建行程'}
            {step < 2 && (
              <span
                className="material-icons"
                css={css`
                  color: inherit;
                `}>
                chevron_right
              </span>
            )}
          </Button>
        </FlexDiv>
        {/* <ChooseDate
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      /> */}
      </FlexDiv>
    </Container>
  );
}
const SpotStyledCard = styled(Card)`
  position: relative;
  background-color: white;
  flex-direction: column;
  gap: 20px;
  flex-basis: 300px;
  cursor: grab;
  &:hover {
    cursor: grab;
  }
`;
const SpotCardDraggable = (props) => {
  return (
    <Draggable
      draggableId={props.id}
      index={props.index}
      isDragDisabled={!props.isAllowEdit}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <SpotCard
            isSmall
            isShowCloseBtn
            onCloseClick={() => props.deleteSpot(props.id)}
            id={props.id}
            imgSrc={props.spot.photos[0]}
            imgAlt={props.spot.name}
            title={props.spot.name}
            address={props.spot.formatted_address}
            rating={props.spot.rating}
            addCss={css`
              cursor: grab;
            `}
          />
        </div>
      )}
    </Draggable>
  );
};
const ScheduleStyledCard = styled.div`
  ${cardCss}
  position: relative;
  gap: 20px;
  height: 250px;
  cursor: ${(props) => (props.cursorDefault ? 'default' : 'grab')};
  background-color: white;
  &:hover {
    cursor: grab;
  }
`;
const ScheduleWapper = styled.li`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ScheduleCardDrag = (props) => {
  const [isEditDuration, setIsEditDuration] = useState();
  const [duration, setDuration] = useState(props.schedule.duration);
  return (
    <Draggable
      draggableId={props.id}
      index={props.index}
      isDragDisabled={!props.isAllowEdit}>
      {(provided) => (
        <ScheduleWapper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <FlexDiv gap="20px">
            <FlexChildDiv
              padding="40px 0 0 0"
              basis="120px"
              alignItems="flex-start">
              {props.isAllowEdit && isEditDuration ? (
                <FlexDiv direction="column" alignItems="center">
                  <FlexDiv alignItems="center" gap="8px">
                    <RoundButtonSmall
                      type="button"
                      size="20px"
                      padding="5px 5px 7px 5px"
                      styled="transparent"
                      onClick={() => {
                        setDuration((prevValue) =>
                          prevValue > 30 ? prevValue - 30 : 30
                        );
                      }}>
                      −
                    </RoundButtonSmall>
                    <P
                      fontWeight="700"
                      fontSize="32px"
                      color={palatte.secondary[700]}>
                      {duration}
                    </P>
                    <RoundButtonSmall
                      size="20px"
                      styled="transparent"
                      padding="5px 5px 7px 7px"
                      type="button"
                      onClick={() => {
                        setDuration((prevValue) =>
                          prevValue < 1440 ? prevValue + 30 : 1440
                        );
                      }}>
                      +
                    </RoundButtonSmall>
                  </FlexDiv>
                  <span>分鐘</span>
                  <ButtonSmall
                    styled="gray"
                    fontSize="12px"
                    margin="10px 0 0 0 "
                    id="duration"
                    type="button"
                    onClick={(e) => {
                      if (e.target.id === 'duration') {
                        setIsEditDuration(false);
                        props.updateDuration(
                          props.schedule.schedule_id,
                          duration
                        );
                      }
                    }}>
                    儲存
                  </ButtonSmall>
                </FlexDiv>
              ) : (
                <TextWithIcon
                  grow="1"
                  iconName="watch_later"
                  margin="15px 0 0 0"
                  padding="10px 0px"
                  iconSize="40px"
                  gap="2px"
                  color={palatte.primary.basic}
                  direction="column"
                  alignItems="center"
                  addCss={
                    props.isAllowEdit && {
                      container: css`
                        &:hover {
                          background-color: ${palatte.lighterShadow};
                          border-radius: 10px;
                          cursor: pointer;
                        }
                      `,
                    }
                  }
                  onClick={(e) => {
                    if (e.target.id !== 'duration') {
                      setIsEditDuration(true);
                    }
                  }}>
                  {'停留' +
                    ' ' +
                    (duration < 60 ? duration : duration / 60) +
                    ' ' +
                    (duration < 60 ? '分鐘' : '小時')}
                </TextWithIcon>
              )}
            </FlexChildDiv>
            <ScheduleCard
              schedule={props.schedule}
              duration={props.duration}
              isEdit={props.isAllowEdit}
              selectedList={props.selectedList}
              setSelectedList={props.setSelectedList}
              isShowCloseBtn={props.isAllowEdit}
              onClick={props.onClick}
              onCloseClick={props.onCloseClick}
              travelMode={props.schedule.travel_mode}
              transitDetail={props.schedule.transit_detail}
              changeTrasitWay={props.changeTrasitWay}
            />
          </FlexDiv>
        </ScheduleWapper>
      )}
    </Draggable>
  );
};

// function Overview(props) {
//   const navigate = useNavigate();
//   const { uid } = useContext(Context);
//   const uploadCoverPhoto = (imageBuffer, setIsShowModal) => {
//     const upload = new updateItineraryCoverPhoto({
//       uid,
//       itineraryId: props.overviews.itinerary_id,
//       imageBuffer,
//     });
//     upload.uploadFirestore().then((cover_photo) => {
//       setIsShowModal(false);
//       props.updateOverviewsFields({ cover_photo });
//     });
//   };
//   return (
//     <>
//       <Container position="relative" margin="0 0 30px 0">
//         <Container addCss={props.container} padding="40px 20px 50px 20px">
//           <FlexDiv justifyContent="space-between">
//             <RoundButtonSmallWhite
//               className="material-icons"
//               type="button"
//               onClick={() => navigate('/itineraries')}>
//               navigate_before
//             </RoundButtonSmallWhite>
//             {props.isBrowse ? (
//               <RoundButtonSmallWhite
//                 className="material-icons"
//                 type="button"
//                 onClick={() => props.setIsBrowse(false)}>
//                 edit
//               </RoundButtonSmallWhite>
//             ) : (
//               <AddImageRoundBtn
//                 upload={uploadCoverPhoto}
//                 white
//                 icon="insert_photo"
//                 confirmMessage="確定要將封面更換成這張圖嗎？"
//               />
//             )}
//           </FlexDiv>
//           <FlexDiv direction="column" gap="10px" alignItems="center">
//             <EditableText
//               level="2"
//               padding="0 2px"
//               color={palatte.white}
//               addInputCss={css`
//                 color: ${palatte.gray[800]};
//               `}
//               isBrowse={props.isBrowse}
//               onSubmit={(title) => {
//                 if (title !== props.overviews.title) {
//                   props.updateOverviewsFields({ title });
//                 }
//               }}>
//               {props.overviews.title}
//             </EditableText>
//             <EditableDate
//               color={palatte.white}
//               start={props.overviews.start_date}
//               end={props.overviews.end_date}
//               onSubmit={props.updateDate}
//               isBrowse={props.isBrowse}
//               addCss={css`
//                 font-weight: 700;
//               `}
//               textAlign="center"
//             />
//             <H3 color={palatte.white}>Day {props.day + 1}</H3>
//           </FlexDiv>
//         </Container>
//         <Image
//           src={props.overviews.cover_photo}
//           alt="cover"
//           blur
//           addCss={css`
//             width: 100%;
//             height: 100%;
//             position: absolute;
//             top: 0;
//             z-index: -1;
//           `}
//         />
//       </Container>
//     </>
//   );
// }

// function DepartController(props) {
//   return (
//     <FlexDiv direction="column" gap="5px">
//       <FlexDiv
//         justifyContent="space-between"
//         addCss={css`
//           & > * {
//             color: ${palatte.gray['700']};
//           }
//         `}>
//         <P>出發時間</P>
//         <P>{timestampToString(props.departTimes[props.day], 'simpleDate')}</P>
//       </FlexDiv>
//       <EditableText
//         level="4"
//         fontSize="46px"
//         addCss={css`
//           color: ${palatte.info.basic};
//           font-weight: 700;
//           padding: 0;
//         `}
//         isBrowse={props.isBrowse}
//         onSubmit={(newDepartString) => {
//           if (newDepartString !== props.departString) {
//             const newDepartTimestamp = setTimeToTimestamp(
//               props.departTimes[props.day],
//               newDepartString
//             );
//             const newDepartTimes = Array.from(props.departTimes);
//             newDepartTimes.splice(props.day, 1, newDepartTimestamp);
//             props.updateOverviewsFields({ depart_times: newDepartTimes });
//             props.updateTimeOfSchedule(
//               props.schedules,
//               { isUploadFirebase: true, isSetSchedule: true },
//               newDepartTimestamp
//             );
//             props.setDepartString(
//               timestampToString(newDepartTimestamp, 'time')
//             );
//           }
//         }}>
//         {props.departString}
//       </EditableText>
//     </FlexDiv>
//   );
// }

// function MoveScheduleController(props) {
//   return (
//     <FlexDiv alignItems="center" justifyContent="flex-end" gap="20px">
//       <SelectAllCheckBox
//         setAllChecked={() =>
//           props.setSelectedSchedulesId(
//             props.schedules.map((schedule) => schedule.schedule_id)
//           )
//         }
//         setAllUnchecked={() => props.setSelectedSchedulesId([])}
//         isSelectAll={props.isSelectAll}
//         setIsSelectAll={props.setIsSelectAll}
//       />
//       <SelectSmall
//         value={props.changeTime}
//         onChange={(e) => props.setChangeTime(Number(e.target.value))}>
//         <option value="" disabled>
//           修改所選行程的日期
//         </option>
//         {props.departTimes?.map((timestamp) => (
//           <option value={timestamp} key={timestamp}>
//             {timestampToString(timestamp, 'date')}
//           </option>
//         ))}
//       </SelectSmall>
//       <ButtonSmall
//         styled="primary"
//         padding="5px 15px"
//         type="button"
//         onClick={props.changeSchedulesTime}>
//         移動行程
//       </ButtonSmall>
//     </FlexDiv>
//   );
// }

function AddSchedule(props) {
  const { uid, map } = useContext(Context);
  const { itineraryId } = useParams();
  const allSchedules = useRef();
  const navigate = useNavigate();
  const [overviews, setOverviews] = useState();
  const [waitingSpots, setWaitingSpots] = useState();
  const [schedules, setSchedules] = useState([]);
  const [day, setDay] = useState(0);
  const [departString, setDepartString] = useState();
  const [isAllowEdit, setIsAllowEdit] = useState(!props.browse);
  const [selectedSchedulesId, setSelectedSchedulesId] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [changeTime, setChangeTime] = useState('');

  useEffect(() => {
    if (uid && itineraryId) {
      firestore
        .getItinerary(uid, itineraryId, map, true)
        .then((res) => {
          if (res) {
            setWaitingSpots(res.waitingSpots);
            setOverviews(res.overviews);
            setDepartString(
              timestampToString(res.overviews.depart_times[day], 'time')
            );
            setSchedules(
              filterDaySchedules(res.schedules, res.overviews.depart_times)[day]
            );
            allSchedules.current = filterDaySchedules(
              res.schedules,
              res.overviews.depart_times
            );
          } else {
            alert('找不到行程資料');
          }
        })
        .catch((error) => {
          console.error(error);
          navigate(`/error`);
        });
    }
  }, [uid, itineraryId]);

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };
  const updateTimeOfSchedule = (list, option, newDepartTime) => {
    const updatedList = list.map((schedule, index, array) => {
      if (index === 0) {
        schedule.start_time = newDepartTime || overviews.depart_times[day];
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      } else {
        const prevSchedule = array[index - 1];
        schedule.start_time = prevSchedule.end_time;
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      }
      return schedule;
    });
    if (option?.isSetSchedule) {
      setSchedules(updatedList);
    }
    if (option?.isUploadFirebase) {
      firestore.editSchedules(uid, itineraryId, updatedList, 'merge');
    }
    return updatedList;
  };
  const getTransportDetail = (
    schedules,
    { isUploadFirebase, isSetSchedule },
    scheduleId,
    newMode
  ) => {
    const schedulesPromise = schedules.map((schedule, index, array) => {
      if (index < array.length - 1) {
        if (scheduleId) {
          return scheduleId === schedule.schedule_id
            ? googleMap
                .getDirection({
                  origin: schedule.placeDetail.geometry,
                  destination: array[index + 1].placeDetail.geometry,
                  ...transportMode(schedule)[newMode].config,
                })
                .catch((error) => {
                  if (error.code === 'ZERO_RESULTS') {
                    alert('抱歉！此交通方式找不到合適的路線，請切換其他方式');
                  }
                  return Promise.reject(schedule);
                })
            : null;
        } else {
          return googleMap
            .getDirection({
              origin: schedule.placeDetail.geometry,
              destination: array[index + 1].placeDetail.geometry,
              ...transportMode(schedule)[schedule.travel_mode].config,
            })
            .catch((error) => {
              if (error.code === 'ZERO_RESULTS') {
                alert('抱歉！此交通方式找不到合適的路線，請切換其他方式');
              }
              return Promise.reject(schedule);
            });
        }
      }
    });
    return Promise.all(schedulesPromise).then((transitDetails) => {
      let newSchedules = schedules.map((schedule, index) => {
        if (transitDetails[index]) {
          const transitDetail = {
            duration: {
              text: transitDetails[index].duration.text,
              value: Number(
                transitDetails[index].duration.text.match(/^\d+/)[0]
              ),
            },
            distance: transitDetails[index].distance,
          };
          return {
            ...schedule,
            transit_detail: transitDetail,
          };
        } else {
          return scheduleId
            ? { ...schedule }
            : {
                ...schedule,
                end_time: schedule.start_time + schedule.duration * 60 * 1000,
                transit_detail: '',
              };
        }
      });

      for (let i = 0; i < newSchedules.length - 1; i++) {
        newSchedules[i].end_time =
          newSchedules[i].start_time +
          (newSchedules[i].duration +
            newSchedules[i].transit_detail.duration.value) *
            60 *
            1000;
        newSchedules[i + 1].start_time = newSchedules[i].end_time;
      }
      if (isSetSchedule) {
        console.log(newSchedules);
        setSchedules(newSchedules);
        allSchedules.current[day] = newSchedules;
      }
      if (isUploadFirebase) {
        firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
      }
      return Promise.resolve(newSchedules);
    });
  };
  const changeTrasitWay = (scheduleId, mode) => {
    const newScheduleList = schedules.map((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        return { ...schedule, travel_mode: mode };
      } else {
        return schedule;
      }
    });
    getTransportDetail(
      newScheduleList,
      { isUploadFirebase: true, isSetSchedule: true },
      scheduleId,
      mode
    );
  };
  const addSchedule = (spotIndex, scheduleIndex) => {
    let startTime;
    let duration = 60;
    const newSpotsList = Array.from(waitingSpots);
    const newScheduleList = Array.from(schedules);
    const [remove] = newSpotsList.splice(spotIndex, 1);
    if (scheduleIndex > 0) {
      startTime = newScheduleList[scheduleIndex - 1].end_time;
    } else {
      startTime = overviews.depart_times[day];
    }

    const addData = {
      start_time: startTime,
      end_time: startTime + duration * 60 * 1000,
      place_id: remove.place_id,
      duration,
      placeDetail: remove,
      schedule_id: 'unknown',
      travel_mode: overviews.default_travel_mode,
    };
    firestore
      .addSchedule(uid, itineraryId, addData, true)
      .then(() => console.log('success'))
      .catch((error) => console.error(error));
    newScheduleList.splice(scheduleIndex, 0, addData);
    return {
      newSpotsList,
      newScheduleList,
    };
  };
  const backToWaiting = (scheduleIndex, spotIndex) => {
    const newSpotsList = Array.from(waitingSpots);
    const newScheduleList = Array.from(schedules);
    const [remove] = newScheduleList.splice(scheduleIndex, 1);
    const isRepeatSpot = newSpotsList.some(
      (spot) => spot.place_id === remove.place_id
    );
    if (!isRepeatSpot) {
      newSpotsList.splice(spotIndex, 0, remove.placeDetail);
    }
    allSchedules.current[day] = allSchedules.current[day].filter((schedule) => {
      return remove.schedule_id !== schedule.schedule_id;
    });
    firestore
      .setWaitingSpotsAndRemoveSchdule(
        uid,
        itineraryId,
        remove.schedule_id,
        !isRepeatSpot && remove.placeDetail
      )
      .then(() => console.log('removed'))
      .catch((error) => console.error(error));
    return {
      newSpotsList: !isRepeatSpot && newSpotsList,
      newScheduleList,
    };
  };
  const onDragEnd = (result) => {
    const startAndEnd = {
      startId: result.source.droppableId,
      startIndex: result.source.index,
      endId: result.destination.droppableId,
      endIndex: result.destination.index,
    };
    if (!result.destination) {
      return;
    }
    if (
      startAndEnd.startId === 'waitingSpotsArea' &&
      startAndEnd.endId === 'scheduleArea'
    ) {
      const { newSpotsList, newScheduleList } = addSchedule(
        startAndEnd.startIndex,
        startAndEnd.endIndex
      );
      setWaitingSpots(newSpotsList);
      if (schedules?.length > 0) {
        getTransportDetail(newScheduleList, {
          isSetSchedule: true,
          isUploadFirebase: true,
        })
          .then((res) => console.log(res))
          .catch((error) => console.error(error));
      } else {
        const updatedTimeSchedules = updateTimeOfSchedule(newScheduleList);
        setSchedules(updatedTimeSchedules);
        allSchedules.current[day] = updatedTimeSchedules;
      }
    } else if (startAndEnd.startId === startAndEnd.endId) {
      const list =
        startAndEnd.startId === 'scheduleArea' ? schedules : waitingSpots;
      const items = reorder(
        list,
        result.source.index,
        result.destination.index
      );
      if (startAndEnd.startId === 'scheduleArea') {
        const updatedTimeSchedules = updateTimeOfSchedule(items);
        getTransportDetail(updatedTimeSchedules, {
          isSetSchedule: true,
          isUploadFirebase: true,
        })
          .then((res) => console.log(res))
          .catch((error) => console.error(error));
      } else {
        setWaitingSpots(items);
      }
    } else if (
      startAndEnd.startId === 'scheduleArea' &&
      startAndEnd.endId === 'waitingSpotsArea'
    ) {
      const { newSpotsList, newScheduleList } = backToWaiting(
        startAndEnd.startIndex,
        startAndEnd.endIndex
      );
      getTransportDetail(newScheduleList, {
        isSetSchedule: true,
        isUploadFirebase: true,
      });
      if (newSpotsList) {
        setWaitingSpots(newSpotsList);
      }
    }
  };
  const updateDuration = (scheduleId, newDuration) => {
    const newSchedules = Array.from(schedules);
    newSchedules.forEach((schedule) => {
      if (schedule.schedule_id === scheduleId) {
        schedule.duration = newDuration;
        schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
        if (schedule.transit_detail) {
          schedule.end_time +=
            schedule.transit_detail.duration.value * 60 * 1000;
        }
      }
    });
    updateTimeOfSchedule(newSchedules, {
      isSetSchedule: true,
      isUploadFirebase: true,
    });
  };
  const updateOverviewsFields = (keyValuePair) => {
    setOverviews({ ...overviews, ...keyValuePair });
    firestore
      .editOverviews(uid, itineraryId, keyValuePair)
      .then(() => console.log('updated overviews'))
      .catch((error) => console.error(error));
  };
  const deleteSchedule = (scheduleId) => {
    // updateTimeOfSchedule(
    //   schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
    //   { isSetSchedule: true, isUploadFirebase: true }
    // );
    getTransportDetail(
      schedules.filter((schedule) => schedule.schedule_id !== scheduleId),
      {
        isSetSchedule: true,
        isUploadFirebase: true,
      }
    );
    firestore
      .deleteSchedule(uid, itineraryId, scheduleId)
      .then(() => {
        console.log('刪除成功！');
      })
      .catch((error) => console.error(error));
  };
  const deleteSpot = (placeId) => {
    setWaitingSpots(waitingSpots.filter((spot) => spot.place_id !== placeId));
    firestore
      .deleteWaitingSpots(uid, itineraryId, placeId)
      .then(() => console.log('刪除成功！'))
      .catch((error) => console.error(error));
  };
  const updateDate = (start, end, setEndTimestamp, setStartTimestamp) => {
    let updateDate;
    console.log(start, end);
    const resetTime = {
      start: new Date(start).setHours(8, 0, 0, 0),
      end: new Date(end).setHours(8, 0, 0, 0),
    };
    console.log(resetTime);
    if (overviews.start_date !== start && overviews.end_date !== end) {
      updateDate = {
        start_date: resetTime.start,
        end_date: resetTime.end,
        depart_times: createDepartTimeAry({ start_date: start, end_date: end }),
      };
    } else if (overviews.start_date !== start && overviews.end_date === end) {
      updateDate = {
        start_date: resetTime.start,
        depart_times: createDepartTimeAry({
          start_date: resetTime.start,
          end_date: overviews.end_date,
        }),
      };
    } else if (overviews.start_date === start && overviews.end_date !== end) {
      updateDate = {
        end_date: resetTime.end,
        depart_times: createDepartTimeAry({
          start_date: overviews.start_date,
          end_date: resetTime.end,
        }),
      };
    }
    if (updateDate) {
      const dayScheduleHad = Object.values(allSchedules.current).filter(
        (day) => day.length > 0
      );
      if (dayScheduleHad.length > updateDate.depart_times.length) {
        alert('新的旅遊天數少於已安排的行程天數，請先移除行程，再修改日期');
        setEndTimestamp(overviews.end_date);
        setStartTimestamp(overviews.start_date);
      } else {
        updateOverviewsFields(updateDate);
        const oldDayKeys = Object.keys(allSchedules.current);
        const removeDays = oldDayKeys.length - updateDate.depart_times.length;
        let newAllSchedules = { ...allSchedules.current };
        if (removeDays > 0) {
          setDay(0);
          newAllSchedules = dayScheduleHad.reduce((acc, day, index) => {
            acc[index] = day;
            return acc;
          }, {});
        }
        for (let i = 0; i < updateDate.depart_times.length; i++) {
          if (i < oldDayKeys.length && newAllSchedules[i]) {
            newAllSchedules[i] = updateTimeOfSchedule(
              newAllSchedules[i],
              { isUploadFirebase: true },
              updateDate.depart_times[i]
            );
          } else {
            newAllSchedules[i] = [];
          }
        }
        allSchedules.current = newAllSchedules;
        setDepartString(
          timestampToString(
            updateDate.depart_times[removeDays > 0 ? 0 : day],
            'time'
          )
        );
        setSchedules(newAllSchedules[removeDays > 0 ? 0 : day]);
      }
    }
  };
  const switchDay = (nextDay) => {
    setDay(nextDay);
    setSchedules(allSchedules.current[nextDay]);
    setDepartString(timestampToString(overviews.depart_times[nextDay], 'time'));
    setIsSelectAll(false);
    setSelectedSchedulesId([]);
    window.scrollTo(0, 0);
  };
  const changeSchedulesTime = async () => {
    const targetDay = overviews.depart_times.reduce((acc, timestamp, index) => {
      if (timestamp === changeTime) {
        acc = index;
      }
      return acc;
    }, -1);
    if (targetDay > -1) {
      const checkedSchedules = schedules.filter(
        (schedule) =>
          selectedSchedulesId.some((id) => id === schedule.schedule_id) &&
          schedule
      );
      let newTargetDaySchedules = [
        ...allSchedules.current[targetDay],
        ...checkedSchedules,
      ];
      newTargetDaySchedules = updateTimeOfSchedule(
        newTargetDaySchedules,
        {},
        overviews.depart_times[targetDay]
      );
      newTargetDaySchedules = await getTransportDetail(newTargetDaySchedules, {
        isUploadFirebase: true,
      });
      const removedDaySchedules = schedules.filter(
        (schedule) =>
          selectedSchedulesId.every((id) => id !== schedule.schedule_id) &&
          schedule
      );
      const newCurrentDaySchedule = await getTransportDetail(
        removedDaySchedules,
        {
          isUploadFirebase: true,
        }
      );
      allSchedules.current[day] = newCurrentDaySchedule;
      setSchedules(newCurrentDaySchedule);
      allSchedules.current[targetDay] = newTargetDaySchedules;
      setSelectedSchedulesId([]);
    }
  };

  const container = css`
    ${styles.containerSetting}
    max-width: ${props.isAllowEdit && '1280px'};
  `;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {overviews && (
        <>
          <Container minHeight="100vh" padding="0 0 150px 0">
            {isAllowEdit && (
              <FlexChildDiv
                padding="20px"
                display="flex"
                direction="column"
                backgroundColor={palatte.gray[100]}
                gap="20px"
                addCss={css`
                  position: fixed;
                  right: 0;
                  height: 100vh;
                  width: 340px;
                `}>
                <FlexDiv justifyContent="space-between" alignItems="center">
                  <H6 fontSize="22px">待定景點</H6>
                  <FlexDiv
                    justifyContent="flex-end"
                    alignItems="center"
                    gap="15px">
                    <ButtonIconColumn
                      type="button"
                      styled="primary"
                      iconName="explore"
                      onClick={() => navigate('/explore')}>
                      新增景點
                    </ButtonIconColumn>
                    <ButtonIconColumn
                      type="button"
                      styled="danger"
                      iconName="cancel"
                      onClick={() => setIsAllowEdit(false)}>
                      結束編輯
                    </ButtonIconColumn>
                  </FlexDiv>
                </FlexDiv>
                <Droppable
                  droppableId="waitingSpotsArea"
                  isDropDisabled={!isAllowEdit}>
                  {(provided) => (
                    <FlexChildDiv
                      direction="column"
                      grow="1"
                      gap="20px"
                      padding="10px"
                      maxWidth="300px"
                      overflowY="auto"
                      addCss={css`
                        &::-webkit-scrollbar {
                          display: none;
                        }
                      `}
                      ref={provided.innerRef}
                      {...provided.droppableProps}>
                      {waitingSpots?.map((spot, index) => (
                        <SpotCardDraggable
                          spot={spot}
                          isAllowEdit={isAllowEdit}
                          key={spot.place_id}
                          index={index}
                          id={spot.place_id}
                          deleteSpot={deleteSpot}
                        />
                      ))}
                      {provided.placeholder}
                    </FlexChildDiv>
                  )}
                </Droppable>
              </FlexChildDiv>
            )}
            <FlexDiv
              direction="column"
              gap="20px"
              minHeight="100vh"
              width={isAllowEdit ? 'calc(100% - 340px)' : null}>
              <Overview
                containerCss={container}
                isAllowEdit={isAllowEdit}
                setIsAllowEdit={setIsAllowEdit}
                overviews={overviews}
                updateDate={updateDate}
                updateOverviewsFields={updateOverviewsFields}
                day={day}
              />
              <FlexDiv
                addCss={container}
                width="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                margin="0">
                <DepartController
                  departTimes={overviews.depart_times}
                  day={day}
                  isAllowEdit={isAllowEdit}
                  departString={departString}
                  setDepartString={setDepartString}
                  updateTimeOfSchedule={updateTimeOfSchedule}
                  updateOverviewsFields={updateOverviewsFields}
                  schedules={schedules}
                />
                <Pagination
                  day={day}
                  switchDay={switchDay}
                  finalDay={overviews?.depart_times?.length - 1}
                />
              </FlexDiv>
              <Droppable
                droppableId="scheduleArea"
                isDropDisabled={!isAllowEdit}>
                {(provided) => (
                  <FlexChildDiv
                    addCss={container}
                    width="100%"
                    direction="column"
                    gap="20px"
                    grow="1"
                    // overflowY="scroll"
                    // height="calc(100vh - 500px)"
                    ref={provided.innerRef}
                    {...provided.droppableProps}>
                    <FlexChildDiv
                      direction="column"
                      backgroundColor={palatte.gray[100]}
                      grow="1"
                      padding="20px"
                      addCss={css`
                        border-radius: 10px;
                      `}>
                      {isAllowEdit && (
                        <FlexDiv justifyContent="flex-end" margin="0 0 20px 0">
                          <MoveScheduleController
                            departTimes={overviews.depart_times}
                            changeTime={changeTime}
                            setChangeTime={setChangeTime}
                            schedules={schedules}
                            setSelectedSchedulesId={setSelectedSchedulesId}
                            switchDay={switchDay}
                            setIsSelectAll={setIsSelectAll}
                            isSelectAll={isSelectAll}
                            changeSchedulesTime={changeSchedulesTime}
                          />
                        </FlexDiv>
                      )}
                      {schedules?.length > 0 ? (
                        schedules.map((schedule, index) => (
                          <ScheduleCardDrag
                            isAllowEdit={isAllowEdit}
                            key={schedule.schedule_id}
                            index={index}
                            id={schedule.schedule_id}
                            changeTrasitWay={changeTrasitWay}
                            schedule={schedule}
                            updateDuration={updateDuration}
                            selectedList={selectedSchedulesId}
                            setSelectedList={setSelectedSchedulesId}
                            onClick={() =>
                              window.open(schedule.placeDetail.url, '_blank')
                            }
                            onCloseClick={() =>
                              deleteSchedule(schedule.schedule_id)
                            }></ScheduleCardDrag>
                        ))
                      ) : (
                        <P color={palatte.gray[800]}>
                          {!isAllowEdit
                            ? '點擊編輯新增行程'
                            : '拖拉卡片以新增行程'}
                        </P>
                      )}
                      {provided.placeholder}
                    </FlexChildDiv>
                  </FlexChildDiv>
                )}
              </Droppable>
            </FlexDiv>
          </Container>
        </>
      )}
    </DragDropContext>
  );
}

export { AddOverView, AddSchedule };
