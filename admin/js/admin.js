/* ===========================================
   ENGINOTES ADMIN PANEL
   PART 1C
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       Sidebar Toggle
    ========================== */

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });
    }

    /* ==========================
       Close Sidebar (Mobile)
    ========================== */

    document.addEventListener("click", (e) => {

        if (
            window.innerWidth <= 900 &&
            !sidebar.contains(e.target) &&
            !menuBtn.contains(e.target)
        ) {
            sidebar.classList.remove("show");
        }

    });

    /* ==========================
       Active Sidebar Menu
    ========================== */

/* ==========================
   Active Sidebar Menu
========================== */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item=>{

    item.addEventListener("click",function(){

        navItems.forEach(nav=>{
            nav.classList.remove("active");
        });

        this.classList.add("active");

    });

});

    /* ==========================
       Search
    ========================== */

    const searchInput = document.querySelector(".topbar-search input");

    if(searchInput){

        searchInput.addEventListener("keyup", function(){

            console.log("Searching :", this.value);

        });

    }

    /* ==========================
       Card Hover Animation
    ========================== */

    const cards = document.querySelectorAll(".stat-card");

    cards.forEach(card=>{

        card.addEventListener("mouseenter",()=>{

            card.style.transform="translateY(-8px)";
            card.style.transition=".25s";

        });

        card.addEventListener("mouseleave",()=>{

            card.style.transform="translateY(0px)";

        });

    });

    /* ==========================
       Quick Action Buttons
    ========================== */

    const quickBtns = document.querySelectorAll(".quick-actions button");

    quickBtns.forEach(btn=>{

        btn.addEventListener("click",()=>{

            alert(btn.innerText + " feature will be connected later.");

        });

    });

    /* ==========================
       Notification Button
    ========================== */

    const notifyBtn = document.querySelectorAll(".icon-btn")[0];

    if(notifyBtn){

        notifyBtn.addEventListener("click",()=>{

            alert("No new notifications.");

        });

    }

    /* ==========================
       Message Button
    ========================== */

    const messageBtn = document.querySelectorAll(".icon-btn")[1];

    if(messageBtn){

        messageBtn.addEventListener("click",()=>{

            alert("Inbox coming soon.");

        });

    }

    /* ==========================
       Logout
    ========================== */

    const logoutBtn = document.querySelector(".logout-btn");

    if(logoutBtn){

        logoutBtn.addEventListener("click",()=>{

            const confirmLogout = confirm("Logout from Admin Panel?");

            if(confirmLogout){

                // Later Firebase Logout

                window.location.href="index.html";

            }

        });

    }

    /* ==========================
       Counter Animation
    ========================== */

    const counters=document.querySelectorAll(".stat-card h2");

    counters.forEach(counter=>{

        const target=counter.innerText.replace(/\D/g,'');

        let current=0;

        const increment=Math.ceil(target/80);

        const timer=setInterval(()=>{

            current+=increment;

            if(current>=target){

                current=target;

                clearInterval(timer);

            }

            if(counter.innerText.includes("K")){

                counter.innerText=(current/1000).toFixed(0)+"K";

            }

            else{

                counter.innerText=current.toLocaleString();

            }

        },20);

    });

    /* ==================================================
   PART 2C
   Pending Notes Management
================================================== */

// Search Pending Notes
const pendingSearch = document.getElementById("pendingSearch");

if (pendingSearch) {

    pendingSearch.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".notes-table tbody tr").forEach(row => {

            const text = row.innerText.toLowerCase();

            row.style.display = text.includes(value) ? "" : "none";

        });

    });

}

// Branch Filter
const branchFilter = document.getElementById("branchFilter");

if (branchFilter) {

    branchFilter.addEventListener("change", filterPendingNotes);

}

// Year Filter
const yearFilter = document.getElementById("yearFilter");

if (yearFilter) {

    yearFilter.addEventListener("change", filterPendingNotes);

}

function filterPendingNotes() {

    const branch = branchFilter.value.toLowerCase();
    const year = yearFilter.value.toLowerCase();

    document.querySelectorAll(".notes-table tbody tr").forEach(row => {

        const cells = row.querySelectorAll("td");

        const rowBranch = cells[3].innerText.toLowerCase();
        const rowYear = cells[4].innerText.toLowerCase();

        let visible = true;

        if (branch && rowBranch !== branch)
            visible = false;

        if (year && rowYear !== year)
            visible = false;

        row.style.display = visible ? "" : "none";

    });

}

/* ============================================
   Approve
============================================ */

