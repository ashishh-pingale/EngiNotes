import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================
   Navbar
============================================ */

const authSection = document.getElementById("authSection");

/* ============================================
   Protected Routes
============================================ */

const protectedPages = [
    "/main/upload.html",
    "/main/chat.html"
];

const adminPages = [
    "/admin/html/admin.html"
];

const currentPath = window.location.pathname;

const isProtectedPage = protectedPages.some(page =>
    currentPath.endsWith(page)
);

const isAdminPage = adminPages.some(page =>
    currentPath.endsWith(page)
);

/* ============================================
   Admin Check
============================================ */

async function checkAdminAccess(uid) {

    try {

        const userRef = doc(db, "users", uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return false;
        }

        return userSnap.data().role === "admin";

    }

    catch (error) {

        console.error("Admin Check Failed:", error);

        return false;

    }

}

/* ============================================
   Authentication State
============================================ */

onAuthStateChanged(auth, async (user) => {

    /* -------------------------
       User NOT Logged In
    -------------------------- */

    if (!user) {

        if (isProtectedPage || isAdminPage) {

            window.location.replace("/main/login.html");
            return;

        }

        if (authSection) {

            authSection.innerHTML = `
                <button id="loginBtn" class="btn-secondary">
                    Sign In
                </button>

                <button id="signupBtn" class="btn-primary">
                    Sign Up
                </button>
            `;

            document
                .getElementById("loginBtn")
                .addEventListener("click", () => {

                    window.location.href = "/main/login.html";

                });

            document
                .getElementById("signupBtn")
                .addEventListener("click", () => {

                    window.location.href = "/main/sign-up.html";

                });

        }

        return;

    }

    /* -------------------------
       Admin Route Protection
    -------------------------- */

    if (isAdminPage) {

        const isAdmin = await checkAdminAccess(user.uid);

        if (!isAdmin) {

            alert("Access Denied!");

            window.location.replace("/main/index.html");

            return;

        }

    }

    /* -------------------------
       Pages without Navbar
    -------------------------- */

    if (!authSection) return;

    /* -------------------------
       Logged In Navbar
    -------------------------- */

    authSection.innerHTML = `
        <div class="nav-profile">

            <button
                id="profileBtn"
                class="btn-secondary">

                My Profile

            </button>

            <button
                id="logoutBtn"
                class="btn-primary">

                Logout

            </button>

        </div>
    `;

    document
        .getElementById("profileBtn")
        .addEventListener("click", () => {

            window.location.href =
                `/main/Users/user_profile.html?uid=${user.uid}`;

        });

    document
        .getElementById("logoutBtn")
        .addEventListener("click", async () => {

            try {

                await signOut(auth);

                window.location.replace("/main/login.html");

            }

            catch (error) {

                console.error(error);

            }

        });

});