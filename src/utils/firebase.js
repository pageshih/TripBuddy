// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from './apiKey';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firebaseAuth = {
  auth: getAuth(app),
  signIn(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password);
  },
  signUp(email, password) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  },
  userSignOut() {
    return signOut(this.auth);
  },
  checkIsLogIn(actionWhenChange, actionWhenError) {
    return onAuthStateChanged(this.auth, actionWhenChange, actionWhenError);
  },
};
const firebaseStorage = {
  storage: getStorage(app),
  uploadImagesOfReviews({ userUID, itineraryId, scheduleId }, files) {
    const uploadPromises = files.map((file) => {
      const itineraryImagesRef = ref(
        this.storage,
        `${userUID}/${itineraryId}/${scheduleId}/${file.name}`
      );
      return uploadBytes(itineraryImagesRef, file)
        .then((uploadResult) => {
          return getDownloadURL(uploadResult.ref);
        })
        .then((url) => url);
    });
    return Promise.all(uploadPromises);
  },
};
const firestore = {
  db: getFirestore(app),
  setProfile(userUID, profile, merge) {
    return setDoc(doc(this.db, 'profile', userUID), { profile }, { merge });
  },
  getProfile(userUID) {
    return new Promise((resolve) => {
      getDoc(doc(this.db, 'profile', userUID)).then((profileSnap) => {
        resolve(profileSnap.data());
      });
    });
  },
  editProfile(userUID, newProfile) {
    return setDoc(doc(this.db, 'profile', userUID), newProfile, {
      merge: 'merge',
    });
  },
  setSavedSpots(userUID, placeData) {
    return setDoc(
      doc(
        collection(this.db, 'savedSpots', userUID, 'places'),
        placeData.place_id
      ),
      placeData,
      { merge: 'merge' }
    );
  },
  getSavedSpots(userUID) {
    return new Promise((resolve, reject) => {
      const placesRef = collection(this.db, 'savedSpots', userUID, 'places');
      getDocs(placesRef)
        .then((profileSnap) => {
          resolve(profileSnap.docs.map((doc) => doc.data()));
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  deleteSavedSpots(userUID, placeIdAry) {
    const batch = writeBatch(this.db);
    placeIdAry.forEach((place_id) => {
      const placeDocRef = doc(
        collection(this.db, 'savedSpots', userUID, 'places'),
        place_id
      );
      batch.delete(placeDocRef);
    });
    return batch.commit();
  },
  createItinerary(userUID, basicInfo, waitingSpots, merge) {
    const batch = writeBatch(this.db);
    const itineraryUserRef = doc(this.db, 'itineraries', userUID);
    const itineraryOverviewRef = doc(collection(itineraryUserRef, 'overviews'));
    const itineraryDetailRef = doc(
      collection(itineraryUserRef, 'details'),
      itineraryOverviewRef.id
    );
    const itineraryDetailWaitingSpotsRef = collection(
      itineraryDetailRef,
      'waitingSpots'
    );
    let departTimes = [];
    const millisecondsOfDay = 24 * 60 * 60 * 1000;
    const totalaDays = Number(basicInfo.end_date - basicInfo.start_date);
    for (let i = 0; i <= totalaDays / millisecondsOfDay; i += 1) {
      departTimes.push(basicInfo.start_date + i * millisecondsOfDay);
    }
    const overview = {
      ...basicInfo,
      depart_times: departTimes,
      itinerary_id: itineraryOverviewRef.id,
      cover_photo: 'https://picsum.photos/200/300',
    };

    batch.set(itineraryUserRef, {});
    batch.set(itineraryOverviewRef, overview, { merge });
    batch.set(
      itineraryDetailRef,
      { itinerary_id: itineraryOverviewRef.id },
      { merge }
    );
    waitingSpots.forEach((spot) => {
      batch.set(doc(itineraryDetailWaitingSpotsRef, spot.place_id), spot, {
        merge,
      });
    });
    return batch
      .commit()
      .then(() => Promise.resolve(itineraryOverviewRef.id))
      .catch((error) => Promise.reject(error));
  },
  getItinerary(userUID, itineraryId, isEdit) {
    const itineraryUserRef = doc(this.db, 'itineraries', userUID);
    const getOverviews = new Promise((resolve, reject) => {
      const overviewsRef = doc(
        collection(itineraryUserRef, 'overviews'),
        itineraryId
      );
      getDoc(overviewsRef)
        .then((snapShot) => resolve(snapShot.data()))
        .catch((error) => reject(error));
    });
    const getWaitingSpots = new Promise((resolve, reject) => {
      const waitingSpotsRef = collection(
        doc(itineraryUserRef, 'details', itineraryId),
        'waitingSpots'
      );
      getDocs(waitingSpotsRef)
        .then((snapShots) => {
          const docs = snapShots.docs.map((snapShot) => {
            return snapShot.data();
          });
          resolve({ waitingSpots: docs });
        })
        .catch((error) => reject(error));
    });
    const getSchedules = new Promise((resolve, reject) => {
      const schedulesRef = collection(
        doc(itineraryUserRef, 'details', itineraryId),
        'schedules'
      );
      return getDocs(schedulesRef)
        .then((snapShots) => {
          const docs = snapShots.docs.map((snapShot) => {
            return snapShot.data();
          });
          resolve({ schedules: docs });
        })
        .catch((error) => reject(error));
    });
    return Promise.all(
      isEdit
        ? [getOverviews, getWaitingSpots, getSchedules]
        : [getOverviews, getSchedules]
    ).then((docs) =>
      docs.reduce((acc, doc, index) => {
        if (index === 0) {
          acc.overviews = doc;
          return acc;
        } else {
          return { ...acc, ...doc };
        }
      }, {})
    );
  },
  setSchedule(userUID, itineraryId, scheduleData) {
    const batch = writeBatch(this.db);
    const itineraryDetailRef = doc(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId
    );
    const scheduleRef = doc(collection(itineraryDetailRef, 'schedules'));
    const waitingSpotRef = doc(
      collection(itineraryDetailRef, 'waitingSpots'),
      scheduleData.place_id
    );
    scheduleData.schedule_id = scheduleRef.id;
    batch.set(scheduleRef, scheduleData);
    batch.delete(waitingSpotRef);
    return batch.commit();
  },
  editSchedules(userUID, itineraryId, updateDatas, merge) {
    const batch = writeBatch(this.db);
    const schedulesRef = collection(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId,
      'schedules'
    );
    updateDatas.forEach((data) => {
      batch.set(doc(schedulesRef, data.schedule_id), data, { merge });
    });
    return batch.commit();
  },
  setWaitingSpotsAndRemoveSchdule(userUID, itineraryId, scheduleId, placeData) {
    const batch = writeBatch(this.db);
    const itineraryDetailRef = doc(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId
    );
    const scheduleRef = doc(
      collection(itineraryDetailRef, 'schedules'),
      scheduleId
    );
    batch.delete(scheduleRef);
    if (placeData) {
      const waitingSpotsRef = doc(
        collection(itineraryDetailRef, 'waitingSpots'),
        placeData.place_id
      );
      batch.set(waitingSpotsRef, placeData);
    }
    return batch.commit();
  },
  editOverviews(userUID, itineraryId, newOverview) {
    return setDoc(
      doc(
        collection(this.db, 'itineraries', userUID, 'overviews'),
        itineraryId
      ),
      newOverview,
      { merge: 'merge' }
    );
  },
  getScheduleWithTime(userUID, itineraryId, timestamp) {
    const schedulesRef = collection(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId,
      'schedules'
    );
    const q = query(schedulesRef, where('end_time', '>=', Number(timestamp)));
    return getDocs(q).then((snapShots) => {
      const target = snapShots.docs.map((doc) => doc.data());
      return Promise.resolve(target);
    });
  },
  getItineraries(userUID, timestamp, isJournal) {
    const overviewsRef = collection(
      this.db,
      'itineraries',
      userUID,
      'overviews'
    );
    const q = query(
      overviewsRef,
      where(
        'end_date',
        isJournal ? '<=' : '>=',
        Number(timestamp - 24 * 60 * 60 * 1000)
      )
    );
    return getDocs(q).then((snapShots) => {
      const itineraries = snapShots.docs.map((doc) => doc.data());
      return Promise.resolve(itineraries);
    });
  },
};

export { firebaseAuth, firestore, firebaseStorage };
