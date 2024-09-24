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

// script_all_schedules.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/all_schedules.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('schedulesContainer');

            // Fetch config.json to get max_periods_per_day
            fetch('/config.json')
                .then(response => response.json())
                .then(configData => {
                    const breakPeriodIndex = 3; // استراحة في العمود الرابع
                    const totalColumns = configData.max_periods_per_day + 1; // 8 columns including 'اليوم'

                    for (const sectionId in data) {
                        const section = data[sectionId];
                        const { grade_name, section_name, schedule } = section;
                        
                        // إنشاء عنوان للشعبة
                        const sectionTitle = document.createElement('h2');
                        sectionTitle.textContent = `${grade_name} - ${section_name}`;
                        container.appendChild(sectionTitle);

                        // إنشاء الجدول
                        const table = document.createElement('table');
                        table.classList.add('table');

                        // إنشاء رأس الجدول (مرة واحدة فقط)
                        const thead = document.createElement('thead');
                        const headerRow = document.createElement('tr');

                        // إضافة عمود اليوم
                        const dayHeader = document.createElement('th');
                        dayHeader.textContent = 'اليوم';
                        headerRow.appendChild(dayHeader);

                        // إضافة أعمدة الفترات مع استراحة في الموقع المناسب (مرة واحدة فقط)
                        // الحصول على قيمة periods_per_day للّيوم الأول  (فقط)
                        const periodsForDay = Object.values(schedule)[0].length; //  الحصول  على  عدد  الحصص  لليوم
                        
                        for (let i = 0; i < periodsForDay; i++) {  //  استخدام  periodsForDay  للتحكم  في  عدد  الأعمدة
                            const periodHeader = document.createElement('th');
                            if (i === breakPeriodIndex) {
                                periodHeader.textContent = 'استراحة';
                            } else if (i < breakPeriodIndex) {
                                periodHeader.textContent = `الحصة ${i + 1}`;
                            } else {
                                periodHeader.textContent = `الحصة ${i}`;
                            }
                            headerRow.appendChild(periodHeader);
                        }

                        thead.appendChild(headerRow);
                        table.appendChild(thead);

                        // إنشاء جسم الجدول
                        const tbody = document.createElement('tbody');

                        for (const day in schedule) {
                            const row = document.createElement('tr');

                            // عمود اليوم
                            const dayCell = document.createElement('td');
                            dayCell.textContent = day;
                            row.appendChild(dayCell);

                            // أعمدة الفترات
                            //  الحصول  على  قيمة  periods_per_day  لليوم  المُحدد
                            //  استخدام  periods_per_day  من  `grades_sections.json`  للتحكم  في  عدد  الفترات
                            //  للحصول على قيمة periods_per_day، تحتاج إلى البحث في ملف  grades_sections.json  باستخدام  grade_id  و section_id
                            const periodsForDay = data[sectionId].schedule[day].length; //  الحصول  على  عدد  الحصص  لليوم
                            for (let i = 0; i < periodsForDay; i++) { //  استخدام  periodsForDay  للتحكم  في  عدد  الأعمدة
                                const cell = document.createElement('td');

                                if (i === breakPeriodIndex) {
                                    // عرض 'استراحة' في العمود الرابع
                                    cell.textContent = 'استراحة';
                                } else {
                                    const period = schedule[day][i];

                                    if (period && period !== 'استراحة') {
                                        // تنسيق عرض المادة والمعلمة
                                        const [subject, teacherWithParen] = period.split(' (');
                                        const teacher = teacherWithParen ? teacherWithParen.replace(')', '').trim() : 'غير معرف';
                                        const subjectName = subject.trim();

                                        cell.innerHTML = `<strong>${subjectName}</strong><br>${teacher}`;
                                    } else {
                                        // استبدال "فارغ" بـ "---"
                                        cell.textContent = '---';
                                    }
                                }

                                row.appendChild(cell);
                            }

                            tbody.appendChild(row);
                        }

                        table.appendChild(tbody);
                        container.appendChild(table);
                    }
                })
                .catch(error => {
                    console.error('Error loading config.json:', error);
                    // في حال فشل تحميل config.json، نستخدم القيمة الافتراضية
                    const maxPeriods = 7; // القيمة الافتراضية
                    const breakPeriodIndex = 3; // استراحة في العمود الرابع
                    const totalColumns = maxPeriods + 1; // 8 columns including 'اليوم'

                    for (const sectionId in data) {
                        const section = data[sectionId];
                        const { grade_name, section_name, schedule } = section;

                        // إنشاء عنوان للشعبة
                        const sectionTitle = document.createElement('h2');
                        sectionTitle.textContent = `${grade_name} - ${section_name}`;
                        container.appendChild(sectionTitle);

                        // إنشاء الجدول
                        const table = document.createElement('table');
                        table.classList.add('table');

                        // إنشاء رأس الجدول (مرة واحدة فقط)
                        const thead = document.createElement('thead');
                        const headerRow = document.createElement('tr');

                        // إضافة عمود اليوم
                        const dayHeader = document.createElement('th');
                        dayHeader.textContent = 'اليوم';
                        headerRow.appendChild(dayHeader);

                        // إضافة أعمدة الفترات مع استراحة في الموقع المناسب (مرة واحدة فقط)
                        for (let i = 0; i < maxPeriods; i++) {
                            const periodHeader = document.createElement('th');
                            if (i === breakPeriodIndex) {
                                periodHeader.textContent = 'استراحة';
                            } else if (i < breakPeriodIndex) {
                                periodHeader.textContent = `الحصة ${i + 1}`;
                            } else {
                                periodHeader.textContent = `الحصة ${i}`;
                            }
                            headerRow.appendChild(periodHeader);
                        }

                        thead.appendChild(headerRow);
                        table.appendChild(thead);

                        // إنشاء جسم الجدول
                        const tbody = document.createElement('tbody');

                        for (const day in schedule) {
                            console.log("-----------------  day in schedule : ", day in schedule)
                            const row = document.createElement('tr');

                            // عمود اليوم
                            const dayCell = document.createElement('td');
                            dayCell.textContent = day;
                            row.appendChild(dayCell);

                            // أعمدة الفترات
                            for (let i = 0; i < maxPeriods; i++) {
                                const cell = document.createElement('td');

                                if (i === breakPeriodIndex) {
                                    // عرض 'استراحة' في العمود الرابع
                                    cell.textContent = 'استراحة';
                                } else {
                                    // تحديد الفهرس الصحيح للحصة في بيانات JSON
                                    const dataIndex = i < breakPeriodIndex ? i : i - 1;
                                    const period = schedule[day][dataIndex];

                                    if (period && period !== 'استراحة') {
                                        // تنسيق عرض المادة والمعلمة
                                        const [subject, teacherWithParen] = period.split(' (');
                                        const teacher = teacherWithParen ? teacherWithParen.replace(')', '').trim() : 'غير معرف';
                                        const subjectName = subject.trim();

                                        cell.innerHTML = `<strong>${subjectName}</strong><br>${teacher}`;
                                    } else {
                                        // استبدال "فارغ" بـ "---"
                                        cell.textContent = '---';
                                    }
                                }

                                row.appendChild(cell);
                            }

                            tbody.appendChild(row);
                        }

                        table.appendChild(tbody);
                        container.appendChild(table);
                    }
                });
        })
        .catch(error => {
            console.error('حدث خطأ أثناء تحميل الجداول:', error);
            const container = document.getElementById('schedulesContainer');
            container.innerHTML = '<p>حدث خطأ أثناء تحميل الجداول. يرجى المحاولة لاحقًا.</p>';
        });
});