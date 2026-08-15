import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ============================================
   DOM
============================================ */

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationDropdown =
    document.getElementById("notificationDropdown");

const notificationList =
    document.getElementById("notificationList");

const notificationBadge =
    document.getElementById("notificationBadge");


/* ============================================
   Navbar
============================================ */

const authSection =
    document.getElementById("authSection");


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

const currentPath =
    window.location.pathname;

const isProtectedPage =
    protectedPages.some(page =>
        currentPath.endsWith(page)
    );

const isAdminPage =
    adminPages.some(page =>
        currentPath.endsWith(page)
    );


/* ============================================
   Admin Check
============================================ */

async function checkAdminAccess(uid) {

    try {

        const userRef =
            doc(db, "users", uid);

        const userSnap =
            await getDoc(userRef);

        if (!userSnap.exists()) {

            return false;

        }

        return userSnap.data().role === "admin";

    }

    catch (error) {

        console.error(
            "Admin Check Failed:",
            error
        );

        return false;

    }

}

function getNotificationIcon(type) {

    switch (type) {

        case "like":
            return "❤️";

        case "connect":
            return "👤";

        case "message":
            return "💬";

        default:
            return "🔔";

    }

}


function getRelativeTime(timestamp) {

    if (!timestamp) {
        return "";
    }

    const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    const now = new Date();

    const seconds =
        Math.floor(
            (now - date) / 1000
        );

    if (seconds < 60) {
        return "just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    const days =
        Math.floor(hours / 24);

    if (days === 1) {
        return "yesterday";
    }

    if (days < 7) {
        return `${days} days ago`;
    }

    return date.toLocaleDateString();

}
/* ============================================
   Authentication State
============================================ */

onAuthStateChanged(
    auth,
    async (user) => {


        /* ========================================
           USER NOT LOGGED IN
        ======================================== */

        if (!user) {

            if (
                isProtectedPage ||
                isAdminPage
            ) {

                window.location.replace(
                    "/main/login.html"
                );

                return;

            }


            if (authSection) {

                authSection.innerHTML = `

                    <button
                        id="loginBtn"
                        class="btn-secondary"
                    >
                        Sign In
                    </button>

                    <button
                        id="signupBtn"
                        class="btn-primary"
                    >
                        Sign Up
                    </button>

                `;


                const loginBtn =
                    document.getElementById(
                        "loginBtn"
                    );

                const signupBtn =
                    document.getElementById(
                        "signupBtn"
                    );


                if (loginBtn) {

                    loginBtn.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                "/main/login.html";

                        }
                    );

                }


                if (signupBtn) {

                    signupBtn.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                "/main/sign-up.html";

                        }
                    );

                }

            }

            return;

        }


        /* ========================================
           NOTIFICATIONS
        ======================================== */

        if (
            notificationBtn &&
            notificationDropdown &&
            notificationList &&
            notificationBadge
        ) {

            const notificationsQuery =
                query(

                    collection(
                        db,
                        "notifications"
                    ),

                    where(
                        "recipientId",
                        "==",
                        user.uid
                    ),

                    orderBy(
                        "createdAt",
                        "desc"
                    )

                );


            onSnapshot(

                notificationsQuery,

                (snapshot) => {

                    const notifications =
                        snapshot.docs.map(
                            docSnap => ({

                                id:
                                    docSnap.id,

                                ...docSnap.data()

                            })
                        );


                    /* -------------------------
                       UNREAD COUNT
                    -------------------------- */

                    const unreadCount =
                        notifications.filter(
                            notification =>
                                !notification.read
                        ).length;


                    if (
                        unreadCount > 0
                    ) {

                        notificationBadge.textContent =
                            unreadCount > 99
                                ? "99+"
                                : unreadCount;

                        notificationBadge.classList.remove(
                            "hidden"
                        );

                    }
                    else {

                        notificationBadge.classList.add(
                            "hidden"
                        );

                    }


                    /* -------------------------
                       EMPTY STATE
                    -------------------------- */

                    if (
                        notifications.length === 0
                    ) {

                        notificationList.innerHTML = `

                            <p
                                class="
                                    notification-empty
                                "
                            >
                                No notifications yet.
                            </p>

                        `;

                        return;

                    }


                    /* -------------------------
                       NOTIFICATION LIST
                    -------------------------- */

                   notificationList.innerHTML =
    notifications
        .map(
            notification => `

                <div
                    class="
                        notification-item
                        ${
                            notification.read
                                ? ""
                                : "unread"
                        }
                    "
                    data-notification-id="${notification.id}"
                >

                    <div class="notification-icon">

                        ${getNotificationIcon(
                            notification.type
                        )}

                    </div>


                    <div class="notification-content">

                        <div
                            class="
                                notification-message
                            "
                        >
                            ${notification.message}
                        </div>


                        <div
                            class="
                                notification-time
                            "
                        >
                            ${getRelativeTime(
                                notification.createdAt
                            )}
                        </div>

                    </div>

                </div>

            `
        )
        .join("");


                    /* -------------------------
                       MARK AS READ
                    -------------------------- */

                    const notificationItems =
                        notificationList.querySelectorAll(
                            ".notification-item"
                        );


                    notificationItems.forEach(
                        item => {

                            item.addEventListener(
                                "click",
                                async () => {

                                    const notificationId =
                                        item.dataset
                                            .notificationId
                                            ?.trim();


                                    if (
                                        !notificationId
                                    ) {

                                        return;

                                    }


                                    try {

                                        await updateDoc(

                                            doc(
                                                db,
                                                "notifications",
                                                notificationId
                                            ),

                                            {
                                                read: true
                                            }

                                        );

                                    }

                                    catch (error) {

                                        console.error(
                                            "Failed to mark notification as read:",
                                            error
                                        );

                                    }

                                }
                            );

                        }
                    );

                },

                (error) => {

                    console.error(
                        "Notification Listener Error:",
                        error
                    );

                }

            );

        }


        /* ========================================
           ADMIN ROUTE PROTECTION
        ======================================== */

        if (isAdminPage) {

            const isAdmin =
                await checkAdminAccess(
                    user.uid
                );


            if (!isAdmin) {

                alert(
                    "Access Denied!"
                );

                window.location.replace(
                    "/main/index.html"
                );

                return;

            }

        }


        /* ========================================
           PAGES WITHOUT NAVBAR
        ======================================== */

        if (!authSection) {

            return;

        }


        /* ========================================
           LOGGED IN NAVBAR
        ======================================== */

        authSection.innerHTML = `

            <div class="nav-profile">

                <button
                    id="profileBtn"
                    class="btn-secondary"
                >
                    My Profile
                </button>

                <button
                    id="logoutBtn"
                    class="btn-primary"
                >
                    Logout
                </button>

            </div>

        `;


        /* -------------------------
           PROFILE BUTTON
        -------------------------- */

        const profileBtn =
            document.getElementById(
                "profileBtn"
            );


        if (profileBtn) {

            profileBtn.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `/main/Users/user_profile.html?uid=${user.uid}`;

                }
            );

        }


        /* -------------------------
           LOGOUT BUTTON
        -------------------------- */

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async () => {

                    try {

                        await signOut(auth);

                        window.location.replace(
                            "/main/login.html"
                        );

                    }

                    catch (error) {

                        console.error(
                            "Logout failed:",
                            error
                        );

                    }

                }
            );

        }

    }
);


/* ============================================
   NOTIFICATION DROPDOWN
============================================ */

if (
    notificationBtn &&
    notificationDropdown
) {

    notificationBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationDropdown.classList.toggle(
                "show"
            );

        }
    );


    notificationDropdown.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

        }
    );


    document.addEventListener(
        "click",
        () => {

            notificationDropdown.classList.remove(
                "show"
            );

        }
    );

}