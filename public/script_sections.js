// sections.js

document.addEventListener("DOMContentLoaded", function() {
    loadNavigationBar();
    initializePage();
    attachEventListeners();
});

function attachEventListeners() {
    const saveBtn = document.getElementById('saveDailyPeriodsBtn');
    const addSectionBtn = document.getElementById('addSectionBtn');
    const gradeSelect = document.getElementById('gradeSelect');
    const addSectionForm = document.getElementById('addSectionForm');

    if (saveBtn) {
        saveBtn.addEventListener('click', saveDailyPeriods);
    }

    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function() {
            const gradeId = gradeSelect.value;

            if (gradeId && gradeId !== 'new') {
                addSection(gradeId);
            } else {
                alert('الرجاء اختيار صف لإضافة الشُعبة.');
            }
        });
    }

    if (gradeSelect) {
        gradeSelect.addEventListener('change', handleGradeChange);
    }

    if (addSectionForm) {
        addSectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const gradeId = gradeSelect.value;

            if (gradeId && gradeId !== 'new') {
                addSection(gradeId);
            } else if (gradeId === 'new') {
                addNewGrade();
            } else {
                alert('الرجاء اختيار الصف.');
            }
        });
    }
}

function saveDailyPeriods() {
    const gradeId = document.getElementById('gradeSelect').value;

    if (!gradeId || gradeId === 'new') {
        alert('الرجاء اختيار صف.');
        return;
    }

    const periodsPerDay = {
        Sunday: parseInt(document.getElementById('period_Sunday').value, 10) || 0,
        Monday: parseInt(document.getElementById('period_Monday').value, 10) || 0,
        Tuesday: parseInt(document.getElementById('period_Tuesday').value, 10) || 0,
        Wednesday: parseInt(document.getElementById('period_Wednesday').value, 10) || 0,
        Thursday: parseInt(document.getElementById('period_Thursday').value, 10) || 0
    };

    // إرسال الطلب لحفظ الحصص اليومية
    fetch(`/rahaschool/grades_sections/${gradeId}`, {
        method: 'PUT', // تعديل الصف الموجود
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            periods_per_day: periodsPerDay
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('تم حفظ الحصص اليومية بنجاح.');
        }
    })
    .catch(error => {
        console.error('Error saving daily periods:', error);
        alert('حدث خطأ أثناء حفظ الحصص اليومية.');
    });
}

