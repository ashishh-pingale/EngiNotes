import { auth, db } from "../js/firebase.js";
import { 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
    doc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const form = document.getElementById("signupForm");
const errorBox = document.getElementById("error-box");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const branch = document.getElementById("branch").value;
    const year = document.getElementById("year").value;

    errorBox.style.display = "none";

    // Password match validation
    if (password !== confirmPassword) {
        errorBox.style.display = "block";
        errorBox.textContent = "Passwords do not match.";
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store extra profile data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            branch: branch || "",
            year: year || "",
            role: "student",
            createdAt: new Date()
        });

        // Redirect after signup
        window.location.href = "browse.html";

    } catch (error) {
        errorBox.style.display = "block";
        errorBox.textContent = error.message;
    }
});
