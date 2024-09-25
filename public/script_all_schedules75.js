document.addEventListener("DOMContentLoaded", function() {
    loadNavigationBar();
});

function loadNavigationBar() {
    fetch('navigationbar.htm')
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

// دالة لتحميل ملف JSON باستخدام Fetch API
async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`خطأ في تحميل ملف JSON: ${error}`);
        return null;
    }
}

// دالة لإنشاء جدول لشعبة معينة مع عكس الترتيب
function createTable(gradeName, sectionName, schedule) {
    // إنشاء عنصر div يحتوي على عنوان الشعبة والصف
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('section');

    // إنشاء عنوان للشعبة
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = `${gradeName} - ${sectionName}`;
    sectionDiv.appendChild(sectionTitle);

    // إنشاء جدول
    const table = document.createElement('table');
    table.classList.add('table');

    // إنشاء ترويسة الجدول (الحصص)
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // إضافة خلية فارغة في البداية للتمييز بين الحصص والأيام
    const emptyTh = document.createElement('th');
    emptyTh.textContent = 'اليوم / الحصة';
    headerRow.appendChild(emptyTh);

    // تحديد ترتيب الحصص
    const periodOrder = [
        'الحصة الأولى',
        'الحصة الثانية',
        'الحصة الثالثة',
        'إستراحة',
        'الحصة الرابعة',
        'الحصة الخامسة',
        'الحصة السادسة',
        'الحصة السابعة'
    ];

    // إضافة عناوين الحصص
    periodOrder.forEach(period => {
        const th = document.createElement('th');
        th.textContent = period;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // إنشاء جسم الجدول (tbody)
    const tbody = document.createElement('tbody');

    // تحديد ترتيب الأيام بناءً على البيانات
    const days = Object.keys(schedule);

    days.forEach(day => {
        const row = document.createElement('tr');

        // خلية اليوم
        const dayTd = document.createElement('td');
        dayTd.textContent = day;
        row.appendChild(dayTd);

        // إضافة الحصص لكل فترة في اليوم الحالي بناءً على ترتيب الحصص
        periodOrder.forEach((period, index) => {
            const td = document.createElement('td');
            const scheduleEntry = schedule[day][index];
            td.textContent = scheduleEntry || "---";
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    sectionDiv.appendChild(table);
    return sectionDiv;
}

// دالة لعرض الجداول
async function displaySchedules() {
    // مسار ملف JSON المقدم من السيرفر
    const data = await loadJSON('/rahaschool/all_schedules_75.json');
    if (!data) {
        const container = document.getElementById('tables-container');
        container.innerHTML = "<p>تعذر تحميل بيانات الجداول.</p>";
        return;
    }

    const container = document.getElementById('tables-container');

    for (const [sectionId, sectionInfo] of Object.entries(data)) {
        const { grade_name, section_name, schedule } = sectionInfo;
        const tableElement = createTable(grade_name, section_name, schedule);
        container.appendChild(tableElement);
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', displaySchedules);
