// ==========================================
// FITUR HAMBURGER MENU (GLOBAL)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            if (navLinks.classList.contains('active')) {
                hamburgerBtn.innerHTML = '✖';
                hamburgerBtn.style.transform = 'rotate(90deg)';
                hamburgerBtn.style.color = '#ef4444'; 
            } else {
                hamburgerBtn.innerHTML = '☰';
                hamburgerBtn.style.transform = 'rotate(0deg)';
                hamburgerBtn.style.color = 'white';
            }
        });
    }
});