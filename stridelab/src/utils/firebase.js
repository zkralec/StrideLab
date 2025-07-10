// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGla3dW9QbT4p5XHk_Sboc8ga1zXeXCOs",
  authDomain: "stridelab-56a80.firebaseapp.com",
  projectId: "stridelab-56a80",
  storageBucket: "stridelab-56a80.firebasestorage.app",
  messagingSenderId: "153410991771",
  appId: "1:153410991771:web:8caa094294d7e5296b783e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app }