//  النسخة القديمة قبل تعديلها من اجل عرض الجداول المولدة
// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;


// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Helper function to read JSON files
const readJSONFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, filePath), 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const parsed = JSON.parse(data);
                resolve(parsed);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
};

// Helper function to write JSON files
const writeJSONFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, filePath), JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

/* ----------------------- API Endpoints for Teachers ----------------------- */

// Get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await readJSONFile('/teachers.json');
        res.json(teachers);
    } catch (error) {
        console.error('Error reading teachers.json:', error);
        res.status(500).json({ error: 'خطأ في قراءة بيانات المعلمات.' });
    }
});

// Add a new teacher
app.post('/api/teachers', async (req, res) => {
    const newTeacher = req.body;

    if (!newTeacher.teacher_id || !newTeacher.name || !newTeacher.subjects) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let teachers = await readJSONFile('/teachers.json');

        // Check for duplicate teacher_id
        if (teachers.some(t => t.teacher_id === newTeacher.teacher_id)) {
            return res.status(400).json({ error: 'رقم المعلمة موجود بالفعل.' });
        }

        teachers.push(newTeacher);
        await writeJSONFile('teachers.json', teachers);
        res.json({ message: 'تم حفظ البيانات بنجاح.' });
    } catch (error) {
        console.error('Error writing to teachers.json:', error);
        res.status(500).json({ error: 'خطأ في حفظ بيانات المعلمة.' });
    }
});

// Update an existing teacher
app.put('/api/teachers/:id', async (req, res) => {
    const teacherId = req.params.id;
    const updatedTeacher = req.body;

    if (!updatedTeacher.teacher_id || !updatedTeacher.name || !updatedTeacher.subjects) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let teachers = await readJSONFile('/teachers.json');
        const index = teachers.findIndex(t => t.teacher_id === teacherId);

        if (index === -1) {
            return res.status(404).json({ error: 'لم يتم العثور على المعلمة.' });
        }

        // If teacher_id is being updated, ensure the new ID is unique
        if (teacherId !== updatedTeacher.teacher_id && teachers.some(t => t.teacher_id === updatedTeacher.teacher_id)) {
            return res.status(400).json({ error: 'رقم المعلمة الجديد موجود بالفعل.' });
        }

        teachers[index] = updatedTeacher;
        await writeJSONFile('teachers.json', teachers);
        res.json({ message: 'تم تحديث البيانات بنجاح.' });
    } catch (error) {
        console.error('Error updating teachers.json:', error);
        res.status(500).json({ error: 'خطأ في تحديث بيانات المعلمة.' });
    }
});

// Delete a teacher
app.delete('/api/teachers/:id', async (req, res) => {
  const teacherId = req.params.id;

  try {
      let teachers = await readJSONFile('/teachers.json');
      const index = teachers.findIndex(t => t.teacher_id === teacherId);

      if (index === -1) {
          return res.status(404).json({ error: 'لم يتم العثور على المعلمة.' });
      }

      teachers.splice(index, 1);
      await writeJSONFile('teachers.json', teachers);
      res.json({ message: 'تم حذف المعلمة بنجاح.' });
  } catch (error) {
      console.error('Error deleting from teachers.json:', error);
      res.status(500).json({ error: 'خطأ في حذف المعلمة.' });
  }
});

/* ----------------------- API Endpoints for Subjects ----------------------- */

// Get all subjects
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await readJSONFile('/subjects.json');
        res.json(subjects);
    } catch (error) {
        console.error('Error reading subjects.json:', error);
        res.status(500).json({ error: 'خطأ في قراءة بيانات المواد.' });
    }
});

// Add a new subject
app.post('/api/subjects', async (req, res) => {
    const newSubject = req.body;

    if (!newSubject.subject_id || !newSubject.name || !newSubject.grade_id || !newSubject.weekly_periods) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let subjects = await readJSONFile('/subjects.json');

        // Check for duplicate subject_id
        if (subjects.some(s => s.subject_id === newSubject.subject_id)) {
            return res.status(400).json({ error: 'معرف المادة موجود بالفعل.' });
        }

        subjects.push(newSubject);
        await writeJSONFile('subjects.json', subjects);
        res.json({ message: 'تم حفظ البيانات بنجاح.' });
    } catch (error) {
        console.error('Error writing to subjects.json:', error);
        res.status(500).json({ error: 'خطأ في حفظ بيانات المادة.' });
    }
});

