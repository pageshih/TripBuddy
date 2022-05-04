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
          schedule.end_time > departTimes[index] &&
          schedule.end_time < departTimes[index] + 18 * 60 * 60 * 1000
      )
      .sort((a, b) => a.start_time - b.start_time);
    return acc;
  }, {});
  return newAllSchedules;
}
const createDepartTimeAry = (dateObj) => {
  let departTimes = [];
  const millisecondsOfDay = 24 * 60 * 60 * 1000;
  const totalaDays = Number(dateObj.end_date - dateObj.start_date);
  for (let i = 0; i <= totalaDays / millisecondsOfDay; i += 1) {
    departTimes.push(dateObj.start_date + i * millisecondsOfDay);
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

class updateItineraryCoverPhoto {
  constructor({ uid, itineraryId, imageBuffer }) {
    this.uid = uid;
    this.itineraryId = itineraryId;
    this.imageBuffer = imageBuffer;
  }
  async uploadStorage() {
    return this.imageBuffer
      ? await firebaseStorage.uploadImages(
          [this.uid, this.itineraryId],
          this.imageBuffer
        )
      : [];
  }
  async uploadFirestore() {
    const urlAry = await this.uploadStorage();
    return firestore
      .editOverviews(this.uid, this.itineraryId, {
        cover_photo: urlAry[0],
      })
      .then(() => {
        alert('封面圖已更新！');
        return Promise.resolve(urlAry[0]);
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
  updateItineraryCoverPhoto,
  uploadReviewFirestore,
};
