// script_subjects.js

document.addEventListener("DOMContentLoaded", function() {
    // Load Navigation Bar
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

    // Initialize Page
    initializePage();
});

function initializeNavbar() {
    // Toggle Mobile Menu
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
    let subjects = [];
    let allSubjects = [];
    let allSubjectsEn = [];
    let allGrades = [];
    let allGradesId = [];
    let editingSubjectId = null;

    // Load Data
    loadData();

    function loadData() {
        // Load Config.json
        fetch('/config.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allSubjects = data.all_subjects;
                allSubjectsEn = data.all_subjects_en;
                allGrades = data.all_grades;
                allGradesId = data.all_grades_id;
                populateSubjectNameSelect();
                populateGradeSelect();
                loadSubjects();
            })
            .catch(error => {
                console.error('خطأ في تحميل config.json:', error);
            });
    }

    function loadSubjects() {
        fetch('/api/subjects')
            .then(response => response.json())
            .then(data => {
                subjects = data;
                displaySubjects();
            })
            .catch(error => {
                console.error('خطأ في تحميل subjects.json:', error);
            });
    }

    // Populate Subject Select
    function populateSubjectNameSelect() {
        const subjectSelect = document.getElementById('subjectName');
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
            allSubjects.forEach((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                subjectSelect.appendChild(option);
            });
        } else {
            console.error('عنصر subjectName غير موجود في HTML.');
        }
    }

    // Populate Grade Select
    function populateGradeSelect() {
        const gradeSelect = document.getElementById('gradeSelect');
        if (gradeSelect) {
            gradeSelect.innerHTML = '<option value="">-- اختر الصف --</option>';
            allGrades.forEach((gradeName, index) => {
                const option = document.createElement('option');
                option.value = allGradesId[index];
                option.textContent = gradeName;
                gradeSelect.appendChild(option);
            });
        } else {
            console.error('عنصر gradeSelect غير موجود في HTML.');
        }
    }

    // Display Subjects in Separate Tables by Grade with Subject Count
    function displaySubjects() {
        const container = document.getElementById('subjectsContainer');
        if (!container) {
            console.error('عنصر subjectsContainer غير موجود في HTML.');
            return;
        }
        container.innerHTML = '';

        allGrades.forEach((gradeName, index) => {
            const gradeId = allGradesId[index];
            const subjectsOfGrade = subjects.filter(subject => subject.grade_id === gradeId);

            if (subjectsOfGrade.length > 0) {
                // Create Grade Heading with Subject Count
                const heading = document.createElement('h2');
                heading.textContent = `${gradeName} (${subjectsOfGrade.length} مادة)`;
                heading.style.marginTop = '40px';
                container.appendChild(heading);

                // Create Table
                const table = document.createElement('table');
                table.classList.add('table');

                // Create Table Header
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>معرف المادة</th>
                        <th>اسم المادة</th>
                        <th>عدد الحصص الأسبوعية</th>
                        <th>الإجراءات</th>
                    </tr>
                `;
                table.appendChild(thead);

                // Create Table Body
                const tbody = document.createElement('tbody');

                subjectsOfGrade.forEach(subject => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${subject.subject_id}</td>
                        <td>${subject.name}</td>
                        <td>${subject.weekly_periods}</td>
                        <td>
                            <button class="btn btn-primary edit-btn" data-id="${subject.subject_id}">تعديل</button>
                            <button class="btn btn-danger delete-btn" data-id="${subject.subject_id}">حذف</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                table.appendChild(tbody);
                container.appendChild(table);
            }
        });
    }

    // Handle Form Submission
    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
        subjectForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Gather Form Data
            const subjectName = document.getElementById('subjectName').value.trim();
            const gradeId = document.getElementById('gradeSelect').value;
            const weeklyPeriods = document.getElementById('weeklyPeriods').value;

            if (!subjectName || !gradeId || !weeklyPeriods) {
                alert('الرجاء ملء جميع الحقول المطلوبة.');
                return;
            }

            // Generate subject_id using all_subjects_en
            const subjectIndex = allSubjects.indexOf(subjectName);
            if (subjectIndex === -1) {
                alert('اسم المادة غير موجود في القائمة.');
                return;
            }
            const subjectEnName = allSubjectsEn[subjectIndex];
            if (!subjectEnName) {
                alert('لم يتم العثور على اسم المادة بالإنجليزية.');
                return;
            }
            const generatedSubjectId = `subj_${subjectEnName}_${gradeId}`;

            // Create Subject Object
            const subjectData = {
                subject_id: editingSubjectId || generatedSubjectId,
                name: subjectName,
                grade_id: Number(gradeId),
                weekly_periods: Number(weeklyPeriods)
            };

            // Save Data to Server
            saveData(subjectData);
        });
    } else {
        console.error('عنصر subjectForm غير موجود في HTML.');
    }

    // Save Data to Server
    function saveData(subjectData) {
        const url = editingSubjectId ? `/api/subjects/${editingSubjectId}` : '/api/subjects';
        const method = editingSubjectId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subjectData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    // Reload Subjects List
                    loadData();
                    // Reset Form
                    resetForm();
                }
            })
            .catch(error => {
                console.error('خطأ في حفظ البيانات:', error);
            });
    }

    // Reset Form
    function resetForm() {
        if (subjectForm) {
            subjectForm.reset();
            editingSubjectId = null;
            const formTitle = document.getElementById('formTitle');
            const saveBtn = document.getElementById('saveBtn');
            if (formTitle) formTitle.textContent = 'إضافة مادة جديدة';
            if (saveBtn) saveBtn.textContent = 'حفظ';
        }
    }

    // Handle Cancel Button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetForm();
        });
    }

    // Handle Edit and Delete Buttons
    const subjectsContainer = document.getElementById('subjectsContainer');
    if (subjectsContainer) {
        subjectsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-btn')) {
                const subjectId = e.target.getAttribute('data-id');
                editSubject(subjectId);
            } else if (e.target.classList.contains('delete-btn')) {
                const subjectId = e.target.getAttribute('data-id');
                deleteSubject(subjectId);
            }
        });
    } else {
        console.error('عنصر subjectsContainer غير موجود في HTML.');
    }

    // Edit Subject
    function editSubject(subjectId) {
        const subject = subjects.find(s => s.subject_id === subjectId);
        if (subject) {
            editingSubjectId = subject.subject_id;
            const subjectName = document.getElementById('subjectName');
            const gradeSelect = document.getElementById('gradeSelect');
            const weeklyPeriods = document.getElementById('weeklyPeriods');
            const formTitle = document.getElementById('formTitle');
            const saveBtn = document.getElementById('saveBtn');

            if (subjectName) subjectName.value = subject.name;
            if (gradeSelect) gradeSelect.value = subject.grade_id;
            if (weeklyPeriods) weeklyPeriods.value = subject.weekly_periods;
            if (formTitle) formTitle.textContent = 'تعديل بيانات المادة';
            if (saveBtn) saveBtn.textContent = 'تحديث';
        }
    }

    // Delete Subject
    function deleteSubject(subjectId) {
        if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
            fetch(`/api/subjects/${subjectId}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert(data.message);
                        // Reload Subjects List
                        loadData();
                    }
                })
                .catch(error => {
                    console.error('خطأ في حذف المادة:', error);
                });
        }
    }

    // Handle Show Chart Button
    const showChartBtn = document.getElementById('showChartBtn');
    if (showChartBtn) {
        showChartBtn.addEventListener('click', function() {
            openChartPopup();
        });
    }

    // Open Chart Popup
    function openChartPopup() {
        const popup = document.getElementById('chartPopup');
        if (popup) {
            popup.style.display = 'flex';
            renderChart();
        } else {
            console.error('عنصر chartPopup غير موجود في HTML.');
        }
    }

    // Close Chart Popup
    const closeChartPopup = document.getElementById('closeChartPopup');
    if (closeChartPopup) {
        closeChartPopup.addEventListener('click', function() {
            const popup = document.getElementById('chartPopup');
            if (popup) {
                popup.style.display = 'none';
            }
        });
    }

    // Render Chart using Chart.js
    function renderChart() {
        const ctx = document.getElementById('subjectsChart').getContext('2d');

        // Prepare data
        const labels = [];
        const dataCounts = [];

        allGrades.forEach((gradeName, index) => {
            const gradeId = allGradesId[index];
            const count = subjects.filter(subject => subject.grade_id === gradeId).length;
            labels.push(gradeName);
            dataCounts.push(count);
        });

        // Destroy existing chart if exists
        if (window.subjectsChartInstance) {
            window.subjectsChartInstance.destroy();
        }

        // Create new chart
        window.subjectsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'عدد المواد',
                    data: dataCounts,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'الصفوف الدراسية'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'عدد المواد'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }

    // Search Subjects
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tables = document.querySelectorAll('#subjectsContainer table');

            tables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const subjectId = row.cells[0].textContent.toLowerCase();
                    const subjectName = row.cells[1].textContent.toLowerCase();
                    const weeklyPeriods = row.cells[2].textContent.toLowerCase();
                    if (subjectId.includes(searchTerm) || subjectName.includes(searchTerm) || weeklyPeriods.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        });
    } else {
        console.error('عنصر searchInput غير موجود في HTML.');
    }
}

