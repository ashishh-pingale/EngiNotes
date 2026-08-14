import { db, auth } from "../../js/firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =============================================
// DOM
// =============================================

const profileForm =
    document.getElementById("profileForm");

const nameInput =
    document.getElementById("profileNameInput");

const branchInput =
    document.getElementById("profileBranchInput");

const yearInput =
    document.getElementById("profileYearInput");

const bioInput =
    document.getElementById("profileBioInput");

const bioCount =
    document.getElementById("bioCount");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const formMessage =
    document.getElementById("formMessage");


// =============================================
// AUTH
// =============================================

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "/login.html";

        return;

    }

    currentUser = user;

    await loadProfile();

});


// =============================================
// LOAD PROFILE
// =============================================

async function loadProfile() {

    try {

        const userRef =
            doc(db, "users", currentUser.uid);

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {

            formMessage.textContent =
                "Profile not found.";

            formMessage.className =
                "form-message error";

            return;

        }

        const data =
            userSnap.data();


        nameInput.value =
            data.name || "";

        branchInput.value =
            data.branch || "";

        yearInput.value =
            data.year || "";

        bioInput.value =
            data.bio || "";


        updateBioCount();

    }

    catch (error) {

        console.error(
            "Error loading profile:",
            error
        );

        formMessage.textContent =
            "Unable to load your profile.";

        formMessage.className =
            "form-message error";

    }

}


// =============================================
// BIO CHARACTER COUNT
// =============================================

function updateBioCount() {

    bioCount.textContent =
        bioInput.value.length;

}

bioInput.addEventListener(
    "input",
    updateBioCount
);


// =============================================
// SAVE PROFILE
// =============================================

profileForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) {

            return;

        }


        const name =
            nameInput.value.trim();

        const branch =
            branchInput.value;

        const year =
            yearInput.value;

        const bio =
            bioInput.value.trim();


        // Basic validation

        if (!name) {

            formMessage.textContent =
                "Please enter your name.";

            formMessage.className =
                "form-message error";

            return;

        }


        saveProfileBtn.disabled = true;

        saveProfileBtn.textContent =
            "Saving...";


        try {

            const userRef =
                doc(
                    db,
                    "users",
                    currentUser.uid
                );


            await updateDoc(
                userRef,
                {

                    name: name,

                    branch: branch,

                    year: year,

                    bio: bio

                }
            );


            formMessage.textContent =
                "Profile updated successfully!";

            formMessage.className =
                "form-message success";


            saveProfileBtn.textContent =
                "Saved ✓";


            setTimeout(() => {

                window.location.href =
                    `/main/Users/user_profile.html?uid=${currentUser.uid}`;

            }, 1000);

        }

        catch (error) {

            console.error(
                "Error updating profile:",
                error
            );

            formMessage.textContent =
                "Unable to update profile. Please try again.";

            formMessage.className =
                "form-message error";

            saveProfileBtn.disabled =
                false;

            saveProfileBtn.textContent =
                "Save Changes";

        }

    }
);