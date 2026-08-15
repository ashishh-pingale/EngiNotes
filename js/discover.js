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


// ======================================================
// DOM
// ======================================================

const usersList =
  document.getElementById("usersList");

const searchInput =
  document.getElementById("searchInput");


// ======================================================
// GLOBAL
// ======================================================

let currentUser = null;

let allUsers = [];

let currentUserName = "A user";


// ======================================================
// WAIT FOR LOGIN
// ======================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {
      return;
    }

    currentUser =
      user;


    try {

      const userSnap =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );


      if (userSnap.exists()) {

        currentUserName =
          userSnap.data().name ||
          "A user";

      }

    }

    catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

    }


    await loadUsers();

  }
);


// ======================================================
// LOAD USERS
// ======================================================

async function loadUsers() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "users"
        )
      );


    allUsers = [];


    for (
      const docSnap of snapshot.docs
    ) {

      const user =
        docSnap.data();

      const userId =
        docSnap.id;


      // Don't show yourself

      if (
        userId ===
        currentUser.uid
      ) {

        continue;

      }


      allUsers.push({

        id:
          userId,

        ...user

      });

    }


    await renderUsers(
      allUsers
    );

  }

  catch (error) {

    console.error(
      "Failed to load users:",
      error
    );

  }

}


// ======================================================
// RENDER USERS
// ======================================================

async function renderUsers(
  users
) {

  usersList.innerHTML = "";


  if (users.length === 0) {

    usersList.innerHTML = `

      <div class="no-users">

        <h2>
          No users found
        </h2>

        <p>
          Try a different search.
        </p>

      </div>

    `;

    return;

  }


  for (
    const user of users
  ) {

    // ==========================================
    // CHECK CONNECTION
    // ==========================================

    const q =
      query(

        collection(
          db,
          "follows"
        ),

        where(
          "followerId",
          "==",
          currentUser.uid
        ),

        where(
          "followingId",
          "==",
          user.id
        )

      );


    const followSnap =
      await getDocs(q);


    const isConnected =
      !followSnap.empty;


    // ==========================================
    // CREATE CARD
    // ==========================================

    const card =
      document.createElement(
        "div"
      );


    card.classList.add(
      "user-card"
    );


    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    const avatarContent =
      user.profileImage

        ? `
          <img
            src="${user.profileImage}"
            alt="${
              user.name ||
              "User"
            }"
          >
        `

        : `
          ${
            user.name
              ?.charAt(0)
              .toUpperCase() ||
            "U"
          }
        `;


    // ==========================================
    // CARD HTML
    // ==========================================

    card.innerHTML = `

      <div
        class="
          card-avatar
          profile-link
        "
        title="View Profile"
      >

        ${avatarContent}

      </div>


      <div
        class="
          card-name
          profile-link
        "
        title="View Profile"
      >

        ${
          user.name ||
          "Unknown User"
        }

      </div>


      <span
        class="card-branch"
      >

        ${
          user.branch ||
          "Engineering"
        }

        •

        ${
          user.year ||
          ""
        }

      </span>


      <div
        class="card-stats"
      >

        <div class="stat">

          Student

        </div>

      </div>


      <div
        class="card-actions"
      >

        <button
          class="
            view-profile-btn
            profile-btn
          "
        >

          View Profile

        </button>


        <button
          class="
            view-profile-btn
            connect-btn
          "
        >

          ${
            isConnected
              ? "Connected"
              : "Connect"
          }

        </button>

      </div>

    `;


    // ==========================================
    // VIEW PROFILE
    // ==========================================

    const profileElements =
      card.querySelectorAll(
        ".profile-link"
      );


    const profileButton =
      card.querySelector(
        ".profile-btn"
      );


    const openProfile =
      () => {

        window.location.href =
          `/main/Users/user_profile.html?uid=${user.id}`;

      };


    profileElements.forEach(
      element => {

        element.addEventListener(
          "click",
          openProfile
        );

      }
    );


    profileButton.addEventListener(
      "click",
      openProfile
    );


    // ==========================================
    // CONNECT
    // ==========================================

    const button =
      card.querySelector(
        ".connect-btn"
      );


    button.addEventListener(
      "click",
      async () => {

        await toggleConnection(
          user.id,
          button
        );

      }
    );


    // ==========================================
    // ADD CARD
    // ==========================================

    usersList.appendChild(
      card
    );

  }

}


// ======================================================
// SEARCH
// ======================================================

searchInput.addEventListener(
  "input",
  async () => {

    const value =
      searchInput.value
        .toLowerCase()
        .trim();


    const filtered =
      allUsers.filter(
        user =>

          user.name
            ?.toLowerCase()
            .includes(value)

          ||

          user.branch
            ?.toLowerCase()
            .includes(value)

          ||

          user.year
            ?.toLowerCase()
            .includes(value)

      );


    await renderUsers(
      filtered
    );

  }
);


// ======================================================
// CREATE NOTIFICATION
// ======================================================

async function createNotification(

  recipientId,

  type,

  message,

  relatedId = null

) {

  try {

    await addDoc(

      collection(
        db,
        "notifications"
      ),

      {

        recipientId:
          recipientId,

        senderId:
          currentUser.uid,

        type:
          type,

        message:
          message,

        relatedId:
          relatedId,

        read:
          false,

        createdAt:
          serverTimestamp()

      }

    );


    console.log(
      "Notification created successfully"
    );

  }

  catch (error) {

    console.error(
      "Notification Error:",
      error
    );

  }

}


// ======================================================
// CONNECT / DISCONNECT
// ======================================================

async function toggleConnection(

  targetUserId,

  button

) {

  try {

    const q =
      query(

        collection(
          db,
          "follows"
        ),

        where(
          "followerId",
          "==",
          currentUser.uid
        ),

        where(
          "followingId",
          "==",
          targetUserId
        )

      );


    const snapshot =
      await getDocs(q);


    // ==========================================
    // DISCONNECT
    // ==========================================

    if (
      !snapshot.empty
    ) {

      const docId =
        snapshot.docs[0].id;


      await deleteDoc(

        doc(
          db,
          "follows",
          docId
        )

      );


      button.textContent =
        "Connect";


      return;

    }


    // ==========================================
    // CONNECT
    // ==========================================

    await addDoc(

      collection(
        db,
        "follows"
      ),

      {

        followerId:
          currentUser.uid,

        followingId:
          targetUserId,

        createdAt:
          serverTimestamp()

      }

    );


    // ==========================================
    // NOTIFICATION
    // ==========================================

    await createNotification(

      targetUserId,

      "connect",

      `${currentUserName} connected with you.`,

      currentUser.uid

    );


    button.textContent =
      "Connected";

  }

  catch (error) {

    console.error(
      "Connection Error:",
      error
    );

  }

}