document.querySelectorAll(".approve").forEach(button => {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        const status = row.querySelector(".status");

        status.innerHTML = "Approved";
        status.className = "status approved";

        this.disabled = true;

        row.style.background = "#f0fff6";

    });

});

/* ============================================
   Reject
============================================ */

document.querySelectorAll(".reject").forEach(button => {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        const status = row.querySelector(".status");

        status.innerHTML = "Rejected";
        status.className = "status rejected";

        row.style.background = "#fff4f4";

    });

});

/* ============================================
   Delete
============================================ */

document.querySelectorAll(".delete").forEach(button => {

    button.addEventListener("click", function () {

showModal(
"Delete Note",
"Are you sure you want to delete this note?",
()=>{

const row=this.closest("tr");

row.style.opacity="0";

setTimeout(()=>{

row.remove();

},250);

showToast("Note deleted.");

}
);

        const row = this.closest("tr");

        row.style.opacity = "0";

        setTimeout(() => {

            row.remove();

        }, 250);

    });

});

/* ============================================
   Preview
============================================ */

document.querySelectorAll(".preview").forEach(button => {

    button.addEventListener("click", function () {

        const title =
            this.closest("tr").children[1].innerText;

        alert("Preview PDF:\n\n" + title);

    });

});

/* ============================================
   Select All
============================================ */

const selectAll =
    document.querySelector(".notes-table thead input");

if (selectAll) {

    selectAll.addEventListener("change", function () {

        document.querySelectorAll(
            ".notes-table tbody input[type='checkbox']"
        ).forEach(box => {

            box.checked = this.checked;

        });

    });

}

/* ============================================
   Refresh Button
============================================ */

const refreshBtn =
    document.querySelector(".primary-btn");

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        location.reload();

    });

}

/* ======================================================
                USER MANAGEMENT
====================================================== */

/* ==========================
   Search Users
========================== */

const userSearch = document.getElementById("userSearch");

if (userSearch) {

    userSearch.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".users-table tbody tr").forEach(row => {

            const text = row.innerText.toLowerCase();

            row.style.display = text.includes(value) ? "" : "none";

        });

    });

}

/* ==========================
   Role Filter
========================== */

const roleFilter = document.getElementById("roleFilter");

if (roleFilter) {

    roleFilter.addEventListener("change", function () {

        const role = this.value.toLowerCase();

        document.querySelectorAll(".users-table tbody tr").forEach(row => {

            const rowRole = row.children[2].innerText.toLowerCase();

            if (!role || rowRole === role) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    });

}

/* ==========================
   View Profile
========================== */

document.querySelectorAll(".view-user").forEach(btn => {

    btn.addEventListener("click", function () {

        const row = this.closest("tr");

        const name = row.querySelector("strong").innerText;
        const email = row.children[1].innerText;
        const role = row.children[2].innerText;
        const uploads = row.children[3].innerText;

        alert(
`User Profile

Name : ${name}

Email : ${email}

Role : ${role}

Uploads : ${uploads}`
        );

    });

});

/* ==========================
   Edit User
========================== */

document.querySelectorAll(".edit-user").forEach(btn => {

    btn.addEventListener("click", function () {

        const row = this.closest("tr");

        const currentName =
            row.querySelector("strong").innerText;

        const newName =
            prompt("Edit User Name", currentName);

        if (newName && newName.trim() !== "") {

            row.querySelector("strong").innerText = newName;

        }

    });

});

/* ==========================
   Ban / Unban
========================== */

document.querySelectorAll(".ban-user").forEach(btn => {

    btn.addEventListener("click", function () {

        const row = this.closest("tr");

        const status = row.querySelector(".status");

        if (status.innerText === "Active") {

            status.innerText = "Banned";
            status.className = "status rejected";

            this.innerText = "Unban";

        }

        else {

            status.innerText = "Active";
            status.className = "status approved";

            this.innerText = "Ban";

        }

    });

});

/* ==========================
   Delete User
========================== */

document.querySelectorAll(".delete-user").forEach(btn => {

    btn.addEventListener("click", function () {

        if (!confirm("Delete this user?"))
            return;

        const row = this.closest("tr");

        row.style.opacity = "0";

        setTimeout(() => {

            row.remove();

        }, 250);

    });

});

/* ==========================
   Add User
========================== */

const addUserBtn = document.getElementById("addUserBtn");

if (addUserBtn) {

    addUserBtn.addEventListener("click", () => {

        alert("User creation form will be added later.");

    });

}

/* ======================================================
                    ANALYTICS CHARTS
====================================================== */

if (typeof Chart !== "undefined") {

    /* ===========================
       Monthly Uploads
    =========================== */

    const uploadCanvas = document.getElementById("uploadChart");

    if (uploadCanvas) {

        const ctx = uploadCanvas.getContext("2d");

        new Chart(ctx, {

            type: "line",

            data: {

                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                ],

                datasets: [{

                    label: "Notes Uploaded",

                    data: [
                        120,
                        180,
                        220,
                        260,
                        340,
                        390,
                        450,
                        520,
                        610,
                        670,
                        720,
                        810
                    ],

                    borderColor: "#4f46e5",

                    backgroundColor: "rgba(79,70,229,.15)",

                    fill: true,

                    borderWidth: 3,

                    tension: .35,

                    pointRadius: 5,

                    pointHoverRadius: 7

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            stepSize: 100

                        }

                    }

                }

            }

        });

    }

    /* ===========================
       Branch Distribution
    =========================== */

    const branchCanvas = document.getElementById("branchChart");

    if (branchCanvas) {

        const ctx2 = branchCanvas.getContext("2d");

        new Chart(ctx2, {

            type: "pie",

            data: {

                labels: [

                    "Computer",

                    "IT",

                    "Mechanical",

                    "Civil",

                    "Electrical",

                    "ENTC"

                ],

                datasets: [{

                    data: [

                        38,

                        19,

                        14,

                        10,

                        11,

                        8

                    ],

                    backgroundColor: [

                        "#4f46e5",

                        "#06b6d4",

                        "#22c55e",

                        "#f59e0b",

                        "#ef4444",

                        "#8b5cf6"

                    ],

                    borderWidth: 0

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {

                            padding: 18,

                            boxWidth: 16

                        }

                    }

                }

            }

        });

    }

}

