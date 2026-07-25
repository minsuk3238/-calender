import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with the actual config after fetching it via CLI
const firebaseConfig = {
  projectId: "calender-4b7c4",
  appId: "1:123154076628:web:7223f68cca6bcc553ebc41",
  storageBucket: "calender-4b7c4.firebasestorage.app",
  apiKey: "AIzaSyA4q5w6PvmbuQdCYs_cQzGGDKLeaDQz9X4",
  authDomain: "calender-4b7c4.firebaseapp.com",
  messagingSenderId: "123154076628",
  measurementId: "G-LS3YBKPJ92"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

export { app, auth, db, googleProvider };
