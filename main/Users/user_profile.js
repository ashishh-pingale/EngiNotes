/* ===========================================================
   EngiNotes - User Profile
   =========================================================== */

import { auth, db } from "../../js/firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    onSnapshot,
    addDoc,
    deleteDoc
   
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* ===========================================================
   DOM ELEMENTS
   =========================================================== */

const profileAvatar =
document.getElementById("profileAvatar");

const profileName =
document.getElementById("profileName");

const profileBranch =
document.getElementById("profileBranch");

const profileYear =
document.getElementById("profileYear");

const profileJoined =
document.getElementById("profileJoined");

const profileBio =
document.getElementById("profileBio");

const connectBtn =
document.getElementById("connectBtn");

const messageBtn =
document.getElementById("messageBtn");

const uploadsCount =
document.getElementById("uploadsCount");

const likesCount =
document.getElementById("likesCount");

const viewsCount =
document.getElementById("viewsCount");

const downloadsCount =
document.getElementById("downloadsCount");

const followersCount =
document.getElementById("followersCount");

const recentUploads =
document.getElementById("recentUploads");


/* ===========================================================
   GLOBAL VARIABLES
   =========================================================== */

let currentUser = null;

let profileUserId = null;

let profileUser = null;

let userNotes = [];


/* ===========================================================
   GET PROFILE USER ID
   =========================================================== */

const params =
new URLSearchParams(window.location.search);

profileUserId =
params.get("uid");

if(!profileUserId){

    alert("Invalid Profile");

    window.location.href="/main/index.html";

}


/* ===========================================================
   AUTH
   =========================================================== */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href=
            "/main/login.html";

            return;

        }

        currentUser=user;

        await initializeProfile();

    }

);


/* ===========================================================
   INITIALIZATION
   =========================================================== */

async function initializeProfile(){

    await loadUserProfile();

    await loadUserStatistics();

    preventSelfFollow();

    listenFollowersCount();

    checkFollowStatus();

}


/* ===========================================================
   LOAD USER PROFILE
   =========================================================== */

async function loadUserProfile(){

    try{

        const userRef=
        doc(
            db,
            "users",
            profileUserId
        );

        const userSnap=
        await getDoc(userRef);

        if(!userSnap.exists()){

            profileName.textContent=
            "User Not Found";

            return;

        }

        profileUser=
        userSnap.data();

        profileName.textContent=
        profileUser.name || "Anonymous";

        profileBranch.textContent=
        profileUser.branch || "-";

        profileYear.textContent=
        profileUser.year || "-";

        profileBio.textContent=
        profileUser.bio ||
        "This user hasn't added a bio yet.";

        generateAvatar(
            profileUser.name
        );

        formatJoinedDate(
            profileUser.createdAt
        );

    }

    catch(error){

        console.error(
            "Profile Error:",
            error
        );

    }

}


/* ===========================================================
   GENERATE AVATAR
   =========================================================== */

function generateAvatar(name){

    if(!name){

        profileAvatar.textContent="U";

        return;

    }

    profileAvatar.textContent=
    name
    .trim()
    .charAt(0)
    .toUpperCase();

}


/* ===========================================================
   FORMAT JOIN DATE
   =========================================================== */

function formatJoinedDate(timestamp){

    if(!timestamp){

        profileJoined.textContent="-";

        return;

    }

    const date=
    timestamp.toDate();

    profileJoined.textContent=
    date.toLocaleDateString(

        "en-US",

        {

            month:"long",

            year:"numeric"

        }

    );

}


/* ===========================================================
   LOAD USER STATISTICS
   =========================================================== */

async function loadUserStatistics(){

    try{

        const q=query(

            collection(db,"notes"),

            where("uploaderId","==",profileUserId),
            where("status","==","approved")

        );

        const snapshot=
        await getDocs(q);

        userNotes=[];

        let totalLikes=0;

        let totalViews=0;

        let totalDownloads=0;

        snapshot.forEach(doc=>{

            const note=doc.data();

            userNotes.push({

                id:doc.id,

                ...note

            });

            totalLikes+=
            note.likes || 0;

            totalViews+=
            note.views || 0;

            totalDownloads+=
            note.downloads || 0;

        });

        uploadsCount.textContent=
        userNotes.length;

        likesCount.textContent=
        totalLikes;

        viewsCount.textContent=
        totalViews;

        downloadsCount.textContent=
        totalDownloads;

        userNotes.sort(

            (a,b)=>{

                const first=
                a.uploadedAt?.seconds || 0;

                const second=
                b.uploadedAt?.seconds || 0;

                return second-first;

            }

        );

                renderRecentUploads();

    }

    catch(error){

        console.error(
            "Statistics Error:",
            error
        );

    }

}


/* ===========================================================
   RECENT UPLOADS
   =========================================================== */