/* ======================================================
                APPROVED NOTES
====================================================== */

/* ==========================
   Search Notes
========================== */

const approvedSearch = document.getElementById("approvedSearch");

if (approvedSearch) {

    approvedSearch.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        document.querySelectorAll(".approved-table tbody tr").forEach(row => {

            row.style.display = row.innerText.toLowerCase().includes(value)
                ? ""
                : "none";

        });

    });

}

/* ==========================
   Branch Filter
========================== */

const approvedBranch = document.getElementById("approvedBranch");

if (approvedBranch) {

    approvedBranch.addEventListener("change", filterApprovedTable);

}

/* ==========================
   Year Filter
========================== */

const approvedYear = document.getElementById("approvedYear");

if (approvedYear) {

    approvedYear.addEventListener("change", filterApprovedTable);

}

/* ==========================
   Combined Filter
========================== */

function filterApprovedTable() {

    const branch = approvedBranch.value.toLowerCase();

    const year = approvedYear.value.toLowerCase();

    document.querySelectorAll(".approved-table tbody tr").forEach(row => {

        const rowBranch = row.children[2].innerText.toLowerCase();
        const rowYear = row.children[3].innerText.toLowerCase();

        const branchMatch = !branch || rowBranch === branch;
        const yearMatch = !year || rowYear === year;

        row.style.display =
            branchMatch && yearMatch
                ? ""
                : "none";

    });

}

/* ==========================
   Preview Note
========================== */

document.querySelectorAll(".preview-note").forEach(button => {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        const title = row.children[0].innerText;
        const subject = row.children[1].innerText;
        const branch = row.children[2].innerText;
        const year = row.children[3].innerText;
        const uploader = row.children[4].innerText;

        alert(
`Preview

Title : ${title}

Subject : ${subject}

Branch : ${branch}

Year : ${year}

Uploaded By : ${uploader}`
        );

    });

});

/* ==========================
   Edit Note
========================== */

document.querySelectorAll(".edit-note").forEach(button => {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        const currentTitle = row.children[0].innerText;

        const newTitle = prompt("Edit Note Title", currentTitle);

        if (newTitle && newTitle.trim() !== "") {

            row.children[0].innerText = newTitle;

        }

    });

});

/* ==========================
   Delete Note
========================== */

document.querySelectorAll(".delete-note").forEach(button => {

    button.addEventListener("click", function () {

        if (!confirm("Delete this note?")) return;

        const row = this.closest("tr");

        row.style.opacity = "0";

        setTimeout(() => {

            row.remove();

        }, 250);

    });

});

/* ==========================
   Add Note
========================== */

const addNoteBtn = document.getElementById("addNoteBtn");

if (addNoteBtn) {

    addNoteBtn.addEventListener("click", () => {

        alert("Add Note form will be connected later.");

    });

}

/* ======================================================
   REPORTS & ANNOUNCEMENTS
====================================================== */

// Send Announcement

