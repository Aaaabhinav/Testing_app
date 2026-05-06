// Firebase configuration — connected to project: test-app-450c6
import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAcnJPuarcxRTqkrFm3iaWHE_e5Wli2E40",
  authDomain: "test-app-450c6.firebaseapp.com",
  projectId: "test-app-450c6",
  storageBucket: "test-app-450c6.firebasestorage.app",
  messagingSenderId: "1024690603305",
  appId: "1:1024690603305:web:7fedb300a37d4c729ce338"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-appropriate persistence
let auth;

if (Platform.OS === 'web') {
  // Web: use browser persistence
  const { getAuth, browserLocalPersistence, setPersistence } = require('firebase/auth');
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
} else {
  // Native (iOS/Android): use AsyncStorage persistence
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { app, auth };
