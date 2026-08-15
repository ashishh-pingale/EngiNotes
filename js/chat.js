import { db, auth } from "../js/firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    where,
    getDocs,
    getDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================================
// DOM ELEMENTS
// ======================================================

const messagesDiv =
    document.getElementById("messages");

const input =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const contactList =
    document.querySelector(".contact-list");

const usernameEl =
    document.querySelector(".username");

const backToChatsBtn =
    document.getElementById("backToChatsBtn");

const chatArea =
    document.querySelector(".chat-area");

const sidebar =
    document.querySelector(".sidebar");

const chatHeader =
    document.querySelector(".chat-header");

const chatInputArea =
    document.querySelector(".chat-input-area");

const chatEmptyState =
    document.getElementById("chatEmptyState");


// ======================================================
// URL PARAMETERS
// ======================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const notificationUserId =
    urlParams.get("uid");


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let currentUser = null;

let receiverId = null;

let unsubscribeMessages = null;

let currentUserName = "A user";


// ======================================================
// INITIAL CHAT STATE
// ======================================================

function showEmptyState() {

    // Show chat area
    if (chatArea) {
        chatArea.style.display = "flex";
    }

    // Hide chat header
    if (chatHeader) {
        chatHeader.style.display = "none";
    }

    // Hide message input
    if (chatInputArea) {
        chatInputArea.style.display = "none";
    }

    // Show empty state
    if (chatEmptyState) {
        chatEmptyState.style.display = "flex";
    }

}


// ======================================================
// SHOW SELECTED CHAT
// ======================================================

function showSelectedChat() {

    // Show chat area
    if (chatArea) {
        chatArea.style.display = "flex";
    }

    // Show header
    if (chatHeader) {
        chatHeader.style.display = "flex";
    }

    // Show input
    if (chatInputArea) {
        chatInputArea.style.display = "block";
    }

    // Hide empty state
    if (chatEmptyState) {
        chatEmptyState.style.display = "none";
    }

}


// ======================================================
// INITIAL UI
// ======================================================

showEmptyState();


// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser =
            user;


        try {

            const userSnap =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (userSnap.exists()) {

                currentUserName =
                    userSnap.data().name ||
                    "A user";

            }

        }

        catch (error) {

            console.error(
                "Failed to load current user:",
                error
            );

        }


        await loadConnectedUsers();

    }
);


// ======================================================
// BACK BUTTON
// ======================================================

if (backToChatsBtn) {

    backToChatsBtn.addEventListener(
        "click",
        () => {

            // Stop current listener
            if (unsubscribeMessages) {

                unsubscribeMessages();

                unsubscribeMessages =
                    null;

            }


            // Clear selected receiver
            receiverId = null;


            // Clear messages
            if (messagesDiv) {

                messagesDiv.innerHTML =
                    "";

            }


            // Remove active contact
            document
                .querySelectorAll(".contact")
                .forEach(
                    contact => {

                        contact.classList.remove(
                            "active"
                        );

                    }
                );


            // Reset username
            if (usernameEl) {

                usernameEl.textContent =
                    "Chat";

            }


            // Show sidebar
            if (sidebar) {

                sidebar.style.display =
                    "flex";

            }


            // Show empty state
            showEmptyState();

        }
    );

}


// ======================================================
// LOAD CONNECTED USERS
// ======================================================

