// Simple Poppinsaction for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        const action = this.innerText;
        console.log(`User clicked: ${action}`);
        
        if(action === "Browse Notes") {
            alert("Redirecting you to the Branch Selection page...");
        } else if (action === "Sign Up") {
            alert("Registration modal would open here.");
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if(this.hash !== "") {
            e.preventDefault();
            const hash = this.hash;
            document.querySelector(hash).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});