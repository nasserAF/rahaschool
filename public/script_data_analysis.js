// script_data_analysis.js

// --------- teachers.json queries -------------

// 1. عدد المعلمات
async function getNumberOfTeachers() {
    try {
        const response = await fetch('/teachers.json');
        const teachers = await response.json();
        console.log(`عدد المعلمات: ${teachers.length}`);
    } catch (error) {
        console.error('خطأ في الحصول على عدد المعلمات:', error);
    }
}

// 2. رقم المعلمة واسمها (t-001)
async function getTeacherIdAndName() {
    try {
        const response = await fetch('/teachers.json');
        const teachers = await response.json();
        console.log('\r\nرقم المعلمة واسمها:');
        teachers.forEach(teacher => {
            console.log(`رقم المعلمة: ${teacher.teacher_id}, اسمها: ${teacher.name}`);
        });
    } catch (error) {
        console.error('خطأ في الحصول على أرقام وأسماء المعلمات:', error);
    }
}

// 3. عدد المواد التي تدرسها كل معلمة
async function getNumberOfSubjectsPerTeacher() {
    try {
        const response = await fetch('/teachers.json');
        const teachers = await response.json();
        console.log('\r\nعدد المواد التي تدرسها كل معلمة:');
        teachers.forEach(teacher => {
            console.log(`المعلمة: ${teacher.name}, عدد المواد: ${teacher.subjects.length}`);
        });
    } catch (error) {
        console.error('خطأ في الحصول على عدد المواد لكل معلمة:', error);
    }
}

// 4. أسماء المواد التي تدرسها كل معلمة مع الصف
async function getSubjectsWithGradesPerTeacher() {
    try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
            fetch('/teachers.json'),
            fetch('/subjects.json')
        ]);
        const teachers = await teachersResponse.json();
        const subjects = await subjectsResponse.json();

        // إنشاء خريطة للمواد بناءً على subject_id
        const subjectMap = {};
        subjects.forEach(subject => {
            subjectMap[subject.subject_id] = subject;
        });

        console.log('\r\nأسماء المواد التي تدرسها كل معلمة مع الصف:');
        teachers.forEach(teacher => {
            console.log(`المعلمة: ${teacher.name}`);
            teacher.subjects.forEach(subjectId => {
                const subject = subjectMap[subjectId];
                if (subject) {
                    console.log(` - ${subject.name} - الصف ${subject.grade_id}`);
                } else {
                    console.log(` - مادة غير معرفة (${subjectId})`);
                }
            });
        });
    } catch (error) {
        console.error('خطأ في الحصول على أسماء المواد مع الصفوف لكل معلمة:', error);
    }
}

// 5. عدد الحصص التي تدرسها كل معلمة بناءً على المادة وعدد الحصص الأسبوعية
async function getNumberOfPeriodsPerTeacher() {
    try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
            fetch('/teachers.json'),
            fetch('/subjects.json')
        ]);
        const teachers = await teachersResponse.json();
        const subjects = await subjectsResponse.json();

        // إنشاء خريطة للمواد بناءً على subject_id مع عدد الحصص الأسبوعية
        const subjectPeriodsMap = {};
        subjects.forEach(subject => {
            subjectPeriodsMap[subject.subject_id] = subject.weekly_periods;
        });

        console.log('\r\nعدد الحصص التي تدرسها كل معلمة:');
        teachers.forEach(teacher => {
            let totalPeriods = 0;
            teacher.subjects.forEach(subjectId => {
                const periods = subjectPeriodsMap[subjectId] || 0;
                totalPeriods += periods;
            });
            console.log(`المعلمة: ${teacher.name}, عدد الحصص: ${totalPeriods}`);
        });
    } catch (error) {
        console.error('خطأ في حساب عدد الحصص لكل معلمة:', error);
    }
}

// 6. أرقام وأسماء المعلمات التي تجاوزن الحد الأقصى لعدد الحصص الأسبوعي (35 حصة)
async function getTeachersExceedingMaxPeriods() {
    try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
            fetch('/teachers.json'),
            fetch('/subjects.json')
        ]);
        const teachers = await teachersResponse.json();
        const subjects = await subjectsResponse.json();

        // إنشاء خريطة للمواد بناءً على subject_id مع عدد الحصص الأسبوعية
        const subjectPeriodsMap = {};
        subjects.forEach(subject => {
            subjectPeriodsMap[subject.subject_id] = subject.weekly_periods;
        });

        console.log('\r\nالمعلمات التي تجاوزن الحد الأقصى لعدد الحصص الأسبوعي (35 حصة):');
        teachers.forEach(teacher => {
            let totalPeriods = 0;
            teacher.subjects.forEach(subjectId => {
                const periods = subjectPeriodsMap[subjectId] || 0;
                totalPeriods += periods;
            });
            if (totalPeriods > 35) {
                console.log(`رقم المعلمة: ${teacher.teacher_id}, اسمها: ${teacher.name}, عدد الحصص: ${totalPeriods}`);
            }
        });
    } catch (error) {
        console.error('خطأ في تحديد المعلمات التي تجاوزن الحد الأقصى للحصص:', error);
    }
}

