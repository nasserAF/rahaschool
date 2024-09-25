
document.addEventListener("DOMContentLoaded", function() {
    // Load Navigation Bar
    fetch('/rahaschool/public/navigationbar.htm')
        .then(response => response.text())
        .then(data => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = data;
                initializeNavbar();
            } else {
                console.error('عنصر navbar-placeholder غير موجود في HTML.');
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل navigationbar.htm:', error);
        });

    // Initialize Page
    initializePage();
});

function initializeNavbar() {
    // Toggle Mobile Menu
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (mobileMenu && navbarMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navbarMenu.classList.toggle('active');
        });
    }
}
