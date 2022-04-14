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
  setItineraryOverView(userUID) {
    const itineraryOverviewRef = doc(
      collection(this.db, 'itineraries', userUID, 'overviews')
    );
    console.log(itineraryOverviewRef.id);
  },
};

export { firebaseAuth, firestore };
