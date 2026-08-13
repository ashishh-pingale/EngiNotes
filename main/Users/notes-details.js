import { db, auth } from "../../js/firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    increment,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUser = null;
let currentNote = null;
let uploaderId = null;


//DOM
const noteTitle=document.getElementById("noteTitle");
const noteSubject=document.getElementById("noteSubject");

const noteFrame=document.getElementById("noteFrame");

const uploaderAvatar=document.getElementById("uploaderAvatar");
const uploaderName=document.getElementById("uploaderName");
const uploadedDate=document.getElementById("uploadedDate");

const noteViews=document.getElementById("noteViews");
const noteDownloads=document.getElementById("noteDownloads");
const noteLikes=document.getElementById("noteLikes");

const noteBranch=document.getElementById("noteBranch");
const noteYear=document.getElementById("noteYear");
const noteSemester=document.getElementById("noteSemester");

const noteDescription=document.getElementById("noteDescription");

const likeBtn=document.getElementById("likeBtn");
const downloadBtn=document.getElementById("downloadBtn");

const profileAvatar=document.getElementById("profileAvatar");
const profileName=document.getElementById("profileName");
const profileBranch=document.getElementById("profileBranch");

const profileBtn=document.getElementById("profileBtn");

const moreNotesContainer=document.getElementById("moreNotesContainer");

onAuthStateChanged(auth,(user)=>{

    currentUser = user;
    console.log("Current URL:", window.location.href);
    console.log("noteId:", noteId);

    if(!currentNote){
        loadNote();
    }
    else{
        checkLikeStatus();
    }

    

});

const params = new URLSearchParams(window.location.search);

const noteId = params.get("id");

if(!noteId){

    alert("Invalid Note");

    history.back();

}

async function loadNote(){

    try{

        const noteRef = doc(db,"notes",noteId);

        const noteSnap = await getDoc(noteRef);

        if(!noteSnap.exists()){

            alert("Note not found");

            history.back();

            return;

        }

        currentNote = {

            id:noteSnap.id,

            ...noteSnap.data()

        };

        uploaderId=currentNote.uploaderId;

        populateNote();

        await increaseViews();

        await loadUploader();

        await checkLikeStatus();

        await loadMoreNotes();

    }

    catch(err){

        console.error(err);

    }

}

function populateNote(){

    noteTitle.textContent=currentNote.title;

    noteSubject.textContent=currentNote.subject;

    noteFrame.src=currentNote.pdfUrl;

    uploaderName.textContent=currentNote.uploaderName;

    uploaderAvatar.textContent=
    currentNote.uploaderName.charAt(0).toUpperCase();

    noteViews.textContent=currentNote.views||0;

    noteDownloads.textContent=currentNote.downloads||0;

    noteLikes.textContent=currentNote.likes||0;

    noteBranch.textContent=currentNote.branch;

    noteYear.textContent=currentNote.year;

    noteSemester.textContent=currentNote.semester;

    noteDescription.textContent=currentNote.description;

    if(currentNote.uploadedAt?.toDate){

        uploadedDate.textContent=
        currentNote.uploadedAt
        .toDate()
        .toLocaleDateString();

    }

}

// =============================================
// Increase Views
// =============================================

async function increaseViews(){

    try{

        await updateDoc(
            doc(db,"notes",currentNote.id),
            {
                views:increment(1)
            }
        );

        currentNote.views =
            (currentNote.views || 0) + 1;

        noteViews.textContent =
            currentNote.views;

    }

    catch(err){

        console.error(err);

    }

}
downloadBtn.addEventListener("click",async()=>{

    if(!currentUser){

        window.location.href="/main/login.html";

        return;

    }

    try{

        await updateDoc(
            doc(db,"notes",currentNote.id),
            {
                downloads:increment(1)
            }
        );

        currentNote.downloads =
            (currentNote.downloads || 0) + 1;

        noteDownloads.textContent =
            currentNote.downloads;

    }

    catch(err){

        console.error(err);

    }

    window.open(
        currentNote.pdfUrl,
        "_blank",
        "noopener,noreferrer"
    );

});

// =============================================
// LIKE STATUS
// =============================================

async function checkLikeStatus(){

    if(!currentUser || !currentNote){
        likeBtn.textContent = "❤️ Like";
        return;
    }

    const likeId =
        `${currentNote.id}_${currentUser.uid}`;

    try{

        const likeRef =
            doc(db,"noteLikes",likeId);

        const likeSnap =
            await getDoc(likeRef);

        if(likeSnap.exists()){

            likeBtn.textContent = "❤️ Liked";

            likeBtn.classList.add("liked");

        }
        else{

            likeBtn.textContent = "🤍 Like";

            likeBtn.classList.remove("liked");

        }

    }

    catch(err){

        console.error("Error checking like:",err);

    }

}


