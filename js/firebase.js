// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCrUCfiq_2w47JYC4pzJ3MSO38rN_sUwjU",
    authDomain: "notes-hub-3eae3.firebaseapp.com",
    projectId: "notes-hub-3eae3",
    storageBucket: "notes-hub-3eae3.firebasestorage.app",
    messagingSenderId: "294192179348",
    appId: "1:294192179348:web:8cd741c99faf87c3feec81"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

console.log("Firebase connected successfully!");

export { db, auth, storage };
