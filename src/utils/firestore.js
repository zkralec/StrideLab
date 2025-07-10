import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Save role + profile
export const saveUserProfile = async (userId, data) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, data, { merge: true });
};

// Load profile
export const getUserProfile = async (userId) => {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

// Save a coach's athletes
export const saveCoachAthletes = async (userId, athletes) => {
  const ref = doc(db, "users", userId);
  await setDoc(ref, { athletes }, { merge: true });
};