// =============================================
// LIKE / UNLIKE
// =============================================

likeBtn.addEventListener("click",async()=>{

    if(!currentUser){

        window.location.href="/main/login.html";

        return;

    }

    if(!currentNote) return;

    likeBtn.disabled = true;

    const likeId =
        `${currentNote.id}_${currentUser.uid}`;

    const likeRef =
        doc(db,"noteLikes",likeId);

    try{

        const likeSnap =
            await getDoc(likeRef);


        // =====================================
        // UNLIKE
        // =====================================

        if(likeSnap.exists()){

            await deleteDoc(likeRef);

            await updateDoc(
                doc(db,"notes",currentNote.id),
                {
                    likes:increment(-1)
                }
            );

            currentNote.likes =
                Math.max(
                    0,
                    (currentNote.likes || 0) - 1
                );

            noteLikes.textContent =
                currentNote.likes;

            likeBtn.textContent =
                "🤍 Like";

            likeBtn.classList.remove("liked");

        }


        // =====================================
        // LIKE
        // =====================================

        else{

            await setDoc(
                likeRef,
                {
                    noteId:currentNote.id,
                    userId:currentUser.uid,
                    likedAt:new Date()
                }
            );

            await updateDoc(
                doc(db,"notes",currentNote.id),
                {
                    likes:increment(1)
                }
            );

            currentNote.likes =
                (currentNote.likes || 0) + 1;

            noteLikes.textContent =
                currentNote.likes;

            likeBtn.textContent =
                "❤️ Liked";

            likeBtn.classList.add("liked");

        }

    }

    catch(err){

        console.error("Like operation failed:",err);

    }

    finally{

        likeBtn.disabled = false;

    }

});

async function loadUploader(){

    try{

        const userRef =
            doc(db,"users",uploaderId);

        const userSnap =
            await getDoc(userRef);

        if(!userSnap.exists()) return;

        const user =
            userSnap.data();

        profileName.textContent =
            user.name || "Unknown";

        profileBranch.textContent =
            user.branch || "";

        profileAvatar.textContent =
            (user.name || "U")
            .charAt(0)
            .toUpperCase();

        profileBtn.href =
            `/main/Users/user_profile.html?uid=${uploaderId}`;

    }

    catch(err){

        console.error(err);

    }

}

async function loadMoreNotes(){

    try{

        const q = query(
            collection(db,"notes"),
            where("uploaderId","==",uploaderId),
            where("status","==","approved")
        );

        const snapshot = await getDocs(q);

        moreNotesContainer.innerHTML = "";

        const otherNotes = [];

        snapshot.forEach(docSnap => {

            if(docSnap.id === currentNote.id) return;

            otherNotes.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        // Show latest 6 notes
        otherNotes.sort((a,b) => {

            const dateA =
                a.uploadedAt?.toDate?.() || new Date(0);

            const dateB =
                b.uploadedAt?.toDate?.() || new Date(0);

            return dateB - dateA;

        });

        const recentNotes = otherNotes.slice(0,6);

        if(recentNotes.length === 0){

            moreNotesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No other uploads from this user yet.</p>
                </div>
            `;

            return;

        }

        recentNotes.forEach(note => {

            const card =
                document.createElement("div");

            card.className = "more-note-card";

            card.innerHTML = `
                <div class="more-note-info">

                    <h3>
                        ${note.title || "Untitled Note"}
                    </h3>

                    <span>
                        ${note.subject || "Unknown Subject"}
                    </span>

                </div>

                <button class="more-note-btn">
                    View →
                </button>
            `;

            card.addEventListener("click", () => {

                window.location.href =
                    `/main/Users/notes-details.html?id=${note.id}`;

            });

            moreNotesContainer.appendChild(card);

        });

    }

    catch(err){

        console.error("Error loading more notes:",err);

        moreNotesContainer.innerHTML = `
            <div class="empty-state">
                <p>Unable to load other uploads.</p>
            </div>
        `;

    }

}

profileBtn.addEventListener("click",(e)=>{

    e.preventDefault();

    window.location.href =
    `/main/Users/user_profile.html?uid=${uploaderId}`;

});

const allUploadsBtn =
    document.getElementById("allUploadsBtn");

if(allUploadsBtn){

    allUploadsBtn.addEventListener("click", () => {

        window.location.href =
            `/main/Users/user_profile.html?uid=${uploaderId}`;

    });

}