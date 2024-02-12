// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbG4Al-EoL2yRkPoyjylVcX6y5uqGuWY0",
  authDomain: "balance-wizard.firebaseapp.com",
  databaseURL: "https://balance-wizard-default-rtdb.firebaseio.com",
  projectId: "balance-wizard",
  storageBucket: "balance-wizard.appspot.com",
  messagingSenderId: "787437428043",
  appId: "1:787437428043:web:8115500609a47d8cc2dcce",
  measurementId: "G-KFPB7N0909"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//export
export const auth = getAuth(app);