const sendAnnouncement=document.getElementById("sendAnnouncement");
const clearAnnouncement=document.getElementById("clearAnnouncement");
const announcementTitle=document.getElementById("announcementTitle");
const announcementMessage=document.getElementById("announcementMessage");

if(sendAnnouncement){

sendAnnouncement.addEventListener("click",()=>{

const title=announcementTitle.value.trim();
const message=announcementMessage.value.trim();

if(!title||!message){

alert("Please fill all fields.");
return;

}

alert(`Announcement Sent Successfully

Title: ${title}`);

announcementTitle.value="";
announcementMessage.value="";

});

}

// Clear Announcement

if(clearAnnouncement){

clearAnnouncement.addEventListener("click",()=>{

announcementTitle.value="";
announcementMessage.value="";

});

}

// Resolve Report

document.querySelectorAll(".resolve-report").forEach(button=>{

button.addEventListener("click",function(){

const row=this.closest("tr");
const status=row.querySelector(".status");

status.innerText="Resolved";
status.className="status approved";

this.disabled=true;
this.innerText="Resolved";

const dismiss=row.querySelector(".dismiss-report");

dismiss.remove();

});

});

// Dismiss Report

document.querySelectorAll(".dismiss-report").forEach(button=>{

button.addEventListener("click",function(){

if(!confirm("Dismiss this report?")) return;

const row=this.closest("tr");

row.style.opacity="0";

setTimeout(()=>{

row.remove();

},250);

});

});

/* ======================================================
   SITE SETTINGS
====================================================== */

const saveSettingsBtn=document.getElementById("saveSettings");

if(saveSettingsBtn){

loadSettings();

saveSettingsBtn.addEventListener("click",saveSettings);

}

function saveSettings(){

const settings={

siteName:document.getElementById("siteName").value,
siteDescription:document.getElementById("siteDescription").value,
adminEmail:document.getElementById("adminEmail").value,

maintenance:document.getElementById("maintenanceMode").checked,
registration:document.getElementById("registrationToggle").checked,
uploads:document.getElementById("uploadToggle").checked,

maxUpload:document.getElementById("maxUpload").value,
allowedFiles:document.getElementById("allowedFiles").value

};

localStorage.setItem("adminSettings",JSON.stringify(settings));

showToast("Settings saved successfully.","success");

}

function loadSettings(){

const saved=localStorage.getItem("adminSettings");

if(!saved) return;

const settings=JSON.parse(saved);

document.getElementById("siteName").value=settings.siteName||"";
document.getElementById("siteDescription").value=settings.siteDescription||"";
document.getElementById("adminEmail").value=settings.adminEmail||"";

document.getElementById("maintenanceMode").checked=settings.maintenance;
document.getElementById("registrationToggle").checked=settings.registration;
document.getElementById("uploadToggle").checked=settings.uploads;

document.getElementById("maxUpload").value=settings.maxUpload;
document.getElementById("allowedFiles").value=settings.allowedFiles;

}

function showToast(message,type="success"){

const container=document.getElementById("toastContainer");

if(!container) return;

const toast=document.createElement("div");

toast.className=`toast ${type}`;

toast.textContent=message;

container.appendChild(toast);

setTimeout(()=>{

toast.style.opacity="0";
toast.style.transform="translateX(100%)";

setTimeout(()=>{

toast.remove();

},300);

},3000);

}

/* ======================================================
   ADMIN PROFILE
====================================================== */

const profileImage=document.getElementById("profileImage");
const profilePreview=document.getElementById("profilePreview");
const changeAvatar=document.getElementById("changeAvatar");
const saveProfile=document.getElementById("saveProfile");
const changePassword=document.getElementById("changePassword");

loadProfile();

// Profile Image

if(changeAvatar){

changeAvatar.addEventListener("click",()=>{

profileImage.click();

});

}

if(profileImage){

profileImage.addEventListener("change",e=>{

const file=e.target.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(){

profilePreview.src=reader.result;

};

reader.readAsDataURL(file);

});

}

// Save Profile

if(saveProfile){

saveProfile.addEventListener("click",()=>{

const profile={

name:document.getElementById("adminName").value,
email:document.getElementById("profileEmail").value,
image:profilePreview.src

};

localStorage.setItem("adminProfile",JSON.stringify(profile));

addActivity("Updated profile");

showToast("Profile updated successfully.");

});

}

function loadProfile(){

const profile=JSON.parse(localStorage.getItem("adminProfile"));

if(!profile) return;

document.getElementById("adminName").value=profile.name;
document.getElementById("profileEmail").value=profile.email;
profilePreview.src=profile.image;

}

// Change Password