function handleGradeChange() {
    const gradeId = this.value;

    if (gradeId && gradeId !== 'new') {
        // إذا كان الصف مسجل، جلب البيانات
        fetch(`/rahaschool/grades_sections/${gradeId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // الصف غير موجود، أضفه ثم عبئ الحقول بقيم 0
                        return addNewGradeAutomatically(gradeId).then(() => {
                            resetPeriodsForm(); // تعيين القيم إلى 0 بعد إضافة الصف
                        });
                    }
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.periods_per_day) {
                    fillPeriodsForm(data.periods_per_day); // تعبئة البيانات إذا كان الصف مسجلاً
                }
                if (data.sections) {
                    displaySections(data.sections);
                }
            })
            .catch(error => {
                console.error('Error fetching grade sections:', error);
                alert('حدث خطأ أثناء جلب بيانات الصف.');
            });
    } else if (gradeId === 'new') {
        // إعادة تعيين الحقول لقيم 0 عند إضافة صف جديد
        document.getElementById('newGradeFields').style.display = 'block';
        resetPeriodsForm(); // تعيين القيم إلى 0 عند إضافة صف جديد
        document.getElementById('sectionsContainer').innerHTML = '';
    } else {
        document.getElementById('newGradeFields').style.display = 'none';
        document.getElementById('sectionsContainer').innerHTML = '';
    }
}

// إضافة دالة جديدة لإعادة تعيين الحقول لقيم 0
function resetPeriodsForm() {
    document.getElementById('period_Sunday').value = 0;
    document.getElementById('period_Monday').value = 0;
    document.getElementById('period_Tuesday').value = 0;
    document.getElementById('period_Wednesday').value = 0;
    document.getElementById('period_Thursday').value = 0;
}

// دالة لتعبئة الحقول الخاصة بعدد الحصص اليومية
function fillPeriodsForm(periodsPerDay) {
    document.getElementById('period_Sunday').value = periodsPerDay.Sunday;
    document.getElementById('period_Monday').value = periodsPerDay.Monday;
    document.getElementById('period_Tuesday').value = periodsPerDay.Tuesday;
    document.getElementById('period_Wednesday').value = periodsPerDay.Wednesday;
    document.getElementById('period_Thursday').value = periodsPerDay.Thursday;
}

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

function initializeNavbar() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-active');
            navLinks.classList.toggle('active');
        });
    }
}

function initializePage() {
    populateGradeDropdown();
}

function populateGradeDropdown() {
    fetch('/rahaschool/config.json') // التأكد من جلب البيانات من config.json
        .then(response => response.json())
        .then(data => {
            const gradeSelect = document.getElementById('gradeSelect');
            data.all_grades.forEach((grade, index) => {
                const option = document.createElement('option');
                option.value = data.all_grades_id[index];
                option.textContent = grade;
                gradeSelect.appendChild(option);
            });

            // إضافة خيار "إضافة صف جديد"
            const option = document.createElement('option');
            option.value = 'new';
            option.textContent = '-- إضافة صف جديد --';
            gradeSelect.appendChild(option);
        })
        .catch(error => {
            console.error('خطأ في تحميل config.json:', error);
        });
}

function displayNewGradeFields() {
    const periodsContainer = document.getElementById('periodsContainer');
    periodsContainer.innerHTML = '';

    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    days.forEach(day => {
        const div = document.createElement('div');
        div.classList.add('form-group');
        div.innerHTML = `
            <label for="period_${day}">عدد الحصص في ${day}:</label>
            <input type="number" id="period_${day}" min="0" max="10" required>
        `;
        periodsContainer.appendChild(div);
    });

    document.getElementById('newGradeFields').style.display = 'block';
}

function addNewGrade() {
    const gradeId = document.getElementById('newGradeId').value.trim();
    const gradeName = document.getElementById('newGradeName').value.trim();

    if (!gradeId || !gradeName) {
        alert('الرجاء إدخال معرف واسم الصف الجديد.');
        return;
    }

    const periodsPerDay = {
        Sunday: parseInt(document.getElementById('period_Sunday').value, 10) || 6,
        Monday: parseInt(document.getElementById('period_Monday').value, 10) || 6,
        Tuesday: parseInt(document.getElementById('period_Tuesday').value, 10) || 6,
        Wednesday: parseInt(document.getElementById('period_Wednesday').value, 10) || 6,
        Thursday: parseInt(document.getElementById('period_Thursday').value, 10) || 6
    };

    const sectionId = `sec_${gradeId}A`;
    const sectionName = `الشعبة أ`;

    // إرسال طلب لإضافة الصف الجديد مع الشعبة
    fetch('/rahaschool/grades_sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grade_id: gradeId,
            grade_name: gradeName,
            periods_per_day: periodsPerDay,
            sections: [
                {
                    section_id: sectionId,
                    section_name: sectionName
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('تمت إضافة الصف والشُعبة بنجاح.');
            loadSections(gradeId);
            populateGradeDropdown();
            document.getElementById('addSectionForm').reset();
            document.getElementById('newGradeFields').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error adding grade:', error);
        alert('حدث خطأ أثناء إضافة الصف.');
    });
}

function loadSections(gradeId) {
    fetch(`/rahaschool/grades_sections/${gradeId}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    // إذا كان الصف غير موجود، أضف الصف بشكل أوتوماتيكي إلى ملف grades_sections.json
                    return addNewGradeAutomatically(gradeId);
                }
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.sections) {
                displaySections(data.sections);
            }
        })
        .catch(error => {
            console.error('خطأ في جلب الشُعب الحالية:', error);
            alert('حدث خطأ أثناء جلب بيانات الصف.');
        });
}

function addNewGradeAutomatically(gradeId) {
    const gradeName = document.querySelector(`#gradeSelect option[value="${gradeId}"]`).textContent;

    const periodsPerDay = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0
    };

    const sectionId = `sec_${gradeId}A`;
    const sectionName = `الشعبة أ`;

    // إرسال طلب لإضافة الصف الجديد مع الشعبة الافتراضية
    return fetch('/rahaschool/grades_sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grade_id: parseInt(gradeId, 10), // تحويل gradeId إلى رقم
            grade_name: gradeName,
            periods_per_day: periodsPerDay,
            sections: [
                {
                    section_id: sectionId,
                    section_name: sectionName
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('تمت إضافة الصف بنجاح. يمكنك الآن تعديل الحصص اليومية وإضافة الشعب.');
            resetPeriodsForm(); // إعادة تعيين القيم إلى 0
            populateGradeDropdown();
        }
    })
    .catch(error => {
        console.error('Error adding grade automatically:', error);
        alert('حدث خطأ أثناء إضافة الصف.');
    });
}

