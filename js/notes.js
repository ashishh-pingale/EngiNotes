import { db, auth } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 👇 ADD IT HERE
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

const notesContainer = document.getElementById("notesContainer");
const branchFilter = document.getElementById("branchFilter");
const yearFilter = document.getElementById("yearFilter");
const filterBtn = document.getElementById("filterBtn");

async function fetchNotes() {
  try {
    console.log("w")
    const querySnapshot = await getDocs(collection(db, "notes"));
    notesContainer.innerHTML = "";

    const selectedBranch = branchFilter.value;
    const selectedYear = yearFilter.value;

    querySnapshot.forEach((doc) => {
      const note = doc.data();

      if (
        note.status === "approved" &&
        (selectedBranch === "" || note.branch === selectedBranch) &&
        (selectedYear === "" || note.year === selectedYear)
      ) {
        const card = document.createElement("div");
        card.classList.add("note-card");
        card.classList.add(note.branch.toLowerCase());

        card.innerHTML = `
          <span class="branch-badge">${note.branch}</span>
          <h3>${note.title}</h3>
          <p class="subject-code">${note.subject} • Semester ${note.year}</p>

          <div class="user-info">
              <div class="avatar">NH</div>
              <span>Uploaded by <strong>NotesHub User</strong></span>
          </div>

          <div class="card-footer">
              <span class="file-size">${note.fileSize} • PDF</span>
              <button class="btn-download-small">Download</button>
          </div>
        `;
        const downloadBtn = card.querySelector(".btn-download-small");

        downloadBtn.addEventListener("click", () => {

          if (!currentUser) {
            window.location.href = "login.html";
          } else {
            alert("Download allowed (real file next)");
          }

        });


        notesContainer.appendChild(card); // IMPORTANT
      }
    });

  } catch (error) {
    console.error("Error fetching notes:", error);
  }
}

// Run on page load
fetchNotes();

// Filter button click
filterBtn.addEventListener("click", fetchNotes);
