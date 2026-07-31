import { db, auth } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    increment,
    updateDoc,
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ======================================================
// Auth
// ======================================================
let currentUser = null;
let currentPreviewNote = null;
let hasLikedCurrentNote = false;

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
const notePreviewModal = document.getElementById("notePreviewModal");
const previewFrame = document.getElementById("previewFrame");
const previewTitle = document.getElementById("previewTitle");
const previewSubject = document.getElementById("previewSubject");
const previewSubject2 = document.getElementById("previewSubject2");
const previewUploader = document.getElementById("previewUploader");
const previewDate = document.getElementById("previewDate");
const previewViews = document.getElementById("previewViews");
const previewLikes = document.getElementById("previewLikes");
const previewBranch = document.getElementById("previewBranch");
const previewSemester = document.getElementById("previewSemester");
const previewDescription = document.getElementById("previewDescription");
const closePreviewBtn = document.getElementById("closePreview");
const previewDownloads = document.getElementById("previewDownloads");
const downloadBtn = document.getElementById("downloadBtn");
const likeBtn = document.getElementById("likeBtn");
const searchInput = document.getElementById("searchInput");


// ======================================================
// Fetch Notes
// ======================================================

async function fetchNotes() {
    console.log("fetchNotes started");

    try {

        notesContainer.innerHTML = "";

        const selectedBranch = branchFilter.value;
        const selectedYear = yearFilter.value;
        const searchText =
        searchInput.value
        .trim()
        .toLowerCase();

        // Only fetch APPROVED notes
        const notesQuery = query(
            collection(db, "notes"),
            where("status", "==", "approved")
        );

        const snapshot = await getDocs(notesQuery);

        let notesFound = false;

        snapshot.forEach((docSnap) => {

            const note = {
            id: docSnap.id,
            ...docSnap.data()
        };

            const matchesBranch =
                selectedBranch === "" ||
                note.branch === selectedBranch;

            const matchesYear =
                selectedYear === "" ||
                note.year === selectedYear;

            const matchesSearch =

                searchText === "" ||

                note.title?.toLowerCase().includes(searchText) ||

                note.subject?.toLowerCase().includes(searchText) ||

                note.uploaderName?.toLowerCase().includes(searchText);

            if (
                matchesBranch &&
                matchesYear &&
                matchesSearch
            ) 

                        
            {

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
                        ${note.subject || "Unknown Subject"}
                        • ${getYearText(note.year)}
                        • Semester ${note.semester || "-"}
                    </p>

                    <div class="user-info">

                        <div class="avatar">
                            ${(note.uploaderName || "U")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <span>
                            Uploaded by
                            <strong>${note.uploaderName || "Unknown"}</strong>
                        </span>

                    </div>

                    <div class="card-footer">

                        <button class="btn-download-small">
                            Open PDF
                        </button>

                    </div>
                `;

                const openPdfBtn =
                    card.querySelector(".btn-download-small");

            openPdfBtn.addEventListener("click", async () => {

                if (!currentUser) {

                    window.location.href = "login.html";
                    return;

                }

                openPreview(note);

            });

                notesContainer.appendChild(card);

            }

        });

        if (!notesFound) {

            notesContainer.innerHTML = `
                <div class="no-notes">

                    <h2>No Notes Found 📚</h2>

                    <p>
                        There are no approved notes matching your filters.
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


// -------------------------
// Preview Functions
// -------------------------
async function checkIfLiked(noteId) {

    if (!currentUser) {
        hasLikedCurrentNote = false;
        likeBtn.innerHTML = `🤍 Like`;
        return;
    }

    const likeRef = doc(
        db,
        "noteLikes",
        `${noteId}_${currentUser.uid}`
    );

    const likeSnap = await getDoc(likeRef);

    hasLikedCurrentNote = likeSnap.exists();

    likeBtn.innerHTML = hasLikedCurrentNote
        ? "❤️ Liked"
        : "🤍 Like";
}




async function openPreview(note){
    currentPreviewNote = note;
    
    try {
    await updateDoc(
        doc(db, "notes", note.id),{
            views: increment(1)
        }
    );
    note.views = (note.views || 0) + 1;
} catch (err) {
    console.error("Failed to update views:", err);

}
    previewTitle.textContent = note.title;
    previewSubject.textContent = note.subject;
    previewSubject2.textContent = note.subject;
    previewViews.textContent = note.views || 0;
    previewDownloads.textContent = note.downloads || 0;
    previewLikes.textContent = note.likes || 0;

    previewUploader.textContent = note.uploaderName;

   if (note.uploadedAt?.toDate) {
    previewDate.textContent =
        note.uploadedAt.toDate().toLocaleDateString();
    }
    else{
        previewDate.textContent = "-";
    }


    previewBranch.textContent = note.branch;
    previewSemester.textContent = note.semester;

    previewDescription.textContent = note.description;

    previewFrame.src = note.pdfUrl;

    notePreviewModal.classList.add("show");
    checkIfLiked(note.id);

}

function closePreview(){

    notePreviewModal.classList.remove("show");

    previewFrame.src = "";

}


closePreviewBtn.addEventListener("click", closePreview);

notePreviewModal.addEventListener("click",(e)=>{

    if(e.target===notePreviewModal){

        closePreview();

    }

});



downloadBtn.addEventListener("click", async () => {
    if (!currentUser) {
    window.location.href = "login.html";
    return;
}

    if (!currentPreviewNote) return;

    try {

        await updateDoc(
            doc(db, "notes", currentPreviewNote.id),
            {
                downloads: increment(1)
            }
        );

        currentPreviewNote.downloads =
            (currentPreviewNote.downloads || 0) + 1;

        previewDownloads.textContent =
            currentPreviewNote.downloads;

    } catch (err) {

        console.error(err);

    }

    window.open(
        currentPreviewNote.pdfUrl,
        "_blank",
        "noopener,noreferrer"
    );

});

likeBtn.addEventListener("click", async () => {

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    if (!currentPreviewNote) return;

    const likeRef = doc(
        db,
        "noteLikes",
        `${currentPreviewNote.id}_${currentUser.uid}`
    );

    try {

        if (hasLikedCurrentNote) {

            await deleteDoc(likeRef);

            await updateDoc(
                doc(db, "notes", currentPreviewNote.id),
                {
                    likes: increment(-1)
                }
            );

            hasLikedCurrentNote = false;

            currentPreviewNote.likes--;

        } else {

            await setDoc(likeRef, {

                noteId: currentPreviewNote.id,
                userId: currentUser.uid,
                likedAt: new Date()

            });

            await updateDoc(
                doc(db, "notes", currentPreviewNote.id),
                {
                    likes: increment(1)
                }
            );

            hasLikedCurrentNote = true;

            currentPreviewNote.likes =
                (currentPreviewNote.likes || 0) + 1;
        }

        previewLikes.textContent = currentPreviewNote.likes;

        likeBtn.innerHTML = hasLikedCurrentNote
            ? "❤️ Liked"
            : "🤍 Like";

    } catch (err) {

        console.error(err);

    }

});

// ======================================================
// Utility
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

// ======================================================
// Events
// ======================================================

fetchNotes();

// filterBtn.addEventListener("click", fetchNotes);
searchInput.addEventListener("input", fetchNotes); 
branchFilter.addEventListener("change", fetchNotes); 
yearFilter.addEventListener("change", fetchNotes);