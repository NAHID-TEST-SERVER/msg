import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { getDatabase, ref, set, push, onValue, off, onChildAdded, serverTimestamp as rtdbTimestamp } from "firebase/database";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const rtdb = getDatabase(app, `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`);

export const googleProvider = new GoogleAuthProvider();

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  ref,
  set,
  push,
  onValue,
  off,
  onChildAdded,
  rtdbTimestamp
};
