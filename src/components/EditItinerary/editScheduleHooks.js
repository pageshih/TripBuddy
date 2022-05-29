import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../../App';
import { googleMap } from '../../utils/googleMap';
import { firestore } from '../../utils/firebase';
import { createDepartTimeAry } from '../../utils/utilities';
import { transportMode } from '../styledComponents/Cards/TransitCard';

const useGetTransportDetail = (updateScheduleState) => {
  const { dispatchNotification, uid } = useContext(Context);
  const { itineraryId, journalId } = useParams();
  return (
    schedules,
    { isSetSchedule, isUploadFirebase },
    changeSingleScheduleId,
    newMode
  ) => {
    const schedulesPromise = schedules.map((schedule, index, array) => {
      if (index < array.length - 1) {
        if (changeSingleScheduleId) {
          return changeSingleScheduleId === schedule.schedule_id
            ? googleMap
                .getDirection({
                  origin: schedule.placeDetail.geometry,
                  destination: array[index + 1].placeDetail.geometry,
                  ...transportMode(schedule)[newMode].config,
                })
                .catch((error) => {
                  if (error.code === 'ZERO_RESULTS') {
                    dispatchNotification({
                      type: 'fire',
                      playload: {
                        message:
                          '抱歉！此交通方式找不到合適的路線，請切換其他方式',
                        id: 'alert_noTransport',
                        btnMessage: '修改交通方式',
                      },
                    });
                  }
                  return Promise.reject(schedule);
                })
            : null;
        } else {
          return googleMap
            .getDirection(
              {
                origin: schedule.placeDetail.geometry,
                destination: array[index + 1].placeDetail.geometry,
                ...transportMode(schedule)[schedule.travel_mode].config,
              },
              {
                name: array[index + 1].placeDetail.name,
                address: array[index + 1].placeDetail.formatted_address,
              }
            )
            .catch((error) => {
              if (error.code === 'ZERO_RESULTS') {
                dispatchNotification({
                  type: 'fire',
                  playload: {
                    message: '抱歉！此交通方式找不到合適的路線，請切換其他方式',
                    id: 'alertNoTransport',
                    btnMessage: '修改交通方式',
                    width: '100%',
                  },
                });
              }
              return Promise.reject(schedule);
            });
        }
      }
      return null;
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
            direction_url: transitDetails[index].direction_url,
          };
          return {
            ...schedule,
            transit_detail: transitDetail,
          };
        } else {
          return changeSingleScheduleId
            ? { ...schedule }
            : {
                ...schedule,
                end_time: schedule.start_time + schedule.duration * 60 * 1000,
                transit_detail: null,
              };
        }
      });

      newSchedules.forEach((schedule, index, array) => {
        if (index < array.length - 1) {
          schedule.end_time =
            schedule.start_time +
            (schedule.duration + schedule.transit_detail.duration.value) *
              60 *
              1000;
        } else {
          if (index > 0) {
            schedule.start_time = array[index - 1].end_time;
          }
          schedule.end_time =
            schedule.start_time + schedule.duration * 60 * 1000;
        }
      });
      if (isSetSchedule) {
        updateScheduleState(newSchedules);
      }
      if (isUploadFirebase) {
        firestore.editSchedules(
          uid,
          itineraryId || journalId,
          newSchedules,
          'merge'
        );
      }
      return newSchedules;
    });
  };
};
const useUpdateTimeOfSchedule = (updateScheduleState) => {
  const { uid } = useContext(Context);
  const { itineraryId, journalId } = useParams();
  return (list, departTime, isSetSchedule) => {
    const newSchedules = list.map((schedule, index, array) => {
      if (index === 0) {
        schedule.start_time = departTime;
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
    if (isSetSchedule) {
      updateScheduleState(newSchedules);
    }
    firestore.editSchedules(
      uid,
      itineraryId || journalId,
      newSchedules,
      'merge'
    );
    return newSchedules;
  };
};

function useUpdateOverviewsFields(overviews, setOverviews) {
  const { uid } = useContext(Context);
  const { itineraryId, journalId } = useParams();

  return (keyValuePair) => {
    if (keyValuePair && keyValuePair.default_travel_mode) {
      delete keyValuePair.default_travel_mode;
    }
    setOverviews({ ...overviews, ...keyValuePair });
    firestore
      .editOverviews(uid, itineraryId || journalId, keyValuePair)
      .catch((error) => console.error(error));
  };
}

function useUpdateDate({
  overviews,
  allSchedules,
  setSchedules,
  day,
  setDay,
  updateOverviewsFields,
  updateTimeOfSchedule,
}) {
  const { dispatchNotification } = useContext(Context);

  return (start, end, setEndTimestamp, setStartTimestamp, setIsEdit) => {
    let updateDate;
    const resetTime = {
      start: new Date(start).setHours(8, 0, 0, 0),
      end: new Date(end).setHours(8, 0, 0, 0),
    };
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
        dispatchNotification({
          type: 'fire',
          playload: {
            message:
              '新的旅遊天數少於已安排的行程天數，請先移除行程，再修改日期',
            id: 'alert_updateDaysError',
          },
        });

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
              updateDate.depart_times[i],
              true
            );
          } else {
            newAllSchedules[i] = [];
          }
        }
        allSchedules.current = newAllSchedules;
        setSchedules(newAllSchedules[removeDays > 0 ? 0 : day]);
        setIsEdit(false);
      }
    }
  };
}
export {
  useGetTransportDetail,
  useUpdateTimeOfSchedule,
  useUpdateOverviewsFields,
  useUpdateDate,
};
