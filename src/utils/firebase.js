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
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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
  checkIsLogIn(change, error) {
    return onAuthStateChanged(this.auth, change, error);
  },
};

const firestore = {
  db: getFirestore(app),
  postTimeList(path, userUID, timeList, merge) {
    return setDoc(doc(this.db, path, userUID), { timeList }, { merge });
  },
  getTimeList(path, userUID) {
    return new Promise((resolve) => {
      getDoc(doc(this.db, path, userUID)).then((timeListSnap) => {
        resolve(timeListSnap.data());
      });
    });
  },
};

export { firebaseAuth, firestore };
