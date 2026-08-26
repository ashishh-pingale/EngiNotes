import { auth } from "./firebase.js";

import {
    sendEmailVerification,
    reload,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================================
// Elements
// =========================================

const userEmail = document.getElementById("userEmail");

const statusMessage =
    document.getElementById("statusMessage");

const checkVerificationBtn =
    document.getElementById("checkVerificationBtn");

const resendBtn =
    document.getElementById("resendBtn");


// =========================================
// Current User
// =========================================

let currentUser = null;


// =========================================
// Wait For Firebase Auth
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        currentUser = null;

        userEmail.textContent =
            "your@email.com";

        showStatus(
            "No account is currently waiting for verification.",
            "error"
        );

        checkVerificationBtn.disabled = true;
        resendBtn.disabled = true;

        return;
    }


    // =========================================
    // User Found
    // =========================================

    currentUser = user;

    userEmail.textContent =
        user.email;


    checkVerificationBtn.disabled = false;
    resendBtn.disabled = false;


    // =========================================
    // Check If Already Verified
    // =========================================

    try {

        await reload(currentUser);


        if (currentUser.emailVerified) {

            showStatus(
                "Your email has already been verified.",
                "success"
            );

            setTimeout(() => {

                window.location.replace(
                    "/main/browse.html"
                );

            }, 1000);

        } else {

            showStatus(
                "Verification email sent successfully.",
                "success"
            );

        }

    } catch (error) {

        console.error(
            "Initial verification check failed:",
            error
        );

    }

});


// =========================================
// CHECK VERIFICATION BUTTON
// =========================================

checkVerificationBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            showStatus(
                "Please sign in again to continue.",
                "error"
            );

            return;
        }


        try {

            checkVerificationBtn.disabled = true;

            checkVerificationBtn.textContent =
                "Checking...";


            // Refresh Firebase user
            await reload(currentUser);


            if (currentUser.emailVerified) {

                showStatus(
                    "Email verified successfully! Redirecting...",
                    "success"
                );


                setTimeout(() => {

                    window.location.replace(
                        "/main/browse.html"
                    );

                }, 1000);


            } else {

                showStatus(
                    "Your email hasn't been verified yet. Please check your inbox.",
                    "warning"
                );

                checkVerificationBtn.disabled = false;

                checkVerificationBtn.textContent =
                    "I've Verified My Email";

            }

        } catch (error) {

            console.error(
                "Verification check error:",
                error
            );


            showStatus(
                "Unable to check verification status. Please try again.",
                "error"
            );


            checkVerificationBtn.disabled = false;

            checkVerificationBtn.textContent =
                "I've Verified My Email";

        }

    }
);


// =========================================
// RESEND VERIFICATION EMAIL
// =========================================

resendBtn.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            showStatus(
                "Please sign in again to resend the verification email.",
                "error"
            );

            return;
        }


        try {

            resendBtn.disabled = true;

            resendBtn.textContent =
                "Sending...";


            await sendEmailVerification(
                currentUser
            );


            showStatus(
                "A new verification email has been sent.",
                "success"
            );


            startResendCooldown();


        } catch (error) {

            console.error(
                "Resend verification error:",
                error
            );


            if (
                error.code ===
                "auth/too-many-requests"
            ) {

                showStatus(
                    "Too many requests. Please wait before trying again.",
                    "warning"
                );

            } else {

                showStatus(
                    "Unable to send the verification email. Please try again.",
                    "error"
                );

            }


            resendBtn.disabled = false;

            resendBtn.textContent =
                "Resend Verification Email";

        }

    }
);


// =========================================
// RESEND COOLDOWN
// =========================================

function startResendCooldown() {

    let seconds = 60;


    resendBtn.textContent =
        `Resend Email (${seconds}s)`;


    const interval = setInterval(() => {

        seconds--;


        resendBtn.textContent =
            `Resend Email (${seconds}s)`;


        if (seconds <= 0) {

            clearInterval(interval);


            resendBtn.disabled = false;

            resendBtn.textContent =
                "Resend Verification Email";

        }

    }, 1000);

}


// =========================================
// STATUS MESSAGE
// =========================================

function showStatus(message, type) {

    statusMessage.textContent =
        message;


    if (type === "success") {

        statusMessage.style.background =
            "#f0fdf4";

        statusMessage.style.borderColor =
            "#bbf7d0";

        statusMessage.style.color =
            "#15803d";

    }

    else if (type === "warning") {

        statusMessage.style.background =
            "#fffbeb";

        statusMessage.style.borderColor =
            "#fde68a";

        statusMessage.style.color =
            "#b45309";

    }

    else {

        statusMessage.style.background =
            "#fef2f2";

        statusMessage.style.borderColor =
            "#fecaca";

        statusMessage.style.color =
            "#dc2626";

    }

}