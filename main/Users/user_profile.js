// 🔥 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCrUCfiq_2w47JYC4pzJ3MSO38rN_sUwjU",
  authDomain: "notes-hub-3eae3.firebaseapp.com",
  projectId: "notes-hub-3eae3"
};

// 🚀 Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// 🎯 DOM Elements
const connectBtn = document.getElementById("connectBtn");
const followersCountEl = document.getElementById("followersCount");
const followingCountEl = document.getElementById("followingCount");
const profileNameEl = document.getElementById("profileName");
const profileBioEl = document.getElementById("profileBio");


// 👤 USERS
let currentUserId = null;

// get profile user from URL
const params = new URLSearchParams(window.location.search);
const profileUserId = params.get("uid");

if (!profileUserId) {
  alert("Invalid profile");
}


// 🔒 AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    init();
  } else {
    window.location.href = "/login.html";
  }
});


// 🚀 INIT
async function init() {
  await loadUserProfile();        // 🔥 NEW
  preventSelfFollow();
  listenFollowersCount();
  loadFollowingCount();
  checkFollowStatus();
}


// 🔥 LOAD USER PROFILE DATA
async function loadUserProfile() {
  try {
    const userRef = doc(db, "users", profileUserId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      console.log("User Data:", data);

      profileNameEl.textContent = data.name || "No Name";
      profileBioEl.textContent = data.branch || "No bio";

    } else {
      profileNameEl.textContent = "User not found";
      profileBioEl.textContent = "";
    }

  } catch (err) {
    console.error("Error loading profile:", err);
  }
}


// 🚫 PREVENT SELF FOLLOW
function preventSelfFollow() {
  if (currentUserId === profileUserId) {
    connectBtn.style.display = "none";
  }
}


// 🔍 CHECK FOLLOW STATUS
async function checkFollowStatus() {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", currentUserId),
    where("followingId", "==", profileUserId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    connectBtn.textContent = "Disconnect";
    connectBtn.dataset.followId = snapshot.docs[0].id;
  } else {
    connectBtn.textContent = "Connect";
    connectBtn.dataset.followId = "";
  }
}


// 🔗 CONNECT USER
async function connectUser() {
  try {
    const q = query(
      collection(db, "follows"),
      where("followerId", "==", currentUserId),
      where("followingId", "==", profileUserId)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log("Already following");
      return;
    }

    await addDoc(collection(db, "follows"), {
      followerId: currentUserId,
      followingId: profileUserId,
      createdAt: new Date()
    });

  } catch (err) {
    console.error("Error connecting:", err);
  }
}


// ❌ DISCONNECT USER
async function disconnectUser(followId) {
  try {
    await deleteDoc(doc(db, "follows", followId));
  } catch (err) {
    console.error("Error disconnecting:", err);
  }
}


// 🖱️ BUTTON CLICK
connectBtn.addEventListener("click", async () => {

  const followId = connectBtn.dataset.followId;

  connectBtn.disabled = true;

  if (followId) {
    connectBtn.textContent = "Connect";
    await disconnectUser(followId);
  } else {
    connectBtn.textContent = "Disconnect";
    await connectUser();
  }

  await checkFollowStatus();
  connectBtn.disabled = false;
});


// 🔴 REAL-TIME FOLLOWERS COUNT
function listenFollowersCount() {
  const q = query(
    collection(db, "follows"),
    where("followingId", "==", profileUserId)
  );

  onSnapshot(q, (snapshot) => {
    followersCountEl.textContent = snapshot.size;
  });
}


// 🔢 FOLLOWING COUNT
async function loadFollowingCount() {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", profileUserId)
  );

  const snapshot = await getDocs(q);
  followingCountEl.textContent = snapshot.size;
}