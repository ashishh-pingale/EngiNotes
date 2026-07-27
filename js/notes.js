import { db, auth } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ======================================================
// Auth
// ======================================================

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// ======================================================
// DOM Elements
// ======================================================

const notesContainer = document.getElementById("notesContainer");
const branchFilter = document.getElementById("branchFilter");
const yearFilter = document.getElementById("yearFilter");
const filterBtn = document.getElementById("filterBtn");

// ======================================================
// Fetch Notes
// ======================================================

async function fetchNotes() {

    try {

        notesContainer.innerHTML = "";

        const selectedBranch = branchFilter.value;
        const selectedYear = yearFilter.value;

        const snapshot = await getDocs(collection(db, "notes"));

        let notesFound = false;

        snapshot.forEach((doc) => {

            const note = doc.data();

            // Hide only rejected notes while developing
            if (note.status === "rejected") return;

            if (
                (selectedBranch === "" || note.branch === selectedBranch) &&
                (selectedYear === "" || note.year === selectedYear)
            ) {

                notesFound = true;

                const card = document.createElement("div");

                card.classList.add("note-card");

                if (note.branch) {
                    card.classList.add(note.branch.toLowerCase());
                }

                card.innerHTML = `
                    <span class="branch-badge">
                        ${note.branch || "General"}
                    </span>

                    <h3>
                        ${note.title || "Untitled Note"}
                    </h3>

                    <p class="subject-code">
                        ${note.subject || "Unknown Subject"} • ${getYearText(note.year)} • Semester ${note.semester || "-"}
                    </p>

                    <div class="user-info">

                        <div class="avatar">
                            ${(note.uploaderName || "U").charAt(0).toUpperCase()}
                        </div>

                        <span>
                            Uploaded by
                            <strong>${note.uploaderName || "Unknown"}</strong>
                        </span>

                    </div>

                    <div class="card-footer">

                        <button class="btn-download-small">
                            View PDF
                        </button>

                    </div>
                `;

                const downloadBtn =
                    card.querySelector(".btn-download-small");

                downloadBtn.addEventListener("click", () => {

                    if (!currentUser) {

                        window.location.href = "login.html";
                        return;

                    }

                    window.open(
                        note.pdfUrl,
                        "_blank",
                        "noopener,noreferrer"
                    );

                });

                notesContainer.appendChild(card);

            }

        });

        if (!notesFound) {

            notesContainer.innerHTML = `

                <div class="no-notes">

                    <h2>No Notes Found 📚</h2>

                    <p>
                        No notes match the selected filters.
                    </p>

                </div>

            `;

        }

    } catch (error) {

        console.error("Error fetching notes:", error);

        notesContainer.innerHTML = `

            <div class="no-notes">

                <h2>Something went wrong</h2>

                <p>Please refresh the page.</p>

            </div>

        `;

    }

}

// ======================================================
// Events
// ======================================================

function getYearText(year) {
    switch (String(year)) {
        case "1":
            return "1st Year";
        case "2":
            return "2nd Year";
        case "3":
            return "3rd Year";
        case "4":
            return "4th Year";
        default:
            return "Year";
    }
}
fetchNotes();

filterBtn.addEventListener("click", fetchNotes);