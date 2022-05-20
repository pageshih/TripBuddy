import imageCompression from 'browser-image-compression';
import { firebaseStorage, firestore } from './firebase';

const timestampToString = (timestamp, type) => {
  const timeType = {
    date: new Date(timestamp).toLocaleDateString(),
    time: new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    simpleDate: new Date(timestamp).toLocaleDateString().slice(5),
  };
  return timeType[type] || '';
};

function timestampToDateInput(timestamp) {
  const d = new Date(timestamp);
  return `${d.toISOString().slice(0, 10)}`;
}
function timestampToTimeInput(timestamp) {
  const d = new Date(timestamp);
  return `${d.toTimeString().slice(0, 8)}`;
}

function setTimeToTimestamp(timestamp, timeString) {
  const [hour, minute] = timeString.split(':');
  return new Date(timestamp).setHours(hour, minute);
}
function filterDaySchedules(allSchedules, departTimes) {
  const newAllSchedules = departTimes.reduce((acc, _, index) => {
    acc[index] = allSchedules
      .filter(
        (schedule) =>
          new Date(schedule.end_time).getDate() ===
          new Date(departTimes[index]).getDate()
      )
      .sort((a, b) => a.start_time - b.start_time);
    return acc;
  }, {});
  return newAllSchedules;
}
const createDepartTimeAry = (dateObj) => {
  let departTimes = [];
  const endDay = Number(new Date(dateObj.end_date).getDate());
  const startDay = Number(new Date(dateObj.start_date).getDate());
  const totalDays = endDay - startDay;
  for (let i = 0; i <= totalDays; i += 1) {
    const day = new Date(dateObj.start_date).setDate(startDay + i);
    departTimes.push(day);
  }
  return departTimes;
};
const compressImages = async (files) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const images = [...files].map((image) => {
    return imageCompression(image, options);
  });
  return Promise.all(images);
};

function checkArraysIsTheSame(array1, array2) {
  return (
    array1 &&
    array2 &&
    array1.length === array2.length &&
    array1.every((item, index) => item === array2[index])
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
        return Promise.resolve(newGallery);
      })
      .catch((error) => console.error(error));
  }
}

export {
  timestampToString,
  compressImages,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
  timestampToTimeInput,
  uploadReviewFirestore,
  checkArraysIsTheSame,
};
