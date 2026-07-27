console.log("auth-state loaded");

import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ========================================
// DOM Elements
// ========================================

const authSection = document.getElementById("authSection");

// ========================================
// Protected Pages
// ========================================

const protectedPages = [
    "/main/upload.html",
    "/main/chat.html"
    // Add more pages here later
    // "/main/admin.html",
    // "/main/Users/user_profile.html"
];

const isProtectedPage = protectedPages.some(page =>
    window.location.pathname.endsWith(page)
);

// ========================================
// Authentication State
// ========================================

onAuthStateChanged(auth, (user) => {

    // Redirect unauthenticated users from protected pages
    if (!user && isProtectedPage) {
        window.location.href = "/main/login.html";
        return;
    }

    // If navbar doesn't exist on this page, stop here
    if (!authSection) return;

    // ========================================
    // Logged In
    // ========================================

    if (user) {

        authSection.innerHTML = `
            <div class="nav-profile">
                <button id="profileBtn" class="btn-secondary">
                    My Profile
                </button>

                <button id="logoutBtn" class="btn-primary">
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

                    window.location.href = "/main/index.html";

                } catch (error) {

                    console.error("Logout Failed:", error);

                }

            });

    }

    // ========================================
    // Logged Out
    // ========================================

    else {

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

});