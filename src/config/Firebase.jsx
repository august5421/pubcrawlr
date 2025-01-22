import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAr6pRirlauPAKgSC1m1HyLbgi5YZQn9lU",
  authDomain: "pubcrawlr-b1efb.firebaseapp.com",
  projectId: "pubcrawlr-b1efb",
  storageBucket: "pubcrawlr-b1efb.firebasestorage.app",
  messagingSenderId: "76036568522",
  appId: "1:76036568522:web:d2d2d1cf21569b5f270b33",
  measurementId: "G-3QMXGWR2B1"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };