/**
 * Shared page logic: highlight active nav link, mobile menu, scroll shadow.
 */
(function () {
    // Determine current page filename
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf("/") + 1) || "index.html";

    document.addEventListener("DOMContentLoaded", () => {
        // Highlight active nav link
        document.querySelectorAll(".nav-links a").forEach((a) => {
            const href = a.getAttribute("href");
            if (href === file || (file === "" && href === "index.html")) {
                a.classList.add("active");
            }
        });

        // Navbar scroll shadow
        const navbar = document.getElementById("navbar");
        if (navbar) {
            const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 10);
            window.addEventListener("scroll", onScroll);
            onScroll();
        }

        // Mobile menu toggle
        const btn = document.getElementById("mobileMenuBtn");
        const links = document.getElementById("navLinks");
        if (btn && links) {
            btn.addEventListener("click", () => {
                btn.classList.toggle("active");
                links.classList.toggle("active");
            });
            links.querySelectorAll("a").forEach((a) =>
                a.addEventListener("click", () => {
                    btn.classList.remove("active");
                    links.classList.remove("active");
                })
            );
        }
    });
})();