// 7. عدد المعلمات لكل مادة
async function getNumberOfTeachersPerSubject() {
    try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
            fetch('/teachers.json'),
            fetch('/subjects.json')
        ]);
        const teachers = await teachersResponse.json();
        const subjects = await subjectsResponse.json();

        // إنشاء خريطة للمواد بناءً على subject_id مع أسماء المواد
        const subjectMap = {};
        subjects.forEach(subject => {
            subjectMap[subject.subject_id] = subject.name;
        });

        // إنشاء خريطة لعد المعلمات لكل مادة
        const subjectTeacherCount = {};
        teachers.forEach(teacher => {
            teacher.subjects.forEach(subjectId => {
                const subjectName = subjectMap[subjectId] || `مادة غير معرفة (${subjectId})`;
                if (subjectTeacherCount[subjectName]) {
                    subjectTeacherCount[subjectName] += 1;
                } else {
                    subjectTeacherCount[subjectName] = 1;
                }
            });
        });

        console.log('\r\nعدد المعلمات لكل مادة:');
        for (const subjectName in subjectTeacherCount) {
            console.log(`مادة ${subjectName}: ${subjectTeacherCount[subjectName]} معلمات`);
        }
    } catch (error) {
        console.error('خطأ في حساب عدد المعلمات لكل مادة:', error);
    }
}

// --------- End of teachers.json queries -------------

// --------- subjects.json queries -------------

// 1. عدد جميع المواد
async function getNumberOfSubjects() {
    try {
        const response = await fetch('/subjects.json');
        const subjects = await response.json();
        console.log(`\r\nعدد جميع المواد: ${subjects.length}`);
    } catch (error) {
        console.error('خطأ في الحصول على عدد جميع المواد:', error);
    }
}

// 2. عدد المواد لكل صف
async function getNumberOfSubjectsPerGrade() {
    try {
        const [subjectsResponse, gradesSectionsResponse] = await Promise.all([
            fetch('/subjects.json'),
            fetch('/grades_sections.json')
        ]);
        const subjects = await subjectsResponse.json();
        const gradesSections = await gradesSectionsResponse.json();

        // إنشاء خريطة لعد المواد لكل grade_id
        const subjectsPerGrade = {};
        subjects.forEach(subject => {
            const gradeId = subject.grade_id;
            if (subjectsPerGrade[gradeId]) {
                subjectsPerGrade[gradeId] += 1;
            } else {
                subjectsPerGrade[gradeId] = 1;
            }
        });

        console.log('\r\nعدد المواد لكل صف:');
        gradesSections.forEach(grade => {
            const gradeId = grade.grade_id;
            const gradeName = grade.grade_name;
            const count = subjectsPerGrade[gradeId] || 0;
            console.log(`الصف ${gradeName}: ${count} مواد`);
        });
    } catch (error) {
        console.error('خطأ في الحصول على عدد المواد لكل صف:', error);
    }
}

// 3. رقم (id) واسم المادة وعدد الحصص الاسبوعية (weekly_periods) لكل صف
async function getSubjectDetailsPerGrade() {
    try {
        const response = await fetch('/subjects.json');
        const subjects = await response.json();
        console.log('\r\nتفاصيل المواد لكل صف:');
        subjects.forEach(subject => {
            console.log(`رقم المادة: ${subject.subject_id}, اسم المادة: ${subject.name}, عدد الحصص الأسبوعية: ${subject.weekly_periods}, الصف: ${subject.grade_id}`);
        });
    } catch (error) {
        console.error('خطأ في الحصول على تفاصيل المواد لكل صف:', error);
    }
}

// 4. مجموع weekly_periods لكل صف
async function getTotalWeeklyPeriodsPerGrade() {
    try {
        const response = await fetch('/subjects.json');
        const subjects = await response.json();

        // إنشاء خريطة لمجموع الحصص الأسبوعية لكل grade_id
        const totalPeriodsPerGrade = {};
        subjects.forEach(subject => {
            const gradeId = subject.grade_id;
            if (totalPeriodsPerGrade[gradeId]) {
                totalPeriodsPerGrade[gradeId] += subject.weekly_periods;
            } else {
                totalPeriodsPerGrade[gradeId] = subject.weekly_periods;
            }
        });

        console.log('\r\nمجموع الحصص الأسبوعية لكل صف:');
        for (const gradeId in totalPeriodsPerGrade) {
            console.log(`الصف ${gradeId}: ${totalPeriodsPerGrade[gradeId]} حصص`);
        }
    } catch (error) {
        console.error('خطأ في حساب مجموع الحصص الأسبوعية لكل صف:', error);
    }
}

