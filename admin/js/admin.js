// =========================================
// Elements
// =========================================

const sidebar = document.querySelector(".sidebar");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".page-section");

const previewModal = document.getElementById("previewModal");
const deleteModal = document.getElementById("deleteModal");

const previewButtons = document.querySelectorAll(".preview-btn");
const closeButtons = document.querySelectorAll(".close-modal");

const deleteButtons = document.querySelectorAll(".danger-btn");
const cancelButton = document.querySelector(".cancel-btn");

// =========================================
// Sidebar Toggle
// =========================================

menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

// =========================================
// Navigation
// =========================================

navLinks.forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        const target = link.getAttribute("href").substring(1);

        sections.forEach(section => {
            section.classList.remove("active-page");

            if (section.id === target) {
                section.classList.add("active-page");
            }
        });

        if (window.innerWidth < 900) {
            sidebar.classList.remove("active");
        }

    });

});

// =========================================
// Preview Modal
// =========================================

previewButtons.forEach(button => {

    button.addEventListener("click", () => {

        previewModal.style.display = "flex";

        document.getElementById("previewFrame").src =
            "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

    });

});

// =========================================
// Delete Modal
// =========================================

deleteButtons.forEach(button => {

    button.addEventListener("click", () => {

        deleteModal.style.display = "flex";

    });

});

// =========================================
// Close Modals
// =========================================

closeButtons.forEach(button => {

    button.addEventListener("click", () => {

        previewModal.style.display = "none";
        deleteModal.style.display = "none";

    });

});

cancelButton.addEventListener("click", () => {

    deleteModal.style.display = "none";

});

// =========================================
// Click Outside Modal
// =========================================

window.addEventListener("click", e => {

    if (e.target === previewModal) {
        previewModal.style.display = "none";
    }

    if (e.target === deleteModal) {
        deleteModal.style.display = "none";
    }

});

// =========================================
// Search
// =========================================

const globalSearch = document.getElementById("globalSearch");

globalSearch.addEventListener("keyup", () => {

    const value = globalSearch.value.toLowerCase();

    document.querySelectorAll(".data-table tbody tr").forEach(row => {

        row.style.display = row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";

    });

});

// =========================================
// Toast Notification
// =========================================

function showToast(message, type = "success") {

    let toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === "success"
            ? "fa-circle-check"
            : "fa-circle-exclamation"}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2500);

}

// =========================================
// Approve Note
// =========================================

document.querySelectorAll(".success-btn").forEach(button => {

    button.addEventListener("click", () => {

        showToast("Note Approved Successfully");

        // TODO:
        // PATCH /api/admin/notes/:id/approve

    });

});

// =========================================
// Reject Note
// =========================================

document.querySelectorAll(".warning-btn").forEach(button => {

    button.addEventListener("click", () => {

        showToast("Note Rejected", "warning");

        // TODO:
        // PATCH /api/admin/notes/:id/reject

    });

});

// =========================================
// Delete
// =========================================

document.querySelector(".delete-btn").addEventListener("click", () => {

    deleteModal.style.display = "none";

    showToast("Item Deleted");

    // TODO:
    // DELETE /api/admin/notes/:id

});

// =========================================
// Save Settings
// =========================================

const saveButton = document.querySelector(".save-btn");

saveButton.addEventListener("click", () => {

    showToast("Settings Saved");

    // TODO:
    // PATCH /api/admin/settings

});

// =========================================
// Table Buttons
// =========================================

document.querySelectorAll(".table-btn").forEach(button => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "translateY(-2px)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "translateY(0)";

    });

});

// =========================================
// Responsive Sidebar
// =========================================

window.addEventListener("resize", () => {

    if (window.innerWidth > 900) {
        sidebar.classList.remove("active");
    }

});

// =========================================
// Future API Functions
// =========================================

async function loadDashboard() {
    // GET /api/admin/dashboard
}

async function loadPendingNotes() {
    // GET /api/admin/notes/pending
}

async function loadApprovedNotes() {
    // GET /api/admin/notes/approved
}

async function loadRejectedNotes() {
    // GET /api/admin/notes/rejected
}

async function loadUsers() {
    // GET /api/admin/users
}

async function updateSettings() {
    // PATCH /api/admin/settings
}

// =========================================
// Initialization
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();
    loadPendingNotes();
    loadApprovedNotes();
    loadRejectedNotes();
    loadUsers();

    console.log("EngiNotes Admin Panel Loaded");

});