// Firebase Configuration and Initialization
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyB2p1UHloeKuiaz-By-zqntbkXS2YbTYTU",
  authDomain: "project3-edf0f.firebaseapp.com",
  projectId: "project3-edf0f",
  storageBucket: "project3-edf0f.firebasestorage.app",
  messagingSenderId: "1050253195191",
  appId: "1:1050253195191:web:9fe28feee6811c01a6da32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with experimentalForceLongPolling for robust Android & Web connectivity
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);

export default app;
