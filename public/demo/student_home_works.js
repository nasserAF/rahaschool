document.addEventListener("DOMContentLoaded", function() {
    loadNavigationBar();
});

function loadNavigationBar() {
    fetch('../navigationbar.htm')
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
}

// فتح النافذة المنبثقة
function openPopup(subject, description, teacher, dueDate) {
    document.getElementById('subject').textContent = subject;
    document.getElementById('description').textContent = description;
    document.getElementById('teacher').textContent = teacher;
    document.getElementById('due-date').textContent = dueDate;

    document.getElementById('popup').style.display = 'flex'; // تغيير من 'block' إلى 'flex'
}

// إغلاق النافذة المنبثقة
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// تفعيل البحث
document.getElementById('search-input').addEventListener('input', function() {
    var filter = this.value.toLowerCase();
    var rows = document.querySelectorAll('#homework-table tbody tr');

    rows.forEach(function(row) {
        var subject = row.cells[0].textContent.toLowerCase();
        var description = row.cells[1].textContent.toLowerCase();
        var teacher = row.cells[3].textContent.toLowerCase();

        if (subject.includes(filter) || description.includes(filter) || teacher.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});
