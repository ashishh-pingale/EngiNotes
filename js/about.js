// =========================================================
// ABOUT PAGE SCROLL ANIMATIONS
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const revealElements =
        document.querySelectorAll(
            ".reveal, .reveal-left, .reveal-right, .reveal-scale"
        );


    const observer = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }


                entry.target.classList.add("visible");


                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.15,

            rootMargin: "0px 0px -60px 0px"
        }
    );


    revealElements.forEach(element => {

        observer.observe(element);

    });

});