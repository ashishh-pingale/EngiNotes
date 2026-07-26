import { db, auth } from "../js/firebase.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  getDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const contactList = document.querySelector(".contact-list");
const usernameEl = document.querySelector(".username");

let currentUser = null;
let receiverId = null;
let unsubscribeMessages = null;

// 🔐 AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  loadConnectedUsers();
});

// ============================
// LOAD CONNECTED USERS
// ============================
async function loadConnectedUsers() {
  const q = query(
    collection(db, "follows"),
    where("followerId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);

  contactList.innerHTML = "";

  for (const followDoc of snapshot.docs) {
    const follow = followDoc.data();
    const targetId = follow.followingId;

    const userRef = doc(db, "users", targetId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) continue;

    const user = userSnap.data();

    const div = document.createElement("div");
    div.classList.add("contact");

    div.innerHTML = `
      <div class="avatar blue-gradient">${user.name?.charAt(0) || "U"}</div>
      <div class="contact-info">
        <div class="contact-name">${user.name}</div>
        <p class="last-msg">Click to start chatting</p>
      </div>
    `;

    div.addEventListener("click", () => {
      document
        .querySelectorAll(".contact")
        .forEach(c => c.classList.remove("active"));

      div.classList.add("active");

      receiverId = targetId;
      usernameEl.textContent = user.name;

      loadMessages();
    });

    contactList.appendChild(div);
  }
}

// ============================
// SEND MESSAGE
// ============================
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();

  if (!text || !receiverId || !currentUser) return;

  await addDoc(collection(db, "chats"), {
    senderId: currentUser.uid,
    receiverId: receiverId,
    message: text,
    timestamp: serverTimestamp()
  });

  input.value = "";
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ============================
// LOAD MESSAGES
// ============================
function loadMessages() {
  if (!receiverId) return;

  // remove old listener
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  const q = query(
    collection(db, "chats"),
    orderBy("timestamp")
  );

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();

      const isThisChat =
        (msg.senderId === currentUser.uid &&
          msg.receiverId === receiverId) ||
        (msg.senderId === receiverId &&
          msg.receiverId === currentUser.uid);

      if (!isThisChat) return;

      const wrapper = document.createElement("div");

      wrapper.classList.add(
        "msg-wrapper",
        msg.senderId === currentUser.uid ? "sent" : "received"
      );

      wrapper.innerHTML = `
        <div class="msg-bubble">
          ${msg.message}
          <span class="msg-time">${formatTime(msg.timestamp)}</span>
        </div>
      `;

      messagesDiv.appendChild(wrapper);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// ============================
// FORMAT TIME
// ============================
function formatTime(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}