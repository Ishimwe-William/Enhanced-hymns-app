import {initializeApp, getApps} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

// Firebase configuration (replace with your actual values from Firebase Console)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_PROJECT_ID,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

const app = getApps().length === 0 && initializeApp(firebaseConfig);

const db = getFirestore(app);

export {db};
