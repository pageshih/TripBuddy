import imageCompression from 'browser-image-compression';

const timestampToString = (timestamp, type) => {
  const timeType = {
    date: new Date(timestamp).toLocaleDateString(),
    time: new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
  return timeType[type] || '';
};

function timestampToDateInput(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  return `${d.toISOString().slice(0, 10)}`;
}

function filterDaySchedules(allSchedules, departTimes, day) {
  return allSchedules.filter(
    (schedule) =>
      schedule.end_time > departTimes[day] &&
      schedule.end_time < departTimes[day] + 24 * 60 * 60 * 1000
  );
}

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
};