// --------- End of subjects.json queries -------------

// --------- grades_sections.json queries -------------

// 1. عدد جميع الصفوف
async function getNumberOfGrades() {
    try {
        const response = await fetch('/grades_sections.json');
        const gradesSections = await response.json();
        console.log(`\r\nعدد جميع الصفوف: ${gradesSections.length}`);
    } catch (error) {
        console.error('خطأ في الحصول على عدد جميع الصفوف:', error);
    }
}

// 2. عدد جميع الشعب
async function getNumberOfSections() {
    try {
        const response = await fetch('/grades_sections.json');
        const gradesSections = await response.json();
        let totalSections = 0;
        gradesSections.forEach(grade => {
            totalSections += grade.sections.length;
        });
        console.log(`\r\nعدد جميع الشعب: ${totalSections}`);
    } catch (error) {
        console.error('خطأ في الحصول على عدد جميع الشعب:', error);
    }
}

// 3. عدد الشعب لكل صف
async function getNumberOfSectionsPerGrade() {
    try {
        const response = await fetch('/grades_sections.json');
        const gradesSections = await response.json();
        console.log('\r\nعدد الشعب لكل صف:');
        gradesSections.forEach(grade => {
            console.log(`الصف ${grade.grade_name}: ${grade.sections.length} شعب`);
        });
    } catch (error) {
        console.error('خطأ في الحصول على عدد الشعب لكل صف:', error);
    }
}

// 4. الحصص اليومية لكل شعبة بالطريقة التالية (الصف - الشعبة  (اليوم-عدد الحصص، اليوم - عدد الحصص))
async function getDailyPeriodsPerSection() {
    try {
        const [gradesSectionsResponse, subjectsResponse, allSchedulesResponse] = await Promise.all([
            fetch('/grades_sections.json'),
            fetch('/subjects.json'),
            fetch('/all_schedules.json')
        ]);
        const gradesSections = await gradesSectionsResponse.json();
        const subjects = await subjectsResponse.json();
        const allSchedules = await allSchedulesResponse.json();

        // إنشاء خريطة للمواد بناءً على subject_id مع عدد الحصص الأسبوعية
        const subjectPeriodsMap = {};
        subjects.forEach(subject => {
            subjectPeriodsMap[subject.subject_id] = subject.weekly_periods;
        });

        console.log('\r\nالحصص اليومية لكل شعبة:');
        gradesSections.forEach(grade => {
            const gradeName = grade.grade_name;
            grade.sections.forEach(section => {
                const sectionName = section.section_name;
                const sectionId = section.section_id;
                const schedule = allSchedules[sectionId]?.schedule;

                if (schedule) {
                    console.log(`الصف ${gradeName} - الشعبة ${sectionName}:`);
                    for (const day in schedule) {
                        const periods = schedule[day].filter(entry => entry !== '---' && entry !== 'استراحة');
                        console.log(`  ${day}: ${periods.length} حصص`);
                    }
                } else {
                    console.log(`الصف ${gradeName} - الشعبة ${sectionName}: لا توجد بيانات`);
                }
            });
        });
    } catch (error) {
        console.error('خطأ في الحصول على الحصص اليومية لكل شعبة:', error);
    }
}

// --------- End of grades_sections.json queries -------------

// --------- all_schedules.json queries -------------

// 1. عدد جميع الجداول
async function getNumberOfSchedules() {
    try {
        const response = await fetch('/all_schedules.json');
        const allSchedules = await response.json();
        console.log(`\r\nعدد جميع الجداول: ${Object.keys(allSchedules).length}`);
    } catch (error) {
        console.error('خطأ في الحصول على عدد جميع الجداول:', error);
    }
}

