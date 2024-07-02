// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "publishhub-72bc9.firebaseapp.com",
  projectId: "publishhub-72bc9",
  storageBucket: "publishhub-72bc9.appspot.com",
  messagingSenderId: "300197009790",
  appId: "1:300197009790:web:5c9a3b93dfea5f2e797b2f",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
