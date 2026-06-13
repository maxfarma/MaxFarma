import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = { apiKey:"AIzaSyAmlKk-kun_RwenWVF--0rDaMO8LbP7wvw", authDomain:"maxfarma-eaf1a.firebaseapp.com", projectId:"maxfarma-eaf1a", storageBucket:"maxfarma-eaf1a.firebasestorage.app", messagingSenderId:"49200319911", appId:"1:49200319911:web:bae1dd5687851b0a227a82", measurementId:"G-Y8GS4ZB2DK" };
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
