// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
import { googleMap } from './googleMap';
import { createDepartTimeAry } from './utilities';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firebaseAuth = {
  auth: getAuth(app),
  provider: new GoogleAuthProvider(),
  signIn(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password).catch(
      (error) => {
        alert(error.message);
      }
    );
  },
  signUp(email, password, name) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((res) => {
        firestore.editProfile(res.user.uid, {
          name,
          uid: res.user.uid,
          photo: 'https://picsum.photos/50',
          reviews: [],
        });
        return Promise.resolve(res.user.uid);
      })
      .catch((error) => {
        alert(error.message);
      });
  },
  googleLogIn() {
    return signInWithPopup(this.auth, this.provider)
      .then((res) => {
        console.log(res);
        firestore.editProfile(res.user.uid, {
          name: res.user.displayName,
          uid: res.user.uid,
          photo: res.user.photoURL,
          reviews: [],
        });
        return Promise.resolve(res.user.uid);
      })
      .catch((error) => {
        alert(error.message);
      });
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
  setSavedSpots(userUID, placeDatas) {
    const batch = writeBatch(this.db);
    placeDatas.forEach((place) => {
      batch.set(
        doc(
          collection(this.db, 'savedSpots', userUID, 'places'),
          place.place_id
        ),
        place,
        { merge: 'merge' }
      );
    });
    return batch.commit();
  },
  updatePlaceData(spot, map) {
    const now = new Date().getDate();
    const expireDate = new Date().setDate(now - 2);
    if (spot.created_time <= expireDate || !spot.created_time) {
      return googleMap
        .getPlaceDetails(map, spot.place_id)
        .then((updated) => {
          return updated;
        })
        .catch((error) => console.error(error));
    } else {
      return spot;
    }
  },
  getSavedSpots(userUID, map) {
    return new Promise((resolve, reject) => {
      const placesRef = collection(this.db, 'savedSpots', userUID, 'places');
      getDocs(placesRef)
        .then((profileSnap) => {
          const spots = profileSnap.docs.map((doc) => doc.data());
          const updateSpots = spots.map((spot) => {
            return this.updatePlaceData(spot, map);
          });
          Promise.all(updateSpots).then((res) => {
            resolve(res);
            this.setSavedSpots(userUID, res).catch((error) =>
              console.error(error)
            );
          });
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
    const overview = {
      ...basicInfo,
      depart_times: createDepartTimeAry(basicInfo),
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
  getItinerary(userUID, itineraryId, map, isEdit) {
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
          const update = docs.map((spot) => this.updatePlaceData(spot, map));
          Promise.all(update).then((res) => {
            this.setWaitingSpots(userUID, itineraryId, res);
            resolve({ waitingSpots: res });
          });
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
          const schedules = snapShots.docs.map((snapShot) => {
            return snapShot.data();
          });
          if (isEdit) {
            const update = schedules.map((schedule) =>
              this.updatePlaceData(schedule.placeDetail, map)
            );
            Promise.all(update).then((spots) => {
              spots.forEach((spot, index) => {
                schedules[index].placeDetail = spot;
              });
              const dataToFirebase = spots.reduce((acc, spot, index) => {
                const obj = {};
                obj.placeDetail = spot;
                obj.schedule_id = schedules[index].schedule_id;
                acc.push(obj);
                return acc;
              }, []);
              this.editSchedules(userUID, itineraryId, dataToFirebase, 'merge');
              resolve({ schedules });
            });
          } else {
            resolve({ schedules });
          }
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
  addSchedule(userUID, itineraryId, scheduleData, isRemoveWaitingSpot) {
    const batch = writeBatch(this.db);
    const itineraryDetailRef = doc(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId
    );
    const scheduleRef = doc(collection(itineraryDetailRef, 'schedules'));
    scheduleData.schedule_id = scheduleRef.id;
    batch.set(scheduleRef, scheduleData);
    if (isRemoveWaitingSpot) {
      const waitingSpotRef = doc(
        collection(itineraryDetailRef, 'waitingSpots'),
        scheduleData.place_id
      );
      batch.delete(waitingSpotRef);
    }
    return batch.commit().then(() => Promise.resolve(scheduleData));
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
  deleteSchedule(userUID, itineraryId, scheduleId) {
    return deleteDoc(
      doc(
        collection(
          this.db,
          'itineraries',
          userUID,
          'details',
          itineraryId,
          'schedules'
        ),
        scheduleId
      )
    );
  },
  setWaitingSpots(userUID, itineraryId, spots) {
    const batch = writeBatch(this.db);
    const waitingSpotRef = collection(
      this.db,
      'itineraries',
      userUID,
      'details',
      itineraryId,
      'waitingSpots'
    );
    spots.forEach((spot) => {
      batch.set(doc(waitingSpotRef, spot.place_id), spot, { merge: 'merge' });
    });
    return batch.commit();
  },
  deleteWaitingSpots(userUID, itineraryId, placeId) {
    return deleteDoc(
      doc(
        collection(
          this.db,
          'itineraries',
          userUID,
          'details',
          itineraryId,
          'waitingSpots'
        ),
        placeId
      )
    );
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
  updateOverviewsFields(userUID, itineraryId, updateData) {
    return updateData(
      doc(
        collection(this.db, 'itineraries', userUID, 'overviews'),
        itineraryId
      ),
      updateData
    );
  },
  getScheduleWithTime(userUID, itineraryId, timestamp, map) {
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
      const target = snapShots.docs.map((schedules) => schedules.data());
      const updated = target.map((schedule) =>
        this.updatePlaceData(schedule.placeDetail, map)
      );
      return Promise.all(updated).then((res) => {
        res.forEach((spot, index) => {
          target[index].placeDetail = spot;
        });
        const dataToFirebase = res.reduce((acc, spot, index) => {
          const obj = {};
          obj.placeDetail = spot;
          obj.schedule_id = target[index].schedule_id;
          acc.push(obj);
          return acc;
        }, []);
        this.editSchedules(userUID, itineraryId, dataToFirebase, 'merge');
        return Promise.resolve(target);
      });
    });
  },
  getItineraries(userUID, timestamp, isJournal) {
    const overviewsRef = collection(
      this.db,
      'itineraries',
      userUID,
      'overviews'
    );
    console.log(timestamp);
    const resetTime = new Date(timestamp).setHours(0, 0, 0, 0);
    console.log(resetTime);
    const q = query(
      overviewsRef,
      where('end_date', isJournal ? '<=' : '>=', resetTime)
    );
    return getDocs(q).then((snapShots) => {
      const itineraries = snapShots.docs.map((doc) => doc.data());
      return Promise.resolve(itineraries);
    });
  },
};

export { firebaseAuth, firestore, firebaseStorage };
