document.addEventListener('DOMContentLoaded', function() {
    // Dark mode toggle
    document.getElementById('toggleDarkMode').addEventListener('click', function() {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Expand/Collapse functionality
    document.querySelectorAll('[data-toggle-all]').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            const contents = document.querySelectorAll(`[data-content="${section}"]`);
            const textSpan = document.querySelector(`[data-toggle-text="${section}"]`);
            const icon = document.querySelector(`[data-toggle-icon="${section}"]`);

            const allExpanded = Array.from(contents).every(el => el.classList.contains('expanded'));

            contents.forEach(content => {
                if (allExpanded) {
                    content.classList.remove('expanded');
                } else {
                    content.classList.add('expanded');
                }
            });

            if (allExpanded) {
                textSpan.textContent = 'Expand all';
                icon.style.transform = 'rotate(0deg)';
            } else {
                textSpan.textContent = 'Collapse all';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Individual item click to expand
    document.querySelectorAll('.slot-content').forEach(content => {
        const parent = content.closest('.relative');
        if (parent) {
            parent.style.cursor = 'pointer';
            parent.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return;
                content.classList.toggle('expanded');
            });
        }
    });
});

// Scroll to section
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
