function getUserPref() {
    const storedTheme = localStorage.getItem('theme') ?? undefined;
    return storedTheme || 'light';
}

function setTheme(newTheme) {
    if (newTheme !== 'light' && newTheme !== 'dark') {
        return console.log(`Invalid theme value '${newTheme}' received.`);
    }
    localStorage.setItem('theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark' && root.classList.contains('dark')) {
        return;
    } else if (newTheme === 'light' && !root.classList.contains('dark')) {
        return;
    }
    root.classList.toggle('dark');
}

setTheme(getUserPref());
