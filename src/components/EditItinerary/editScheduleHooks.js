import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Context } from '../../App';
import { googleMap } from '../../utils/googleMap';
import { firestore } from '../../utils/firebase';
import { transportMode } from '../styledComponents/Cards';

const useGetTransportDetail = (updateScheduleState) => {
  const { dispatchNotification, uid } = useContext(Context);
  const { itineraryId } = useParams();
  return (schedules, isSetSchedule, changeSingleScheduleId, newMode) => {
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
          console.log(schedule.start_time + schedule.duration * 60 * 1000);
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
          schedule.start_time = array[index - 1].end_time;
          schedule.end_time =
            schedule.start_time + schedule.duration * 60 * 1000;
        }
      });
      if (isSetSchedule) {
        updateScheduleState(newSchedules);
      }
      firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
      return newSchedules;
    });
  };
};
const useUpdateTimeOfSchedule = (updateScheduleState) => {
  const { uid } = useContext(Context);
  const { itineraryId } = useParams();
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
    firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
    return newSchedules;
  };
};

export { useGetTransportDetail, useUpdateTimeOfSchedule };
