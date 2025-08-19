document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".experience-nav__link");
    const sections = document.querySelectorAll(".experience-section, .experience-subsection, .experience-description");

    // smooth scroll when clicking a nav link
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const yOffset = -80; // Adjust for fixed header on main page
                const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        });
    });

    // highlight the tab while scrolling
    function highlightActiveTab() {
        let currentSection = null;
        const scrollPosition = window.scrollY + 100; // adjust for navbar height

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; //  offset
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("experience-nav__link--selected");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("experience-nav__link--selected");
            }
        });
    }

    // Attach the scroll event listener
    window.addEventListener("scroll", highlightActiveTab);
    navLinks[0].classList.add("experience-nav__link--selected") // by defualt activate the first nav tab
    highlightActiveTab(); // run on page load
});
