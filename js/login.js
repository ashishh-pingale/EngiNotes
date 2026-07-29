import { auth, db } from "../js/firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================
   Password Toggle
============================================ */

const togglePassword = document.querySelector("#togglePassword");
const passwordInput = document.querySelector("#password");

togglePassword.addEventListener("click", () => {

    const type =
        passwordInput.type === "password"
            ? "text"
            : "password";

    passwordInput.type = type;

    togglePassword.textContent =
        type === "password"
            ? "Show"
            : "Hide";

});

/* ============================================
   Login
============================================ */

const loginForm = document.querySelector("#loginForm");
const errorBox = document.querySelector("#error-box");

errorBox.style.display = "none";

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.querySelector("#email").value.trim();

    const password =
        document.querySelector("#password").value;

    errorBox.style.display = "none";

    try {

        // Login User
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Get Firestore User Document
        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            errorBox.style.display = "block";

            errorBox.textContent =
                "User profile not found.";

            return;

        }

        const userData = userSnap.data();

        /* -------------------------
           Redirect Based On Role
        -------------------------- */

        if (userData.role === "admin") {

            window.location.replace("/admin/html/admin.html");

        }

        else {

            window.location.replace("/main/browse.html");

        }

    }

    catch (error) {

        console.error("Login Error:", error);

        errorBox.style.display = "block";

        switch (error.code) {

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
            case "auth/invalid-email":

                errorBox.textContent =
                    "Invalid email or password.";

                break;

            default:

                errorBox.textContent =
                    error.message;

        }

    }

});