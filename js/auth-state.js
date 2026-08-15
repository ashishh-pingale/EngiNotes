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


// ============================================
// DOM
// ============================================

const notificationBtn =
    document.getElementById("notificationBtn");

const notificationDropdown =
    document.getElementById("notificationDropdown");

const notificationList =
    document.getElementById("notificationList");

const notificationBadge =
    document.getElementById("notificationBadge");

const authSection =
    document.getElementById("authSection");

const adminLink =
    document.getElementById("adminLink");


// ============================================
// PROTECTED ROUTES
// ============================================

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


// ============================================
// ADMIN CHECK
// ============================================

async function checkAdminAccess(uid) {

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        const userSnap =
            await getDoc(userRef);


        if (!userSnap.exists()) {

            return false;

        }


        const userData =
            userSnap.data();


        return userData.role === "admin";

    }

    catch (error) {

        console.error(
            "Admin Check Failed:",
            error
        );

        return false;

    }

}


// ============================================
// NOTIFICATION ICON
// ============================================

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


// ============================================
// RELATIVE TIME
// ============================================

function getRelativeTime(timestamp) {

    if (!timestamp) {

        return "";

    }


    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);


    const now =
        new Date();


    const seconds =
        Math.floor(
            (now - date) / 1000
        );


    if (seconds < 60) {

        return "just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes} min ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours} hr ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days === 1) {

        return "yesterday";

    }


    if (days < 7) {

        return `${days} days ago`;

    }


    return date.toLocaleDateString();

}


// ============================================
// AUTHENTICATION STATE
// ============================================

onAuthStateChanged(
    auth,
    async (user) => {


        // ========================================
        // USER NOT LOGGED IN
        // ========================================

        if (!user) {


            // Always hide admin link
            // when nobody is logged in

            if (adminLink) {

                adminLink.classList.add(
                    "hidden"
                );

            }


            // Protected pages

            if (
                isProtectedPage ||
                isAdminPage
            ) {

                window.location.replace(
                    "/main/login.html"
                );

                return;

            }


            // Logged-out navbar

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


        // ========================================
        // CHECK ADMIN ROLE
        // ========================================

        const isAdmin =
            await checkAdminAccess(
                user.uid
            );


        // ========================================
        // ADMIN NAVBAR VISIBILITY
        // ========================================

        if (adminLink) {

            if (isAdmin) {

                adminLink.classList.remove(
                    "hidden"
                );

            }
            else {

                adminLink.classList.add(
                    "hidden"
                );

            }

        }


        // ========================================
        // ADMIN PAGE PROTECTION
        // ========================================

        if (isAdminPage) {

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


        // ========================================
        // NOTIFICATIONS
        // ========================================

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


                    // ==================================
                    // UNREAD COUNT
                    // ==================================

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


                    // ==================================
                    // EMPTY STATE
                    // ==================================

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


                    // ==================================
                    // NOTIFICATION LIST
                    // ==================================

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

                                    data-notification-type="${notification.type}"

                                    data-related-id="${notification.relatedId || ""}"
                                >

                                    <div
                                        class="notification-icon"
                                    >

                                        ${getNotificationIcon(
                                            notification.type
                                        )}

                                    </div>


                                    <div
                                        class="notification-content"
                                    >

                                        <div
                                            class="
                                                notification-message
                                            "
                                        >

                                            ${
                                                notification.message
                                            }

                                        </div>


                                        <div
                                            class="
                                                notification-time
                                            "
                                        >

                                            ${
                                                getRelativeTime(
                                                    notification.createdAt
                                                )
                                            }

                                        </div>

                                    </div>

                                </div>

                            `
                            )
                            .join("");


                    // ==================================
                    // NOTIFICATION CLICK
                    // ==================================

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


                                    const notificationType =
                                        item.dataset
                                            .notificationType;


                                    const relatedId =
                                        item.dataset
                                            .relatedId
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


                                    // LIKE

                                    if (
                                        notificationType === "like" &&
                                        relatedId
                                    ) {

                                        window.location.href =
                                            `/main/browse.html?note=${relatedId}`;

                                        return;

                                    }


                                    // CONNECT

                                    if (
                                        notificationType === "connect" &&
                                        relatedId
                                    ) {

                                        window.location.href =
                                            `/main/Users/user_profile.html?uid=${relatedId}`;

                                        return;

                                    }


                                    // MESSAGE

                                    if (
                                        notificationType === "message" &&
                                        relatedId
                                    ) {

                                        window.location.href =
                                            `/main/chat.html?uid=${relatedId}`;

                                        return;

                                    }

                                }
                            );

                        });

                },

                (error) => {

                    console.error(
                        "Notification Listener Error:",
                        error
                    );

                }

            );

        }


        // ========================================
        // PAGES WITHOUT NAVBAR
        // ========================================

        if (!authSection) {

            return;

        }


        // ========================================
        // LOGGED-IN NAVBAR
        // ========================================

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


        // ========================================
        // PROFILE
        // ========================================

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


        // ========================================
        // LOGOUT
        // ========================================

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async () => {

                    try {

                        await signOut(
                            auth
                        );

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


// ============================================
// NOTIFICATION DROPDOWN
// ============================================

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