function displaySections(sections) {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';

    if (sections.length === 0) {
        container.innerHTML = '<p>لا توجد شُعب لهذا الصف.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table');

    // إنشاء رأس الجدول
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>معرف الشُعبة</th>
            <th>اسم الشُعبة</th>
            <th>الإجراءات</th>
        </tr>
    `;
    table.appendChild(thead);

    // إنشاء جسم الجدول
    const tbody = document.createElement('tbody');
    sections.forEach(section => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${section.section_id}</td>
            <td>${section.section_name}</td>
            <td>
                <button class="btn btn-secondary edit-btn" data-id="${section.section_id}" data-name="${section.section_name}">تعديل</button>
                <button class="btn btn-danger delete-btn" data-id="${section.section_id}">حذف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    // إضافة مستمعي الأحداث لأزرار التعديل والحذف
    const editButtons = container.querySelectorAll('.edit-btn');
    const deleteButtons = container.querySelectorAll('.delete-btn');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-id');
            const sectionName = this.getAttribute('data-name');
            const newName = prompt('أدخل اسم الشُعبة الجديد:', sectionName);
            if (newName && newName.trim() !== '') {
                updateSection(sectionId, newName.trim());
            }
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-id');
            if (confirm('هل أنت متأكد من حذف هذه الشُعبة؟')) {
                deleteSection(sectionId);
            }
        });
    });
}

function addSection(gradeId) {
    // جلب الشُعب الحالية للصف الدراسي المحدد
    fetch(`/rahaschool/grades_sections/${gradeId}`)
        .then(response => response.json())
        .then(data => {
            if (!data.sections) {
                alert('لا يمكن إضافة شُعب لهذا الصف.');
                return;
            }

            const existingSections = data.sections;
            const nextLatinLetter = getNextLatinLetter(existingSections);
            const nextArabicLetter = getNextArabicLetter(existingSections);
            
            const sectionId = `sec_${gradeId}${nextLatinLetter}`;
            const sectionName = `الشعبة ${nextArabicLetter}`;

            // إرسال طلب إضافة الشُعبة الجديدة
            fetch(`/rahaschool/grades_sections/${gradeId}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section_id: sectionId,
                    section_name: sectionName
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('تمت إضافة الشُعبة بنجاح.');
                    loadSections(gradeId);
                    document.getElementById('addSectionForm').reset();
                }
            })
            .catch(error => {
                console.error('خطأ في إضافة الشُعبة:', error);
                alert('حدث خطأ أثناء إضافة الشُعبة.');
            });
        })
        .catch(error => {
            console.error('خطأ في جلب الشُعب الحالية:', error);
            alert('لا يمكن إضافة شُعب لهذا الصف.');
        });
}

// دالة لتوليد الحرف اللاتيني التالي
function getNextLatinLetter(sections) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentCount = sections.length;
    return letters[currentCount] || 'Z'; // إذا تجاوز عدد الحروف، استخدم 'Z'
}

// دالة لتوليد الحرف العربي التالي
function getNextArabicLetter(sections) {
    const letters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
    const currentCount = sections.length;
    return letters[currentCount] || 'ي'; // إذا تجاوز عدد الحروف، استخدم 'ي'
}

function updateSection(sectionId, newName) {
    fetch(`/rahaschool/grades_sections/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            section_name: newName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('تم تحديث الشُعبة بنجاح.');
            const gradeId = document.getElementById('gradeSelect').value;
            loadSections(gradeId);
        }
    })
    .catch(error => {
        console.error('خطأ في تحديث الشُعبة:', error);
        alert('حدث خطأ أثناء تحديث الشُعبة.');
    });
}

function deleteSection(sectionId) {
    fetch(`/rahaschool/grades_sections/sections/${sectionId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('تم حذف الشُعبة بنجاح.');
            const gradeId = document.getElementById('gradeSelect').value;
            loadSections(gradeId);
        }
    })
    .catch(error => {
        console.error('خطأ في حذف الشُعبة:', error);
        alert('حدث خطأ أثناء حذف الشُعبة.');
    });
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for ( let i = 0; i < length; i++ ) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