// 2. عدد الجداول لكل صف
async function getNumberOfSchedulesPerGrade() {
    try {
        const [allSchedulesResponse, gradesSectionsResponse] = await Promise.all([
            fetch('/all_schedules.json'),
            fetch('/grades_sections.json')
        ]);
        const allSchedules = await allSchedulesResponse.json();
        const gradesSections = await gradesSectionsResponse.json();

        // إنشاء خريطة للصفوف بناءً على section_id
        const sectionGradeMap = {};
        gradesSections.forEach(grade => {
            grade.sections.forEach(section => {
                sectionGradeMap[section.section_id] = grade.grade_name;
            });
        });

        // إنشاء خريطة لعد الجداول لكل صف
        const schedulesPerGrade = {};
        for (const sectionId in allSchedules) {
            const gradeName = sectionGradeMap[sectionId];
            if (gradeName) {
                if (schedulesPerGrade[gradeName]) {
                    schedulesPerGrade[gradeName] += 1;
                } else {
                    schedulesPerGrade[gradeName] = 1;
                }
            } else {
                if (schedulesPerGrade['غير معرف']) {
                    schedulesPerGrade['غير معرف'] += 1;
                } else {
                    schedulesPerGrade['غير معرف'] = 1;
                }
            }
        }

        console.log('\r\nعدد الجداول لكل صف:');
        for (const gradeName in schedulesPerGrade) {
            console.log(`الصف ${gradeName}: ${schedulesPerGrade[gradeName]} جداول`);
        }
    } catch (error) {
        console.error('خطأ في الحصول على عدد الجداول لكل صف:', error);
    }
}

// 3. عدد المواد المسجلة لكل جدول
async function getNumberOfSubjectsPerSchedule() {
    try {
        const response = await fetch('/all_schedules.json');
        const allSchedules = await response.json();
        console.log('\r\nعدد المواد المسجلة لكل جدول:');
        for (const sectionId in allSchedules) {
            const section = allSchedules[sectionId];
            const totalSubjects = section.schedule["الأحد"].filter(entry => entry !== '---' && entry !== 'استراحة').length;
            console.log(`شعبة ${section.section_name} - الصف ${section.grade_name}: ${totalSubjects} مواد`);
        }
    } catch (error) {
        console.error('خطأ في الحصول على عدد المواد المسجلة لكل جدول:', error);
    }
}

// 4. إجمالي المواد المسجلة / الحد الأقصى لعدد المواد الأسبوعي
async function getTotalSubjectsRegisteredVsMax() {
    try {
        const [allSchedulesResponse, configResponse] = await Promise.all([
            fetch('/all_schedules.json'),
            fetch('/config.json')
        ]);
        const allSchedules = await allSchedulesResponse.json();
        const config = await configResponse.json();
        const maxSubjectsPerWeek = config.max_periods_per_day; // Assuming this represents the max subjects

        console.log('\r\nإجمالي المواد المسجلة / الحد الأقصى لعدد المواد الأسبوعي:');
        for (const sectionId in allSchedules) {
            const section = allSchedules[sectionId];
            const totalRegistered = section.schedule["الأحد"].filter(entry => entry !== '---' && entry !== 'استراحة').length;
            const ratio = `${totalRegistered} / ${maxSubjectsPerWeek}`;
            console.log(`شعبة ${section.section_name} - الصف ${section.grade_name}: ${ratio}`);
        }
    } catch (error) {
        console.error('خطأ في حساب إجمالي المواد المسجلة مقابل الحد الأقصى:', error);
    }
}

// 5. الجدول الأسبوعي لكل شعبة على الشكل التالي (اليوم: الحصة الأولى، الحصة الثانية، الحصة الثالثة،.....)
async function getWeeklySchedulePerSection() {
    try {
        const response = await fetch('/all_schedules.json');
        const allSchedules = await response.json();

        console.log('\r\nالجدول الأسبوعي لكل شعبة:');
        for (const sectionId in allSchedules) {
            const section = allSchedules[sectionId];
            console.log(`شعبة ${section.section_name} - الصف ${section.grade_name}:`);
            for (const day in section.schedule) {
                const periods = section.schedule[day].join(', ');
                console.log(`  ${day}: ${periods}`);
            }
        }
    } catch (error) {
        console.error('خطأ في الحصول على الجدول الأسبوعي لكل شعبة:', error);
    }
}

// --------- End of all_schedules.json queries -------------
getNumberOfTeachers();
getTeacherIdAndName();
getNumberOfSubjectsPerTeacher();
getSubjectsWithGradesPerTeacher();
getNumberOfPeriodsPerTeacher();
getTeachersExceedingMaxPeriods();
getNumberOfTeachersPerSubject();

getNumberOfSubjects();
getNumberOfSubjectsPerGrade();
getSubjectDetailsPerGrade();
getTotalWeeklyPeriodsPerGrade();

getNumberOfGrades();
getNumberOfSections();
getNumberOfSectionsPerGrade();
getDailyPeriodsPerSection();

getNumberOfSchedules();
getNumberOfSchedulesPerGrade();
getNumberOfSubjectsPerSchedule();
getTotalSubjectsRegisteredVsMax();
getWeeklySchedulePerSection();
