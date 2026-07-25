import { auth } from "../js/firebase.js";
import { 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Toggle Password Visibility
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Show' : 'Hide';
});

// Handle Login
const loginForm = document.querySelector('#loginForm');
const errorBox = document.querySelector('#error-box');

errorBox.style.display = 'none';

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);

        // Login successful
        window.location.href = "browse.html";

    } catch (error) {
        errorBox.style.display = 'block';
        errorBox.textContent = "Invalid email or password. Please try again.";
    }
});
