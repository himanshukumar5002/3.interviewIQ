
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "newproject-bac4d.firebaseapp.com",
  projectId: "newproject-bac4d",
  storageBucket: "newproject-bac4d.firebasestorage.app",
  messagingSenderId: "219580569918",
  appId: "1:219580569918:web:dd7ccdfa9dc1536479f46f",
  measurementId: "G-FQ7RXD9L30"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}