// Update an existing subject
app.put('/api/subjects/:id', async (req, res) => {
    const subjectId = req.params.id;
    const updatedSubject = req.body;

    if (!updatedSubject.subject_id || !updatedSubject.name || !updatedSubject.grade_id || !updatedSubject.weekly_periods) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let subjects = await readJSONFile('/subjects.json');
        const index = subjects.findIndex(s => s.subject_id === subjectId);

        if (index === -1) {
            return res.status(404).json({ error: 'لم يتم العثور على المادة.' });
        }

        // If subject_id is being updated, ensure the new ID is unique
        if (subjectId !== updatedSubject.subject_id && subjects.some(s => s.subject_id === updatedSubject.subject_id)) {
            return res.status(400).json({ error: 'معرف المادة الجديد موجود بالفعل.' });
        }

        subjects[index] = updatedSubject;
        await writeJSONFile('subjects.json', subjects);
        res.json({ message: 'تم تحديث البيانات بنجاح.' });
    } catch (error) {
        console.error('Error updating subjects.json:', error);
        res.status(500).json({ error: 'خطأ في تحديث بيانات المادة.' });
    }
});

// Delete a subject
app.delete('/api/subjects/:id', async (req, res) => {
    const subjectId = req.params.id;

    try {
        let subjects = await readJSONFile('/subjects.json');
        const index = subjects.findIndex(s => s.subject_id === subjectId);

        if (index === -1) {
            return res.status(404).json({ error: 'لم يتم العثور على المادة.' });
        }

        subjects.splice(index, 1);
        await writeJSONFile('subjects.json', subjects);
        res.json({ message: 'تم حذف المادة بنجاح.' });
    } catch (error) {
        console.error('Error deleting from subjects.json:', error);
        res.status(500).json({ error: 'خطأ في حذف المادة.' });
    }
});

/* ----------------------- API Endpoints for Grades and Sections ----------------------- */

// Create a new grade with the first section
app.post('/api/grades_sections', async (req, res) => {
    const { grade_id, grade_name, periods_per_day, sections } = req.body;

    if (!grade_id || !grade_name || !periods_per_day || !sections) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let gradesSections = await readJSONFile('grades_sections.json');

        // التحقق من عدم تكرار grade_id
        if (gradesSections.some(g => g.grade_id === grade_id)) {
            return res.status(400).json({ error: 'معرف الصف موجود بالفعل.' });
        }

        // إضافة الصف الدراسي الجديد
        gradesSections.push({
            grade_id,
            grade_name,
            periods_per_day,
            sections
        });

        await writeJSONFile('grades_sections.json', gradesSections);
        res.json({ message: 'تمت إضافة الصف والشُعبة بنجاح.' });
    } catch (error) {
        console.error('Error writing to grades_sections.json:', error);
        res.status(500).json({ error: 'خطأ في إضافة الصف الدراسي.' });
    }
});

// Add a new section to a specific grade
app.post('/api/grades_sections/:gradeId/sections', async (req, res) => {
    const gradeId = parseInt(req.params.gradeId, 10);
    const { section_id, section_name } = req.body;

    if (!section_id || !section_name) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    try {
        let gradesSections = await readJSONFile('grades_sections.json');
        const grade = gradesSections.find(g => g.grade_id === gradeId);

        if (!grade) {
            return res.status(404).json({ error: 'لم يتم العثور على الصف الدراسي.' });
        }

        // التحقق من عدم تكرار section_id
        if (grade.sections.some(sec => sec.section_id === section_id)) {
            return res.status(400).json({ error: 'معرف الشُعبة موجود بالفعل.' });
        }

        grade.sections.push({ section_id, section_name });
        await writeJSONFile('grades_sections.json', gradesSections);
        res.json({ message: 'تمت إضافة الشُعبة بنجاح.' });
    } catch (error) {
        console.error('Error writing to grades_sections.json:', error);
        res.status(500).json({ error: 'خطأ في إضافة الشُعبة.' });
    }
});

// Add a new section to a specific grade
app.post('/api/grades_sections/:gradeId/sections', async (req, res) => {
  const gradeId = parseInt(req.params.gradeId, 10);
  const { section_id, section_name } = req.body;

  if (!section_id || !section_name) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
  }

  try {
      let gradesSections = await readJSONFile('grades_sections.json');
      const grade = gradesSections.find(g => g.grade_id === gradeId);

      if (!grade) {
          return res.status(404).json({ error: 'لم يتم العثور على الصف الدراسي.' });
      }

      // التحقق من عدم تكرار section_id
      if (grade.sections.some(sec => sec.section_id === section_id)) {
          return res.status(400).json({ error: 'معرف الشُعبة موجود بالفعل.' });
      }

      grade.sections.push({ section_id, section_name });
      await writeJSONFile('grades_sections.json', gradesSections);
      res.json({ message: 'تمت إضافة الشُعبة بنجاح.' });
  } catch (error) {
      console.error('Error writing to grades_sections.json:', error);
      res.status(500).json({ error: 'خطأ في إضافة الشُعبة.' });
  }
});

