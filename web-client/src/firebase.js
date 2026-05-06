import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcnJPuarcxRTqkrFm3iaWHE_e5Wli2E40",
  authDomain: "test-app-450c6.firebaseapp.com",
  projectId: "test-app-450c6",
  storageBucket: "test-app-450c6.firebasestorage.app",
  messagingSenderId: "1024690603305",
  appId: "1:1024690603305:web:7fedb300a37d4c729ce338"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export { app, auth };
