// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0qBvMrP--wbn-X0uBlhLAOX4iNqEjt2Q",
  authDomain: "gamaliel-connect.firebaseapp.com",
  projectId: "gamaliel-connect",
  storageBucket: "gamaliel-connect.firebasestorage.app",
  messagingSenderId: "226676994860",
  appId: "1:226676994860:web:869ed2db289731b5a13289",
  measurementId: "G-925W6JRW28"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);