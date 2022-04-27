import imageCompression from 'browser-image-compression';

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

function setTimeToTimestamp(timestamp, timeString) {
  const [hour, minute] = timeString.split(':');
  return new Date(timestamp).setHours(hour, minute);
}
function filterDaySchedules(allSchedules, departTimes) {
  const newAllSchedules = departTimes.reduce((acc, _, index) => {
    acc[index] = allSchedules.filter(
      (schedule) =>
        schedule.end_time > departTimes[index] &&
        schedule.end_time < departTimes[index] + 18 * 60 * 60 * 1000
    );
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

export {
  timestampToString,
  compressImages,
  timestampToDateInput,
  filterDaySchedules,
  setTimeToTimestamp,
  createDepartTimeAry,
};
