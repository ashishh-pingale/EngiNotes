import { db, auth } from "../../js/firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const usersList = document.getElementById("usersList");
const searchInput = document.getElementById("searchInput");

let currentUser = null;
let allUsers = [];
let currentUserName = "A user";

// ======================
// WAIT FOR LOGIN
// ======================
onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  currentUser = user;

  try {

    const userSnap = await getDoc(
      doc(db, "users", user.uid)
    );

    if (userSnap.exists()) {

      currentUserName =
        userSnap.data().name || "A user";

    }

  }
  catch (error) {

    console.error(
      "Failed to load current user:",
      error
    );

  }

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
// CREATE NOTIFICATION
// ======================

async function createNotification(
  recipientId,
  type,
  message,
  relatedId = null
) {

  try {

    await addDoc(
      collection(db, "notifications"),
      {
        recipientId: recipientId,
        senderId: currentUser.uid,
        type: type,
        message: message,
        relatedId: relatedId,
        read: false,
        createdAt: serverTimestamp()
      }
    );

    console.log("Notification created successfully");

  }
  catch (error) {

    console.error(
      "Notification Error:",
      error
    );

  }

}

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

  // ======================
  // DISCONNECT
  // ======================

  if (!snapshot.empty) {

    const docId =
      snapshot.docs[0].id;

    await deleteDoc(
      doc(db, "follows", docId)
    );

    button.textContent =
      "Connect";

    return;
  }


  // ======================
  // CONNECT
  // ======================

  await addDoc(
    collection(db, "follows"),
    {
      followerId:
        currentUser.uid,

      followingId:
        targetUserId,

      createdAt:
        serverTimestamp()
    }
  );


  // ======================
  // NOTIFICATION
  // ======================

  await createNotification(

    targetUserId,

    "connect",

    `${currentUserName} connected with you.`

  );


  button.textContent =
    "Connected";

}