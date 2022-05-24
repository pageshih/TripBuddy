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
        updateScheduleState(newSchedules);
        // setSchedules(newSchedules);
        // allSchedules.current[day] = newSchedules;
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

// const updateTimeOfSchedule = (list, option, newDepartTime) => {
//   const updatedList = list.map((schedule, index, array) => {
//     if (index === 0) {
//       schedule.start_time = newDepartTime || overviews.depart_times[day];
//       schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
//       if (schedule.transit_detail) {
//         schedule.end_time +=
//           schedule.transit_detail.duration.value * 60 * 1000;
//       }
//     } else {
//       const prevSchedule = array[index - 1];
//       schedule.start_time = prevSchedule.end_time;
//       schedule.end_time = schedule.start_time + schedule.duration * 60 * 1000;
//       if (schedule.transit_detail) {
//         schedule.end_time +=
//           schedule.transit_detail.duration.value * 60 * 1000;
//       }
//     }
//     return schedule;
//   });
//   if (option?.isSetSchedule) {
//     setSchedules(updatedList);
//   }
//   if (option?.isUploadFirebase) {
//     firestore.editSchedules(uid, itineraryId, updatedList, 'merge');
//   }
//   return updatedList;
// };
// const getTransportDetail = (
//   schedules,
//   { isUploadFirebase, isSetSchedule },
//   scheduleId,
//   newMode
// ) => {
//   const schedulesPromise = schedules.map((schedule, index, array) => {
//     if (index < array.length - 1) {
//       if (scheduleId) {
//         return scheduleId === schedule.schedule_id
//           ? googleMap
//               .getDirection({
//                 origin: schedule.placeDetail.geometry,
//                 destination: array[index + 1].placeDetail.geometry,
//                 ...transportMode(schedule)[newMode].config,
//               })
//               .catch((error) => {
//                 if (error.code === 'ZERO_RESULTS') {
//                   dispatchNotification({
//                     type: 'fire',
//                     playload: {
//                       message:
//                         '抱歉！此交通方式找不到合適的路線，請切換其他方式',
//                       id: 'alert_noTransport',
//                       btnMessage: '修改交通方式',
//                     },
//                   });
//                 }
//                 return Promise.reject(schedule);
//               })
//           : null;
//       } else {
//         return googleMap
//           .getDirection(
//             {
//               origin: schedule.placeDetail.geometry,
//               destination: array[index + 1].placeDetail.geometry,
//               ...transportMode(schedule)[schedule.travel_mode].config,
//             },
//             {
//               name: array[index + 1].placeDetail.name,
//               address: array[index + 1].placeDetail.formatted_address,
//             }
//           )
//           .catch((error) => {
//             if (error.code === 'ZERO_RESULTS') {
//               dispatchNotification({
//                 type: 'fire',
//                 playload: {
//                   message: '抱歉！此交通方式找不到合適的路線，請切換其他方式',
//                   id: 'alertNoTransport',
//                   btnMessage: '修改交通方式',
//                   width: '100%',
//                 },
//               });
//             }
//             return Promise.reject(schedule);
//           });
//       }
//     }
//   });
//   return Promise.all(schedulesPromise).then((transitDetails) => {
//     let newSchedules = schedules.map((schedule, index) => {
//       if (transitDetails[index]) {
//         const transitDetail = {
//           duration: {
//             text: transitDetails[index].duration.text,
//             value: Number(
//               transitDetails[index].duration.text.match(/^\d+/)[0]
//             ),
//           },
//           distance: transitDetails[index].distance,
//           direction_url: transitDetails[index].direction_url,
//         };
//         return {
//           ...schedule,
//           transit_detail: transitDetail,
//         };
//       } else {
//         return scheduleId
//           ? { ...schedule }
//           : {
//               ...schedule,
//               end_time: schedule.start_time + schedule.duration * 60 * 1000,
//               transit_detail: '',
//             };
//       }
//     });

//     for (let i = 0; i < newSchedules.length - 1; i++) {
//       newSchedules[i].end_time =
//         newSchedules[i].start_time +
//         (newSchedules[i].duration +
//           newSchedules[i].transit_detail.duration.value) *
//           60 *
//           1000;
//       newSchedules[i + 1].start_time = newSchedules[i].end_time;
//     }
//     if (isSetSchedule) {
//       setSchedules(newSchedules);
//       allSchedules.current[day] = newSchedules;
//     }
//     if (isUploadFirebase) {
//       firestore.editSchedules(uid, itineraryId, newSchedules, 'merge');
//     }
//     return Promise.resolve(newSchedules);
//   });
// };
export { useGetTransportDetail, useUpdateTimeOfSchedule };
