import { db, auth } from "../../js/firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const usersList = document.getElementById("usersList");
const searchInput = document.getElementById("searchInput");

let currentUser = null;
let allUsers = [];

// ======================
// WAIT FOR LOGIN
// ======================
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  currentUser = user;
  loadUsers();
});

// ======================
// LOAD USERS
// ======================
async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"));

  allUsers = [];

  for (const docSnap of snapshot.docs) {
    const user = docSnap.data();
    const userId = docSnap.id;

    if (userId === currentUser.uid) continue;

    allUsers.push({
      id: userId,
      ...user
    });
  }

  renderUsers(allUsers);
}

// ======================
// RENDER USERS
// ======================
async function renderUsers(users) {
  usersList.innerHTML = "";

  for (const user of users) {
    const q = query(
      collection(db, "follows"),
      where("followerId", "==", currentUser.uid),
      where("followingId", "==", user.id)
    );

    const followSnap = await getDocs(q);
    const isConnected = !followSnap.empty;

    const card = document.createElement("div");
    card.classList.add("user-card");

    card.innerHTML = `
      <div class="card-avatar">${user.name?.charAt(0) || "U"}</div>
      <div class="card-name">${user.name}</div>
      <span class="card-branch">
        ${user.branch || "Engineering"} • ${user.year || ""}
      </span>
      <div class="card-stats">
        <div class="stat">Student</div>
      </div>
      <button class="view-profile-btn connect-btn">
        ${isConnected ? "Connected" : "Connect"}
      </button>
    `;

    const button = card.querySelector(".connect-btn");

    button.addEventListener("click", async () => {
      await toggleConnection(user.id, button);
    });

    usersList.appendChild(card);
  }
}

// ======================
// SEARCH
// ======================
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase().trim();

  const filtered = allUsers.filter(user =>
    user.name?.toLowerCase().includes(value) ||
    user.branch?.toLowerCase().includes(value) ||
    user.year?.toLowerCase().includes(value)
  );

  renderUsers(filtered);
});

// ======================
// CONNECT / DISCONNECT
// ======================
async function toggleConnection(targetUserId, button) {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", currentUser.uid),
    where("followingId", "==", targetUserId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    await deleteDoc(doc(db, "follows", docId));
    button.textContent = "Connect";
    return;
  }

  await addDoc(collection(db, "follows"), {
    followerId: currentUser.uid,
    followingId: targetUserId,
    createdAt: new Date()
  });

  button.textContent = "Connected";
}