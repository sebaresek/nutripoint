import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDcrOvRBWD2HgIIwjd2xycjsrKnxlGZhTg",
    authDomain: "subflow-marketplace.firebaseapp.com",
    projectId: "subflow-marketplace",
    storageBucket: "subflow-marketplace.firebasestorage.app",
    messagingSenderId: "162293764842",
    appId: "1:162293764842:web:e8405ebdd286491d4cbd93",
    measurementId: "G-F1X0RLYQ4S"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
