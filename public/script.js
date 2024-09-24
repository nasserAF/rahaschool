
document.addEventListener("DOMContentLoaded", function() {
    // Load Navigation Bar
    fetch('/navigationbar.htm')
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

/* document.addEventListener("DOMContentLoaded", function() {
    // Function to load the navigation bar
    function loadNavbar(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const navbarPlaceholder = document.getElementById('navbar-placeholder');
                if (navbarPlaceholder) {
                    navbarPlaceholder.innerHTML = data;
                    initializeNavbar();
                } else {
                    console.error('عنصر navbar-placeholder غير موجود في HTML.');
                }
            });
    }

    // Attempt to load the primary navigation bar
    loadNavbar('navigationbar.htm')
        .catch(error => {
            console.error('خطأ في تحميل navigationbar.htm:', error);
            console.log('محاولة تحميل demo/navigationbar.htm بدلاً من ذلك.');
            // Attempt to load the fallback navigation bar
            return loadNavbar('../navigationbar.htm');
        })
        .catch(error => {
            console.error('خطأ في تحميل demo/navigationbar.htm:', error);
            // Optionally, you can handle further fallback or notify the user here
        })
        .finally(() => {
            // Initialize the rest of the page regardless of navbar loading outcome
            initializePage();
        });
}); */


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
