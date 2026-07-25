console.log("auth-state loaded");
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authSection = document.getElementById("authSection");

onAuthStateChanged(auth, (user) => {

    if (!authSection) return;

    if (user) {

        // ✅ define INSIDE block
        const userId = user.uid;

        authSection.innerHTML = `
            <div class="nav-profile">
                <button id="profileBtn" class="btn-secondary">My Profile</button>
                <button id="logoutBtn" class="btn-primary">Logout</button>
            </div>
        `;

        // ✅ attach events AFTER HTML render
        document.getElementById("profileBtn").addEventListener("click", () => {
            console.log("Redirecting to:", userId);
            window.location.href = `/main/Users/user_profile.html?uid=${userId}`;
        });

        document.getElementById("logoutBtn").addEventListener("click", async () => {
            await signOut(auth);
            window.location.href = "index.html";
        });

    } else {

        authSection.innerHTML = `
            <button class="btn-secondary" onclick="window.location.href='login.html'">Sign In</button>
            <button class="btn-primary" onclick="window.location.href='sign-up.html'">Sign Up</button>
        `;
    }

});