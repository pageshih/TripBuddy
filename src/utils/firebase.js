// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC_FhbY2WJAd5DkaXbYdaQFNgUWYxHF4AA',
  authDomain: 'trip-buddy-6be03.firebaseapp.com',
  projectId: 'trip-buddy-6be03',
  storageBucket: 'trip-buddy-6be03.appspot.com',
  messagingSenderId: '170146115022',
  appId: '1:170146115022:web:c81d488d6383f778840f9f',
  measurementId: 'G-FMYR3ZQ8MS',
};

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
};

export { firebaseAuth, firestore };
