import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: `${process.env.firebaseApiKey}`,
  authDomain: `${process.env.firebaseProjectId}.firebaseapp.com`,
  projectId: `${process.env.firebaseProjectId}`,
  storageBucket: `${process.env.firebaseProjectId}.appspot.com`,
  messagingSenderId: `${process.env.firebaseMessagingSenderId}`,
  appId: `${process.env.firebaseAppId}`,
  measurementId: `${process.env.firebaseMeasurementId}`,
};

const app = initializeApp(firebaseConfig);

export const dbois = getFirestore(app); //imported as dbois
export const fbAuth = getAuth(app);
export const fbDatabase = getDatabase(app);
export const fbStorage = getStorage(app);

export default dbois;
