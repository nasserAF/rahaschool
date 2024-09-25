document.addEventListener("DOMContentLoaded", function() {
    loadNavigationBar();
    initializePage();
});

function loadNavigationBar() {
    fetch('public/navigationbar.htm') // Updated to relative path
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
            console.error('خطأ في تحميل navigationbar.html:', error);
        });
}

let subjectsMap = {}; // لتخزين subject_id مع subject_name و grade_id
let selectedSubjects = []; // لتخزين المواد المختارة للمعلمة الحالية

function initializePage() {
    let teachers = [];
    let allGrades = [];
    let allGradesId = [];
    let editingTeacherId = null;

    // Load Data
    loadData();

    function loadData() {   
        // Load Config.json
        fetch('public/config.json') // Updated to relative path
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allGrades = data.all_grades;
                allGradesId = data.all_grades_id;
                populateGradeSelect();
                loadTeachers();
            })
            .catch(error => {
                console.error('خطأ في تحميل config.json:', error);
            });
    }

    function loadTeachers() {
        fetch('public/teachers.json') // Updated to relative path
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                teachers = data;
                displayTeachers();
            })
            .catch(error => {
                console.error('خطأ في تحميل teachers.json:', error);
            });
    }

    function displayTeachers() {
        const tableBody = document.querySelector('#teachersTable tbody');
        if (!tableBody) {
            console.error('عنصر teachersTable غير موجود في HTML.');
            return;
        }
        tableBody.innerHTML = '';
    
        // جلب بيانات المواد من الخادم
        fetch('public/subjects.json') // Updated to relative path
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(subjects => {
                // تحديث subjectsMap العالمي
                subjectsMap = {};
                subjects.forEach(subject => {
                    subjectsMap[subject.subject_id] = {
                        name: subject.name,
                        grade: subject.grade_id
                    };
                });

                // عرض المعلمات في الجدول
                teachers.forEach(teacher => {
                    const tr = document.createElement('tr');

                    // إنشاء خلية لرقم المعلمة واسم المعلمة
                    tr.innerHTML = `
                        <td>${teacher.teacher_id}</td>
                        <td>${teacher.name}</td>
                    `;

                    // عرض المواد بالصيغة المطلوبة "اسم المادة / الصف"
                    const subjectInfo = teacher.subjects.map(subjectId => {
                        const subject = subjectsMap[subjectId];
                        if (subject) {
                            return `${subject.name} / ${subject.grade}`;
                        } else {
                            console.warn(`Subject with ID ${subjectId} not found`);
                            return null;
                        }
                    }).filter(info => info !== null); // فلترة المواد التي لم يتم العثور عليها

                    // إنشاء خلية لعرض المواد
                    const subjectsCell = document.createElement('td');
                    subjectsCell.textContent = subjectInfo.join(', ');
                    tr.appendChild(subjectsCell);

                    // إنشاء خلية لعرض الصفوف بدون تكرار
                    const uniqueGrades = [...new Set(subjectInfo.map(info => {
                        const parts = info.split('/');
                        return parts.length > 1 ? parts[1].trim() : '';
                    }).filter(grade => grade !== ''))];
                    const uniqueGradesCell = document.createElement('td');
                    uniqueGradesCell.textContent = uniqueGrades.join(', ');
                    tr.appendChild(uniqueGradesCell);

                    // إنشاء عمود الإجراءات
                    const actionsCell = document.createElement('td');
                    actionsCell.innerHTML = `
                        <button class="btn btn-primary edit-btn" data-id="${teacher.teacher_id}">تعديل</button>
                        <button class="btn btn-danger delete-btn" data-id="${teacher.teacher_id}">حذف</button>
                    `;
                    tr.appendChild(actionsCell);

                    // إضافة الصف إلى الجدول
                    tableBody.appendChild(tr);
                });

                // إضافة مستمعي الأحداث بعد عرض المعلمات
                addEventListenersToActions();
            })
            .catch(error => {
                console.error('خطأ في تحميل subjects.json:', error);
            });
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

    // Add Subject to Selected Subjects
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', function() {
            const subjectSelect = document.getElementById('subjectSelect');
            const selectedSubjectsDiv = document.getElementById('selectedSubjects');

            if (subjectSelect && selectedSubjectsDiv) {
                const selectedOption = subjectSelect.options[subjectSelect.selectedIndex];
                if (selectedOption && selectedOption.value !== "") {
                    // التحقق مما إذا كانت المادة قد أضيفت بالفعل
                    const exists = selectedSubjects.includes(selectedOption.value);
                    if (!exists) {
                        const subjectId = selectedOption.value;
                        const subject = subjectsMap[subjectId];
                        if (subject) {
                            selectedSubjects.push(subjectId); // إضافة المعرف إلى القائمة
                            displaySelectedSubjects(selectedSubjects); // تحديث العرض
                        } else {
                            alert('المادة المحددة غير موجودة.');
                        }
                    } else {
                        alert('هذه المادة تم إضافتها بالفعل.');
                    }
                } else {
                    alert('يرجى اختيار مادة لإضافتها.');
                }
            }
        });
    }

    // Populate Subject Select based on Grade Selection
    const gradeSelectElement = document.getElementById('gradeSelect');
    if (gradeSelectElement) {
        gradeSelectElement.addEventListener('change', function() {
            const selectedGradeId = this.value;
            const subjectSelect = document.getElementById('subjectSelect');
            if (subjectSelect) {
                // Clear existing options
                subjectSelect.innerHTML = '<option value="">-- اختر المادة --</option>';
                if (selectedGradeId !== "") {
                    // Fetch subjects for the selected grade
                    fetch('public/subjects.json') // Updated to relative path
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            const filteredSubjects = data.filter(subject => subject.grade_id.toString() === selectedGradeId);
                            filteredSubjects.forEach(subject => {
                                const option = document.createElement('option');
                                option.value = subject.subject_id;
                                option.textContent = subject.name;
                                subjectSelect.appendChild(option);
                            });
                        })
                        .catch(error => {
                            console.error('خطأ في تحميل subjects.json:', error);
                        });
                }
            }
        });
    }

    // عرض المواد المختارة كأزرار مع إمكانية حذفها
    function displaySelectedSubjects(subjectIds) {
        const selectedSubjectsContainer = document.getElementById('selectedSubjects');
        selectedSubjectsContainer.innerHTML = ''; // تفريغ الحاوية أولاً

        subjectIds.forEach(subjectId => {
            const subject = subjectsMap[subjectId];
            if (subject) {
                const subjectDiv = document.createElement('div');
                subjectDiv.classList.add('selected-subject'); // استخدام الفئة الصحيحة

                // تعيين معرف المادة كخاصية بيانات
                subjectDiv.setAttribute('data-subject-id', subjectId);

                // محتوى الزر يتضمن اسم المادة والصف
                subjectDiv.textContent = `${subject.name} / ${subject.grade}`;

                // إنشاء علامة الحذف
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.classList.add('remove-subject');
                removeBtn.textContent = '×';

                // إضافة حدث الحذف
                removeBtn.addEventListener('click', () => {
                    removeSelectedSubject(subjectId);
                });

                // إضافة علامة الحذف إلى الزر
                subjectDiv.appendChild(removeBtn);

                // إضافة الزر إلى الحاوية
                selectedSubjectsContainer.appendChild(subjectDiv);
            }
        });
    }

    // إزالة المادة من المواد المختارة
    function removeSelectedSubject(subjectId) {
        const index = selectedSubjects.indexOf(subjectId);
        if (index !== -1) {
            selectedSubjects.splice(index, 1); // إزالة المادة من القائمة
            displaySelectedSubjects(selectedSubjects); // تحديث عرض المواد
        }
    }

    // Handle Edit Buttons
    function addEventListenersToActions() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const teacherId = this.getAttribute('data-id');
                const teacher = teachers.find(t => t.teacher_id === teacherId);

                if (teacher) {
                    document.getElementById('teacherId').value = teacher.teacher_id;
                    document.getElementById('teacherName').value = teacher.name;

                    // عرض المواد المختارة باستخدام الدالة الجديدة
                    selectedSubjects = [...teacher.subjects]; // نسخ قائمة المواد الحالية
                    displaySelectedSubjects(selectedSubjects); // عرضها في الأسفل

                    // باقي الإجراءات الخاصة بالتعديل
                    // Note: Since write operations are not possible on GitHub Pages,
                    // you might want to disable editing functionalities or implement them using localStorage.
                    alert('تعديل المعلمة غير مدعوم على هذا النظام.');
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const teacherId = this.getAttribute('data-id');
                deleteTeacher(teacherId);
            });
        });
    }

    // Handle Form Submission
    const teacherForm = document.getElementById('teacherForm');
    if (teacherForm) {
        teacherForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // جمع بيانات النموذج
            const teacherIdInput = document.getElementById('teacherId');
            const teacherNameInput = document.getElementById('teacherName');
            const gradeSelect = document.getElementById('gradeSelect');
            const selectedSubjectsDiv = document.getElementById('selectedSubjects');

            if (teacherIdInput && teacherNameInput && gradeSelect && selectedSubjectsDiv) {
                const teacherId = teacherIdInput.value.trim();
                const teacherName = teacherNameInput.value.trim();
                const gradeId = gradeSelect.value;
                // استخدام 'data-subject-id' بدلاً من 'data.subjectId'
                const selectedSubjectsList = Array.from(selectedSubjectsDiv.children).map(div => div.getAttribute('data-subject-id'));

                if (!teacherId || !teacherName || !gradeId || selectedSubjectsList.length === 0) {
                    alert('يرجى ملء جميع الحقول وإضافة مواد.');
                    return;
                }

                const teacherData = {
                    teacher_id: editingTeacherId || teacherId,
                    name: teacherName,
                    subjects: selectedSubjectsList
                };

                // حفظ البيانات إلى الخادم
                // Since GitHub Pages does not support server-side operations,
                // this functionality is disabled.
                alert('حفظ بيانات المعلمة غير مدعوم على هذا النظام.');
                // Uncomment the following line if you have a backend server to handle save operations.
                // saveTeacher(teacherData);
            }
        });
    } else {
        console.error('عنصر teacherForm غير موجود في HTML.');
    }

    // Save Teacher Data to Server
    function saveTeacher(teacherData) {
        // Since GitHub Pages does not support server-side operations,
        // this function will not work. You need a separate backend server.
        /*
        const url = editingTeacherId ? `/api/teachers/${editingTeacherId}` : '/api/teachers';
        const method = editingTeacherId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teacherData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                loadTeachers(); // إعادة تحميل قائمة المعلمات
                resetForm(); // إعادة تعيين النموذج
            }
        })
        .catch(error => {
            console.error('خطأ في حفظ بيانات المعلمة:', error);
        });
        */
        console.warn('حفظ بيانات المعلمة غير مدعوم على هذا النظام.');
    }

    // Reset Form
    function resetForm() {
        if (teacherForm) {
            teacherForm.reset();
            editingTeacherId = null;
            const formTitle = document.getElementById('formTitle');
            const saveBtn = document.getElementById('saveBtn');
            if (formTitle) formTitle.textContent = 'إضافة معلمة جديدة';
            if (saveBtn) saveBtn.textContent = 'حفظ';

            const selectedSubjectsDiv = document.getElementById('selectedSubjects');
            if (selectedSubjectsDiv) {
                selectedSubjectsDiv.innerHTML = '';
            }
        }
    }

    // Handle Cancel Button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            resetForm();
        });
    }

    // Handle Edit and Delete Buttons within Teachers Table
    const teachersTable = document.getElementById('teachersTable');
    if (teachersTable) {
        teachersTable.addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-btn')) {
                const teacherId = e.target.getAttribute('data-id');
                editTeacher(teacherId);
            } else if (e.target.classList.contains('delete-btn')) {
                const teacherId = e.target.getAttribute('data-id');
                deleteTeacher(teacherId);
            }
        });
    }

    // Edit Teacher
    function editTeacher(teacherId) {
        const teacher = teachers.find(t => t.teacher_id === teacherId);
        if (teacher) {
            editingTeacherId = teacher.teacher_id;
            const teacherIdInput = document.getElementById('teacherId');
            const teacherNameInput = document.getElementById('teacherName');
            const gradeSelect = document.getElementById('gradeSelect');
            const selectedSubjectsDiv = document.getElementById('selectedSubjects');
            const formTitle = document.getElementById('formTitle');
            const saveBtn = document.getElementById('saveBtn');

            if (teacherIdInput) teacherIdInput.value = teacher.teacher_id;
            if (teacherNameInput) teacherNameInput.value = teacher.name;
            if (gradeSelect) gradeSelect.value = getGradeIdBySubjectIds(teacher.subjects);

            if (selectedSubjectsDiv) {
                selectedSubjectsDiv.innerHTML = '';
                selectedSubjects = [...teacher.subjects]; // تحديث قائمة المواد المختارة
                displaySelectedSubjects(selectedSubjects); // عرض المواد كأزرار
            }

            if (formTitle) formTitle.textContent = 'تعديل بيانات المعلمة';
            if (saveBtn) saveBtn.textContent = 'تحديث';
        }
    }

    // Delete Teacher
    function deleteTeacher(teacherId) {
        if (confirm('هل أنت متأكد من حذف هذه المعلمة؟')) {
            // Since GitHub Pages does not support server-side operations,
            // this functionality is disabled.
            alert('حذف المعلمة غير مدعوم على هذا النظام.');
            /*
            fetch(`/api/teachers/${teacherId}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert(data.message);
                        loadTeachers(); // دالة لإعادة تحميل قائمة المعلمات
                    }
                })
                .catch(error => {
                    console.error('خطأ في حذف المعلمة:', error);
                });
            */
        }
    }

    // Get Subject Name by ID
    function getSubjectNameById(subjectId) {
        // Fetch subjects from server
        // Since GitHub Pages does not support server-side operations,
        // this functionality is disabled.
        /*
        return fetch('public/subjects.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const subject = data.find(s => s.subject_id === subjectId);
                return subject ? subject.name : null;
            })
            .catch(error => {
                console.error('خطأ في جلب بيانات المواد:', error);
                return null;
            });
        */
        console.warn('جلب بيانات المادة غير مدعوم على هذا النظام.');
        return null;
    }

    // Get Grade ID by Subject IDs
    function getGradeIdBySubjectIds(subjectIds) {
        if (subjectIds.length > 0) {
            const firstSubjectId = subjectIds[0];
            const subject = subjectsMap[firstSubjectId];
            return subject ? subject.grade : "";
        }
        return "";
    }

    // Search Teachers
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#teachersTable tbody tr');

            tableRows.forEach(row => {
                const teacherId = row.cells[0].textContent.toLowerCase();
                const teacherName = row.cells[1].textContent.toLowerCase();
                const subjects = row.cells[2].textContent.toLowerCase();
                if (teacherId.includes(searchTerm) || teacherName.includes(searchTerm) || subjects.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}