if(changePassword){

changePassword.addEventListener("click",()=>{

const current=document.getElementById("currentPassword");
const password=document.getElementById("newPassword");
const confirm=document.getElementById("confirmPassword");

if(password.value.length<8){

showToast("Password must contain at least 8 characters.","error");

return;

}

if(password.value!==confirm.value){

showToast("Passwords do not match.","error");

return;

}

current.value="";
password.value="";
confirm.value="";

addActivity("Changed account password");

showToast("Password changed successfully.");

});

}

// Activity Timeline

function addActivity(text){

const list=document.querySelector(".activity-list");

if(!list) return;

const item=document.createElement("li");

item.innerHTML=`
<span class="activity-dot"></span>
${text}
<small>Just now</small>
`;

list.prepend(item);

while(list.children.length>6){

list.removeChild(list.lastElementChild);

}

}
/* ======================================================
   DARK MODE
====================================================== */

const themeToggle=document.getElementById("themeToggle");

loadTheme();

if(themeToggle){

themeToggle.addEventListener("click",()=>{

document.body.classList.toggle("dark");

const dark=document.body.classList.contains("dark");

localStorage.setItem("dashboardTheme",dark?"dark":"light");

updateThemeIcon();

});

}

function loadTheme(){

const theme=localStorage.getItem("dashboardTheme");

if(theme==="dark"){

document.body.classList.add("dark");

}

updateThemeIcon();

}

function updateThemeIcon(){

if(!themeToggle) return;

themeToggle.innerHTML=document.body.classList.contains("dark")
?'<i class="fa-solid fa-sun"></i>'
:'<i class="fa-solid fa-moon"></i>';

}
/* ======================================================
   CUSTOM MODAL
====================================================== */

const modal=document.getElementById("modalOverlay");
const modalTitle=document.getElementById("modalTitle");
const modalMessage=document.getElementById("modalMessage");
const modalClose=document.getElementById("modalClose");
const modalCancel=document.getElementById("modalCancel");
const modalConfirm=document.getElementById("modalConfirm");

let confirmCallback=null;

function showModal(title,message,callback){

modalTitle.textContent=title;
modalMessage.textContent=message;
confirmCallback=callback;

modal.classList.add("show");

}

function closeModal(){

modal.classList.remove("show");

confirmCallback=null;

}

modalClose.onclick=closeModal;
modalCancel.onclick=closeModal;

modal.onclick=e=>{

if(e.target===modal){

closeModal();

}

};

modalConfirm.onclick=()=>{

if(confirmCallback){

confirmCallback();

}

closeModal();

};

/* ======================================================
   GLOBAL SEARCH
====================================================== */

const globalSearch=document.getElementById("globalSearch");

if(globalSearch){

globalSearch.addEventListener("input",function(){

const value=this.value.toLowerCase();

document.querySelectorAll("tbody tr").forEach(row=>{

const text=row.innerText.toLowerCase();

row.style.display=text.includes(value)?"":"none";

});

});

}

/* ======================================================
   KEYBOARD SHORTCUTS
====================================================== */

document.addEventListener("keydown",e=>{

if(e.ctrlKey&&e.key.toLowerCase()==="k"){

e.preventDefault();

globalSearch?.focus();

}

if(e.key==="Escape"){

closeModal();

}

});

/* ======================================================
   NOTIFICATIONS
====================================================== */

const notificationBtn=document.getElementById("notificationBtn");
const notificationMenu=document.getElementById("notificationMenu");
const notificationCount=document.getElementById("notificationCount");
const markAllRead=document.getElementById("markAllRead");

if(notificationBtn){

notificationBtn.addEventListener("click",e=>{

e.stopPropagation();

notificationMenu.classList.toggle("show");

});

}

document.addEventListener("click",()=>{

notificationMenu?.classList.remove("show");

});

markAllRead?.addEventListener("click",()=>{

document.querySelectorAll(".notification-item").forEach(item=>{

item.classList.remove("unread");

});

notificationCount.textContent="0";

showToast("All notifications marked as read.");

});

document.querySelectorAll(".notification-item").forEach(item=>{

item.addEventListener("click",()=>{

item.classList.remove("unread");

const unread=document.querySelectorAll(".notification-item.unread").length;

notificationCount.textContent=unread;

});

});

const sections=document.querySelectorAll("section[id]");
const navLinks=document.querySelectorAll(".sidebar-nav .nav-item");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const sectionTop=section.offsetTop-120;

if(window.scrollY>=sectionTop){
current=section.getAttribute("id");
}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#"+current){
link.classList.add("active");
}

});

});

});//---------->>>>END POINT

