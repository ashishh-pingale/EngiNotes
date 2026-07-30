// =========================================
// Elements
// =========================================

const sidebar = document.querySelector(".sidebar");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".page-section");

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



// document.addEventListener("DOMContentLoaded", () => {

//     loadDashboard();
//     loadPendingNotes();
//     loadApprovedNotes();
//     loadRejectedNotes();
//     loadUsers();

//     console.log("EngiNotes Admin Panel Loaded");

// });