async function loadConnectedUsers() {

    try {

        const q =
            query(
                collection(
                    db,
                    "follows"
                ),
                where(
                    "followerId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(q);


        contactList.innerHTML =
            "";


        for (
            const followDoc
            of snapshot.docs
        ) {

            const follow =
                followDoc.data();


            const targetId =
                follow.followingId;


            const userRef =
                doc(
                    db,
                    "users",
                    targetId
                );


            const userSnap =
                await getDoc(
                    userRef
                );


            if (
                !userSnap.exists()
            ) {

                continue;

            }


            const user =
                userSnap.data();


            // ==================================================
            // CONTACT CARD
            // ==================================================

            const div =
                document.createElement(
                    "div"
                );


            div.classList.add(
                "contact"
            );


            div.innerHTML = `

                <div class="avatar blue-gradient">

                    ${
                        user.name
                            ?.charAt(0)
                            .toUpperCase() ||
                        "U"
                    }

                </div>

                <div class="contact-info">

                    <div class="contact-name">

                        ${
                            user.name ||
                            "Unknown User"
                        }

                    </div>

                    <p class="last-msg">

                        Click to start chatting

                    </p>

                </div>

            `;


            // ==================================================
            // CONTACT CLICK
            // ==================================================

            div.addEventListener(
                "click",
                () => {

                    selectContact(
                        div,
                        targetId,
                        user
                    );

                }
            );


            // Append ONCE
            contactList.appendChild(
                div
            );


            // ==================================================
            // OPEN CHAT FROM NOTIFICATION
            // ==================================================

            if (
                notificationUserId &&
                notificationUserId === targetId
            ) {

                selectContact(
                    div,
                    targetId,
                    user
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Failed to load connected users:",
            error
        );

    }

}


// ======================================================
// SELECT CONTACT
// ======================================================

function selectContact(
    div,
    targetId,
    user
) {

    // Remove active state
    document
        .querySelectorAll(".contact")
        .forEach(
            contact => {

                contact.classList.remove(
                    "active"
                );

            }
        );


    // Set active
    div.classList.add(
        "active"
    );


    // Set receiver
    receiverId =
        targetId;


    // Update username
    if (usernameEl) {

        usernameEl.textContent =
            user.name ||
            "Chat";

    }


    // Show selected chat UI
    showSelectedChat();


    // Load messages
    loadMessages();

}


// ======================================================
// CREATE NOTIFICATION
// ======================================================

async function createNotification(
    recipientId,
    type,
    message,
    relatedId = null
) {

    try {

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                recipientId:
                    recipientId,

                senderId:
                    currentUser.uid,

                type:
                    type,

                message:
                    message,

                relatedId:
                    relatedId,

                read:
                    false,

                createdAt:
                    serverTimestamp()
            }
        );


        console.log(
            "Message notification created"
        );

    }

    catch (error) {

        console.error(
            "Notification Error:",
            error
        );

    }

}


// ======================================================
// SEND MESSAGE
// ======================================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        async () => {

            const text =
                input.value.trim();


            if (
                !text ||
                !receiverId ||
                !currentUser
            ) {

                return;

            }


            try {

                // ==========================================
                // SAVE MESSAGE
                // ==========================================

                await addDoc(
                    collection(
                        db,
                        "chats"
                    ),
                    {

                        senderId:
                            currentUser.uid,

                        receiverId:
                            receiverId,

                        message:
                            text,

                        timestamp:
                            serverTimestamp()

                    }
                );


                // ==========================================
                // NOTIFICATION
                // ==========================================

                await createNotification(

                    receiverId,

                    "message",

                    `${currentUserName} sent you a message.`,

                    currentUser.uid

                );


                // Clear input
                input.value =
                    "";

            }

            catch (error) {

                console.error(
                    "Failed to send message:",
                    error
                );

            }

        }
    );

}


// ======================================================
// ENTER TO SEND
// ======================================================

if (input) {

    input.addEventListener(
        "keypress",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                if (sendBtn) {

                    sendBtn.click();

                }

            }

        }
    );

}


// ======================================================
// LOAD MESSAGES
// ======================================================

function loadMessages() {

    if (!receiverId) {

        return;

    }


    // Remove previous listener
    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    const q =
        query(
            collection(
                db,
                "chats"
            ),
            orderBy(
                "timestamp"
            )
        );


    unsubscribeMessages =
        onSnapshot(
            q,
            (snapshot) => {

                messagesDiv.innerHTML =
                    "";


                snapshot.forEach(
                    (docSnap) => {

                        const msg =
                            docSnap.data();


                        // ==================================
                        // CHECK CURRENT CONVERSATION
                        // ==================================

                        const isThisChat =

                            (
                                msg.senderId ===
                                    currentUser.uid &&

                                msg.receiverId ===
                                    receiverId
                            )

                            ||

                            (
                                msg.senderId ===
                                    receiverId &&

                                msg.receiverId ===
                                    currentUser.uid
                            );


                        if (
                            !isThisChat
                        ) {

                            return;

                        }


                        // ==================================
                        // CREATE MESSAGE
                        // ==================================

                        const wrapper =
                            document.createElement(
                                "div"
                            );


                        wrapper.classList.add(
                            "msg-wrapper",

                            msg.senderId ===
                                currentUser.uid

                                ? "sent"

                                : "received"
                        );


                        wrapper.innerHTML = `

                            <div class="msg-bubble">

                                ${escapeHtml(
                                    msg.message
                                )}

                                <span class="msg-time">

                                    ${
                                        formatTime(
                                            msg.timestamp
                                        )
                                    }

                                </span>

                            </div>

                        `;


                        messagesDiv.appendChild(
                            wrapper
                        );

                    }
                );


                // Scroll to latest message
                messagesDiv.scrollTop =
                    messagesDiv.scrollHeight;

            },

            (error) => {

                console.error(
                    "Message Listener Error:",
                    error
                );

            }
        );

}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(
    timestamp
) {

    if (!timestamp) {

        return "";

    }


    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}