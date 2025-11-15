document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const dropdownFooter = document.querySelector(".dropdown-footer");
    const navLinks = document.querySelectorAll(".nav-link");
    const footerLinks = dropdownFooter.querySelectorAll(".footer-link");
    const horizontalLine = dropdownFooter.querySelector("hr");
    const header = document.getElementById("header");

    // Toggle mobile menu
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        dropdownFooter.classList.toggle("active");

        navLinks.forEach((link, index) => {
            link.style.animation = "none";
            link.offsetHeight; 
            link.style.animation = `fadeUp 2.0s ease-out forwards ${index * 0.1}s`;
        });

        horizontalLine.style.animation = "none";
        horizontalLine.offsetHeight; 
        horizontalLine.style.animation = "slideIn 1.4s ease forwards";

        footerLinks.forEach((link, index) => {
            link.style.animation = "none";
            link.offsetHeight; 
            link.style.animation = `fadeUp 0.5s ease-out forwards ${0.5 + index * 0.1}s`;
        });
    });

    // Close mobile menu on link click
    navLinks.forEach((link) =>
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            dropdownFooter.classList.remove("active");
        })
    );

    // header blur effect on scroll
    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            header.classList.add("blur-header");
        } else {
            header.classList.remove("blur-header");
        }
    });

    // intersection observer for sections
    const sections = document.querySelectorAll(".experience-item, .experience-details, .about-section, .project");
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
});
document.addEventListener("DOMContentLoaded", function () {

    // apply animation classes
    const experienceHeader = document.querySelector(".experience-header");
    const experienceItems = document.querySelectorAll(".experience-item");

    // Apply animation to header and menu items
    setTimeout(() => {
        experienceHeader.style.opacity = "1";
        experienceHeader.style.transform = "translateY(0)";
        experienceItems.forEach(item => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        });
    }, 100); // delay to allow for other animations to start
});
document.addEventListener("DOMContentLoaded", function() {
    const homeSection = document.querySelector('#home'); 

    const options = {
        root: null, 
        threshold: 0.5, // trigger when 50% of the 'home' section is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                entry.target.classList.add('fade-out');
            } else {
                entry.target.classList.remove('fade-out');
            }
        });
    }, options);

    observer.observe(homeSection);
});

//  toggle the visibility of experience details and manage highlighting
function toggleExperienceVisibility(selectedId) {
    //hide all detail containers
    var details = document.querySelectorAll('.detail-container');
    details.forEach(detail => {
        detail.style.display = 'none'; 
    });

    //remove highlighting from all experience items
    var items = document.querySelectorAll('.experience-item');
    items.forEach(item => {
        item.classList.remove('highlighted');
    });

    // Show selected detail and highlight the corresponding tab
    var detailToShow = document.getElementById('details_' + selectedId);
    if (detailToShow) {
        detailToShow.style.display = 'block';
        detailToShow.scrollTop = 0; // reset scroll position when switching tabs
        document.getElementById(selectedId).classList.add('highlighted');
    }
}

// automatically display the experience's details
document.addEventListener("DOMContentLoaded", function() {
    toggleExperienceVisibility('ML_Engineer_CA');  // change the first exp that users see
});

document.addEventListener("DOMContentLoaded", function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        root: null, 
        rootMargin: '0px',
        threshold: 0.2 
    });

    // get elements that require the fade-in effect
    const fadeInElements = document.querySelectorAll('.fade-in-section');
    fadeInElements.forEach(element => observer.observe(element));

    //function to center the tabs on click(mainly only for small screen devices)
    function centerTab(tab) {
        const container = tab.parentElement;
        const tabOffset = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = container.offsetWidth;
    
        const scrollPosition = tabOffset - (containerWidth / 2) + (tabWidth / 2);
    
        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
    
    document.querySelectorAll('.experience-item').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.experience-item').forEach(t => t.classList.remove('highlighted'));
            tab.classList.add('highlighted');
            centerTab(tab);
        });
    });
    
});
