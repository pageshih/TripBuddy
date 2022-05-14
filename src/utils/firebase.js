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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
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
  WriteBatch,
} from 'firebase/firestore';
import { googleMap } from './googleMap';
import { createDepartTimeAry } from './utilities';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firebaseAuth = {
  auth: getAuth(app),
  provider: new GoogleAuthProvider(),
  signIn(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password);
  },
  signUp(email, password, name) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      (res) => {
        firestore.setDefaultAccount(res.user.uid, {
          name,
          uid: res.user.uid,
          photo: '',
          reviews: [],
        });
        return Promise.resolve(res.user.uid);
      }
    );
  },
  googleLogIn() {
    return signInWithPopup(this.auth, this.provider).then((res) => {
      firestore.setDefaultAccount(res.user.uid, {
        name: res.user.displayName,
        uid: res.user.uid,
        photo: res.user.photoURL,
        reviews: [],
      });
      return Promise.resolve(res.user.uid);
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
  getPath(pathAry) {
    return pathAry.reduce((acc, path) => {
      acc += `${path}/`;
      return acc;
    }, '');
  },
  uploadImages(pathAry, files, customFileName) {
    const basicPath = this.getPath(pathAry);
    const uploadPromises = files.map((file) => {
      const imageRef = ref(
        this.storage,
        `${basicPath}${customFileName || file.name}`
      );
      return uploadBytes(imageRef, file)
        .then((uploadResult) => getDownloadURL(uploadResult.ref))
        .then((url) => url);
    });
    return Promise.all(uploadPromises);
  },
  clearImageRoot(pathAry) {
    const imageRootRef = ref(this.storage, `${this.getPath(pathAry)}/*`);
    return deleteObject(imageRootRef);
  },
};
const firestore = {
  db: getFirestore(app),
  setDefaultAccount(userUID, profile) {
    const batch = writeBatch(this.db);
    batch.set(
      doc(this.db, 'profile', userUID),
      { ...profile },
      { merge: 'merge' }
    );
    batch.set(
      doc(this.db, 'savedSpots', userUID),
      { uid: userUID },
      { merge: 'merge' }
    );
    batch.set(
      doc(this.db, 'itineraries', userUID),
      { default_travel_mode: 'DRIVING', uid: userUID },
      { merge: 'merge' }
    );
    return batch.commit();
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
      cover_photo:
        'https://images.unsplash.com/photo-1564166489229-dfb970a591bf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1626&q=80',
    };
    this.getItinerariesSetting(userUID).then((obj) => {
      if (!obj.default_travel_mode) {
        batch.set(itineraryUserRef, { default_travel_mode: 'DRIVING' });
      }
    });
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
  getItinerary(userUID, itineraryId, map, isForEdit) {
    const itineraryUserRef = doc(this.db, 'itineraries', userUID);
    const getOverviews = new Promise((resolve, reject) => {
      const overviewsRef = doc(
        collection(itineraryUserRef, 'overviews'),
        itineraryId
      );
      getDoc(overviewsRef)
        .then(async (snapShot) => {
          const overview = snapShot.data();
          let setting = await this.getItinerariesSetting(userUID);
          if (!setting.default_travel_mode) {
            setting = { default_travel_mode: 'DRIVING' };
            await this.setItinerariesSetting(userUID, setting);
          }
          resolve({ overviews: { ...overview, ...setting } });
        })
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
          const schedules = snapShots.docs
            .map((snapShot) => {
              return snapShot.data();
            })
            .sort((a, b) => a.start_time - b.start_time);

          if (isForEdit) {
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
      isForEdit
        ? [getOverviews, getWaitingSpots, getSchedules]
        : [getOverviews, getSchedules]
    ).then((docs) => {
      const newData = docs.reduce((acc, doc) => {
        return { ...acc, ...doc };
      }, {});
      return newData;
    });
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
      const target = snapShots.docs
        .map((schedules) => schedules.data())
        .sort((a, b) => a.start_time - b.start_time);
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

    const resetTime = new Date(timestamp).setHours(0, 0, 0, 0);
    const q = query(
      overviewsRef,
      where('end_date', isJournal ? '<=' : '>=', resetTime)
    );
    return getDocs(q).then((snapShots) => {
      const itineraries = snapShots.docs.map((doc) => doc.data());
      return Promise.resolve(itineraries);
    });
  },
  getItinerariesSetting(userUID) {
    const defaultTravelModeRef = doc(this.db, 'itineraries', userUID);
    return getDoc(defaultTravelModeRef).then((snapShot) => snapShot.data());
  },
  setItinerariesSetting(userUID, newSetting) {
    const defaultTravelModeRef = doc(this.db, 'itineraries', userUID);
    return setDoc(defaultTravelModeRef, newSetting, { merge: 'merge' });
  },
};

export { firebaseAuth, firestore, firebaseStorage };
