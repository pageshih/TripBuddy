// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
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
  setSavedSpots(userUID, place) {
    return setDoc(
      doc(collection(this.db, 'savedSpots', userUID, 'places'), place.place_id),
      place,
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
  deleteSavesSpots(userUID, placeIdAry) {
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
      departTimes,
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
  getItinerary(userUID, itineraryId) {
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
    return Promise.all([getOverviews, getWaitingSpots, getSchedules]).then(
      (docs) =>
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
  editSchedule(userUID, itineraryId, updateDatas, merge) {
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
  getItineraries(userUID) {
    return getDocs(
      collection(this.db, 'itineraries', userUID, 'overviews')
    ).then((snapShots) => {
      const itineraries = snapShots.docs.map((doc) => doc.data());
      return Promise.resolve(itineraries);
    });
  },
};

export { firebaseAuth, firestore };
