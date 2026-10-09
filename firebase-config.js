// Isi konfigurasi ini dari Firebase Console > Project settings > Your apps.
// Jangan pernah menaruh password admin di file ini.
window.VOTE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  databaseURL: "PASTE_DATABASE_URL_FROM_FIREBASE",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHt4NR1zu6v-BESmWhdna9wJhgFIGiFfA",
  authDomain: "vote-hijab-angkatan39.firebaseapp.com",
  projectId: "vote-hijab-angkatan39",
  storageBucket: "vote-hijab-angkatan39.firebasestorage.app",
  messagingSenderId: "1027924924478",
  appId: "1:1027924924478:web:8a12a7e5bfe09ca5eed96f",
  measurementId: "G-YNJJNHSXNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);