function renderRecentUploads() {

    recentUploads.innerHTML = "";

    if (userNotes.length === 0) {

        recentUploads.innerHTML = `
            <div class="upload-empty">
                <div class="empty-icon">📄</div>
                <h3>No uploads yet</h3>
                <p>This user hasn't uploaded any notes yet.</p>
            </div>
        `;

        return;
    }

    const recent = userNotes.slice(0, 6);

    recent.forEach(note => {

        const row = document.createElement("div");

        row.className = "upload-row";

        row.innerHTML = `
            <div class="upload-info">
                <h3>${note.title}</h3>
                <span>${note.subject || "Unknown Subject"}</span>
            </div>

            <button class="details-btn">
                View Details
            </button>
        `;

        row.querySelector(".details-btn").addEventListener("click", (e) => {

            e.stopPropagation();

            window.location.href = `/main/Users/notes-details.html?id=${note.id}`;

        });

        row.addEventListener("click", () => {

            window.location.href = `/main/Users/notes-details.html?id=${note.id}`;

        });

        recentUploads.appendChild(row);

    });

}

/* ===========================================================
   FOLLOW SYSTEM
   =========================================================== */

async function checkFollowStatus(){

    if(currentUser.uid===profileUserId){

        return;

    }

    const q=query(

        collection(db,"follows"),

        where(
            "followerId",
            "==",
            currentUser.uid
        ),

        where(
            "followingId",
            "==",
            profileUserId
        )

    );

    const snapshot=
    await getDocs(q);

    if(snapshot.empty){

        connectBtn.textContent=
        "Connect";

        connectBtn.dataset.followId="";

    }

    else{

        connectBtn.textContent=
        "Disconnect";

        connectBtn.dataset.followId=
        snapshot.docs[0].id;

    }

}


/* ===========================================================
   CONNECT USER
   =========================================================== */

async function connectUser(){

    try{

        await addDoc(

            collection(db,"follows"),

            {

                followerId:
                currentUser.uid,

                followingId:
                profileUserId,

                createdAt:
                new Date()

            }

        );

    }

    catch(error){

        console.error(
            "Connect Error:",
            error
        );

    }

}


/* ===========================================================
   DISCONNECT USER
   =========================================================== */

async function disconnectUser(id){

    try{

        await deleteDoc(

            doc(
                db,
                "follows",
                id
            )

        );

    }

    catch(error){

        console.error(
            "Disconnect Error:",
            error
        );

    }

}


/* ===========================================================
   CONNECT BUTTON
   =========================================================== */

connectBtn.addEventListener(

    "click",

    async()=>{

        connectBtn.disabled=true;

        const followId=
        connectBtn.dataset.followId;

        if(followId){

            await disconnectUser(
                followId
            );

        }

        else{

            await connectUser();

        }

        await checkFollowStatus();

        connectBtn.disabled=false;

    }

);


/* ===========================================================
   REALTIME FOLLOWERS
   =========================================================== */

function listenFollowersCount(){

    const q=query(

        collection(db,"follows"),

        where(
            "followingId",
            "==",
            profileUserId
        )

    );

    onSnapshot(

        q,

        snapshot=>{

            followersCount.textContent=
            snapshot.size;

        }

    );

}


/* ===========================================================
   PREVENT SELF FOLLOW
   =========================================================== */

function preventSelfFollow(){

    if(currentUser.uid===profileUserId){

        connectBtn.style.display="none";

        messageBtn.style.display="none";

    }

}

/* ===========================================================
   MESSAGE BUTTON
   =========================================================== */

messageBtn.addEventListener(

    "click",

    ()=>{

        if(currentUser.uid===profileUserId){

            return;

        }

        window.location.href=
        `/main/chat.html?uid=${profileUserId}`;

    }

);


/* ===========================================================
   REFRESH FOLLOW BUTTON
   =========================================================== */

async function refreshFollowButton(){

    try{

        await checkFollowStatus();

    }

    catch(error){

        console.error(error);

    }

}


/* ===========================================================
   FORMAT LARGE NUMBERS
   =========================================================== */

function formatNumber(number){

    if(number>=1000000){

        return (
            number/1000000
        ).toFixed(1)+"M";

    }

    if(number>=1000){

        return (
            number/1000
        ).toFixed(1)+"K";

    }

    return number;

}


/* ===========================================================
   OPTIONAL NUMBER FORMATTING
   =========================================================== */

// Uncomment if you want 1200 → 1.2K

/*
uploadsCount.textContent =
formatNumber(Number(uploadsCount.textContent));

likesCount.textContent =
formatNumber(Number(likesCount.textContent));

viewsCount.textContent =
formatNumber(Number(viewsCount.textContent));

downloadsCount.textContent =
formatNumber(Number(downloadsCount.textContent));

followersCount.textContent =
formatNumber(Number(followersCount.textContent));
*/


/* ===========================================================
   WINDOW ERROR HANDLER
   =========================================================== */

window.addEventListener(

    "error",

    (event)=>{

        console.error(

            "Profile JS Error:",

            event.error

        );

    }

);


/* ===========================================================
   DEBUG (REMOVE LATER)
   =========================================================== */

console.log("================================");
console.log("EngiNotes User Profile Loaded");
console.log("Profile UID:", profileUserId);
console.log("================================");