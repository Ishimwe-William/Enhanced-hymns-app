import { initializeApp, getApps, getApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import {getAuth} from "firebase/auth";
import Constants from 'expo-constants';

// Firebase configuration (replace with your actual values from Firebase Console)
const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: Constants.expoConfig.extra.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: Constants.expoConfig.extra.EXPO_PUBLIC_MEASUREMENT_ID,
};

// Ensure only one instance of Firebase is initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const db = getFirestore(app);

export { db, auth };
