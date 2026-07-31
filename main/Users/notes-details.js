import { db, auth } from "../../js/firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    increment,
    collection,
    query,
    where,
    getDocs
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

    loadNote();

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

likeBtn.addEventListener("click",async()=>{

    if(!currentUser){

        window.location.href="/main/login.html";

        return;

    }

    try{

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

    }

    catch(err){

        console.error(err);

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

        const snapshot =
            await getDocs(q);

        moreNotesContainer.innerHTML = "";

        snapshot.forEach(docSnap=>{

            if(docSnap.id===currentNote.id)
                return;

            const note={
                id:docSnap.id,
                ...docSnap.data()
            };

            const card =
                document.createElement("div");

            card.className =
                "more-note-card";

            card.innerHTML=`

                <div class="more-note-info">

                    <h3>${note.title}</h3>

                    <span>

                        ${note.subject}

                    </span>

                </div>

                <a
                    class="more-note-btn">

                    View →

                </a>

            `;

            card.addEventListener("click",()=>{

                window.location.href=
                `/main/Users/notes-details.html?id=${note.id}`;

            });

            moreNotesContainer
            .appendChild(card);

        });

        if(
            moreNotesContainer.innerHTML===""){

            moreNotesContainer.innerHTML=`

                <div class="empty-state">

                    <p>

                        No more uploads.

                    </p>

                </div>

            `;

        }

    }

    catch(err){

        console.error(err);

    }

}

profileBtn.addEventListener("click",(e)=>{

    e.preventDefault();

    window.location.href =
    `/main/Users/user_profile.html?uid=${uploaderId}`;

});