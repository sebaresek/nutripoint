import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA9ZmBLIIy01ks3jwjTsWBvN7F6S0Q1TeQ",
  authDomain: "nutripoint-6c551.firebaseapp.com",
  projectId: "nutripoint-6c551",
  storageBucket: "nutripoint-6c551.firebasestorage.app",
  messagingSenderId: "773617570402",
  appId: "1:773617570402:web:1292e0816e92141602f73b",
  measurementId: "G-68EE3V8PEH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
