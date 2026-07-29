import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================================
// DOM Elements
// ======================================================

const tableBody = document.getElementById("pendingNotesBody");
const emptyState = document.getElementById("emptyState");

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");
const downloadsCount = document.getElementById("downloadsCount");

let pendingNotes = [];
let allNotes = [];

// ======================================================
// Initialize Dashboard
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await loadDashboard();

    } catch (error) {

        console.error("Dashboard Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;color:red;">
                    Failed to load dashboard.
                </td>
            </tr>
        `;

    }

});

// ======================================================
// Main Loader
// ======================================================

async function loadDashboard() {

    await fetchNotes();

    updateStatistics();

    renderPendingNotes();

}

// ======================================================
// Fetch Notes From Firestore
// ======================================================

async function fetchNotes() {

    const notesRef = collection(db, "notes");

    const q = query(
        notesRef,
        orderBy("uploadedAt", "desc")
    );

    const snapshot = await getDocs(q);

    allNotes = [];

    snapshot.forEach((doc) => {

        allNotes.push({

            id: doc.id,

            ...doc.data()

        });

    });

    pendingNotes = allNotes.filter(note => note.status === "pending");

}

// ======================================================
// Statistics
// ======================================================

function updateStatistics() {

    pendingCount.textContent =
        pendingNotes.length;

    approvedCount.textContent =
        allNotes.filter(
            n => n.status === "approved"
        ).length;

    rejectedCount.textContent =
        allNotes.filter(
            n => n.status === "rejected"
        ).length;

    downloadsCount.textContent =
        allNotes.reduce(
            (sum, note) => sum + (note.downloads || 0),
            0
        );

}

// ======================================================
// Render Pending Notes
// ======================================================

function renderPendingNotes() {

    tableBody.innerHTML = "";

    if (pendingNotes.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    pendingNotes.forEach(note => {

        const row = createRow(note);

        tableBody.appendChild(row);

    });

}

// ======================================================
// Create Table Row
// ======================================================

function createRow(note) {

    const tr = document.createElement("tr");

    const uploadDate =
        note.uploadedAt?.toDate
            ? note.uploadedAt.toDate().toLocaleDateString()
            : "Today";

    tr.innerHTML = `

        <td>📄</td>

        <td>${note.title}</td>

        <td>${note.subject}</td>

        <td>${note.branch}</td>

        <td>${note.year}</td>

        <td>${note.semester}</td>

        <td>${note.uploaderName}</td>

        <td>${uploadDate}</td>

        <td>

            <button class="view-btn">
                👁 View
            </button>

            <button class="approve-btn">
                ✅ Approve
            </button>

            <button class="reject-btn">
                ❌ Reject
            </button>

        </td>

    `;

    const viewBtn =
        tr.querySelector(".view-btn");

    const approveBtn =
        tr.querySelector(".approve-btn");

    const rejectBtn =
        tr.querySelector(".reject-btn");
        // ==========================================
    // View Button
    // ==========================================

    viewBtn.addEventListener("click", () => {

        if (note.pdfUrl) {

            window.open(note.pdfUrl, "_blank");

        } else {

            alert("PDF not found.");

        }

    });

    // ==========================================
    // Approve Button (Placeholder)
    // ==========================================

approveBtn.addEventListener("click", async () => {

    const confirmApprove = confirm(
        `Approve "${note.title}"?`
    );

    if (!confirmApprove) return;

    try {

        await updateDoc(
            doc(db, "notes", note.id),
            {
                status: "approved"
            }
        );

        alert("Note approved successfully.");

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Failed to approve note.");

    }

});

    // ==========================================
    // Reject Button (Placeholder)
    // ==========================================

rejectBtn.addEventListener("click", async () => {

    const confirmReject = confirm(
        `Reject "${note.title}"?\n\nThis action will hide the note from students.`
    );

    if (!confirmReject) return;

    try {

        await updateDoc(
            doc(db, "notes", note.id),
            {
                status: "rejected"
            }
        );

        alert("Note rejected successfully.");

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Failed to reject note.");

    }

});

    return tr;

}