import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyAygqNToiMpqkRAXpnwrJS6x1VpHl7Ogk8",
  authDomain:        "maxfarma-feaab.firebaseapp.com",
  projectId:         "maxfarma-feaab",
  storageBucket:     "maxfarma-feaab.firebasestorage.app",
  messagingSenderId: "632353368196",
  appId:             "1:632353368196:web:7ce39e7cde191765593ad1",
};

// Evita inicializar la app más de una vez (importante en Next.js)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;