// Update an existing section
app.put('/api/grades_sections/sections/:sectionId', async (req, res) => {
  const sectionId = req.params.sectionId;
  const { section_name } = req.body;

  if (!section_name) {
      return res.status(400).json({ error: 'اسم الشُعبة مطلوب.' });
  }

  try {
      let gradesSections = await readJSONFile('grades_sections.json');
      let sectionFound = false;

      for (let grade of gradesSections) {
          const section = grade.sections.find(sec => sec.section_id === sectionId);
          if (section) {
              section.section_name = section_name;
              sectionFound = true;
              break;
          }
      }

      if (!sectionFound) {
          return res.status(404).json({ error: 'لم يتم العثور على الشُعبة.' });
      }

      await writeJSONFile('grades_sections.json', gradesSections);
      res.json({ message: 'تم تحديث الشُعبة بنجاح.' });
  } catch (error) {
      console.error('Error updating grades_sections.json:', error);
      res.status(500).json({ error: 'خطأ في تحديث الشُعبة.' });
  }
});

// Delete a section
app.delete('/api/grades_sections/sections/:sectionId', async (req, res) => {
  const sectionId = req.params.sectionId;

  try {
      let gradesSections = await readJSONFile('grades_sections.json');
      let sectionFound = false;

      for (let grade of gradesSections) {
          const index = grade.sections.findIndex(sec => sec.section_id === sectionId);
          if (index !== -1) {
              grade.sections.splice(index, 1);
              sectionFound = true;
              break;
          }
      }

      if (!sectionFound) {
          return res.status(404).json({ error: 'لم يتم العثور على الشُعبة.' });
      }

      await writeJSONFile('grades_sections.json', gradesSections);
      res.json({ message: 'تم حذف الشُعبة بنجاح.' });
  } catch (error) {
      console.error('Error deleting from grades_sections.json:', error);
      res.status(500).json({ error: 'خطأ في حذف الشُعبة.' });
  }
});

// Add this route to handle fetching sections for a specific grade
app.post('/api/grades_sections', async (req, res) => {
    try {
        const newGrade = req.body; // البيانات التي يتم إرسالها من العميل

        // قراءة ملف grades_sections.json
        let gradesSections = await readJSONFile('grades_sections.json');

        // التحقق مما إذا كان الصف موجودًا مسبقًا
        const existingGrade = gradesSections.find(g => g.grade_id === newGrade.grade_id);
        if (existingGrade) {
            return res.status(400).json({ error: 'الصف موجود بالفعل.' });
        }

        // إضافة الصف الجديد إلى الملف
        gradesSections.push(newGrade);

        // كتابة التحديثات إلى ملف grades_sections.json
        await writeJSONFile('grades_sections.json', gradesSections);

        res.status(201).json({ message: 'تم إضافة الصف بنجاح.' });
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء إضافة الصف.' });
    }
});




app.get('/api/grades_sections/:gradeId', async (req, res) => {
    const gradeId = parseInt(req.params.gradeId, 10);

    try {
        const gradesSections = await readJSONFile('grades_sections.json');
        const grade = gradesSections.find(g => g.grade_id === gradeId);

        if (!grade) {
            // بدلًا من إعادة 404، نعيد رسالة تفيد بأن الصف غير موجود ويمكن إضافته
            return res.json({ error: 'الصف غير موجود. يمكنك إدخال البيانات.' });
        }

        res.json(grade);
    } catch (error) {
        console.error('Error fetching grade:', error);
        res.status(500).json({ error: 'خطأ في الخادم.' });
    }
});

// Update daily periods for a specific grade
app.put('/api/grades_sections/:gradeId', async (req, res) => {
    const gradeId = parseInt(req.params.gradeId, 10);
    const { periods_per_day } = req.body;

    if (!periods_per_day) {
        return res.status(400).json({ error: 'الحصص اليومية مطلوبة.' });
    }

    try {
        let gradesSections = await readJSONFile('grades_sections.json');
        const grade = gradesSections.find(g => g.grade_id === gradeId);

        if (!grade) {
            return res.status(404).json({ error: 'الصف غير موجود.' });
        }

        // تحديث الحصص اليومية
        grade.periods_per_day = periods_per_day;

        // كتابة التحديثات إلى ملف grades_sections.json
        await writeJSONFile('grades_sections.json', gradesSections);

        res.json({ message: 'تم تحديث الحصص اليومية بنجاح.' });
    } catch (error) {
        console.error('Error updating daily periods:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء تحديث الحصص اليومية.' });
    }
});


/* ----------------------- API Endpoint for config.json ----------------------- */

// Serve config.json
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.json'));
});

// Serve script_subjects.js
app.get('/script_subjects.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script_subjects.js'));
});

/* ----------------------- Routes to Serve JSON Files ----------------------- */

// Serve grades_sections.json
app.get('/grades_sections.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'grades_sections.json'));
});

// Serve subjects.json
app.get('/subjects.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'subjects.json'));
});

// Serve teachers.json (optional, if needed)
app.get('/teachers.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'teachers.json'));
});

/* ----------------------- New API Endpoint for all_schedules.json ----------------------- */

// Serve all_schedules.json
app.get('/all_schedules.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'all_schedules.json'));
});

/* ----------------------- Start the Server ----------------------- */

// **الكود الجديد**: خدمة ملف all_schedules_75.json
app.get('/all_schedules_75.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'all_schedules_75.json'));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
