import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ============================================================
// FIREBASE CONFIGURATION
// Replace these with your own Firebase project credentials.
// Go to https://console.firebase.google.com → Create project
// → Project Settings → Your Apps → Web App → Config
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyReplaceWithYourOwn",
  authDomain: "bizinsight-demo.firebaseapp.com",
  projectId: "bizinsight-demo",
  storageBucket: "bizinsight-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
