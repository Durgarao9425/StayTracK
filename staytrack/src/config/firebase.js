// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcFE1LIuA2ms6U3CaKB0gk4dViJLNp6zg",
    authDomain: "staytrack-da2a8.firebaseapp.com",
    projectId: "staytrack-da2a8",

    // 🔥 FIXED BUCKET NAME
    storageBucket: "staytrack-da2a8.firebasestorage.app",
    messagingSenderId: "26441744351",
    appId: "1:26441744351:web:0fb8b29185edc6c810ce6a",
    measurementId: "G-NGETDBP52X"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize Analytics (web only)
let analytics = null;
if (Platform.OS === 'web') {
    try {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
    } catch (error) {
        console.warn('⚠️ Analytics not available:', error.message);
    }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
let auth;
try {
    if (Platform.OS === 'web') {
        auth = getAuth(app);
    } else {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    }
} catch (error) {
    console.error('❌ Firebase Auth initialization error:', error);
    auth = getAuth(app);
}

// Initialize Storage (uses corrected bucket)
const storage = getStorage(app);

export { auth, analytics, app, db, storage };