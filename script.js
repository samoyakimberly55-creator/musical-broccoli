const STORAGE_KEY = 'attendance-tracker-data';
const defaultStudents = [
  { id: 1, name: 'Alice Johnson', status: 'Present' },
  { id: 2, name: 'Brian Smith', status: 'Late' },
  { id: 3, name: 'Carla Gomez', status: 'Absent' },
  { id: 4, name: 'Daniel Lee', status: 'Excused' }
];

let students = loadStudents();

const studentNameInput = document.getElementById('studentName');
const addStudentBtn = document.getElementById('addStudentBtn');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('attendanceTable');
const todayDate = document.getElementById('todayDate');

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultStudents;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultStudents;
  } catch {
    return defaultStudents;
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function setTodayDate() {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  todayDate.textContent = new Date().toLocaleDateString(undefined, options);
}

function getStatCounts() {
  return students.reduce(
    (counts, student) => {
      counts.total += 1;
      counts[student.status.toLowerCase()] += 1;
      return counts;
    },
    { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
  );
}

function updateSummary() {
  const counts = getStatCounts();
  document.getElementById('totalCount').textContent = counts.total;
  document.getElementById('presentCount').textContent = counts.present;
  document.getElementById('absentCount').textContent = counts.absent;
  document.getElementById('lateCount').textContent = counts.late;
}

function renderTable() {
  if (!students.length) {
    tableBody.innerHTML = '<tr><td colspan="3" class="empty-state">No students added yet.</td></tr>';
    updateSummary();
    return;
  }

  tableBody.innerHTML = students
    .map(
      (student) => `
        <tr>
          <td class="student-name">${student.name}</td>
          <td>
            <span class="status-badge ${student.status.toLowerCase()}">${student.status}</span>
          </td>
          <td>
            <div class="actions">
              ${['Present', 'Late', 'Absent', 'Excused']
                .map(
                  (status) => `
                    <button
                      class="action-btn ${student.status === status ? 'is-selected' : ''}"
                      data-id="${student.id}"
                      data-status="${status}"
                      type="button"
                    >
                      ${status}
                    </button>
                  `
                )
                .join('')}
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  updateSummary();
}

function addStudent() {
  const name = studentNameInput.value.trim();

  if (!name) {
    studentNameInput.focus();
    return;
  }

  students.push({
    id: Date.now() + Math.random(),
    name,
    status: 'Present'
  });

  studentNameInput.value = '';
  saveStudents();
  renderTable();
}

function updateStudentStatus(studentId, nextStatus) {
  students = students.map((student) =>
    student.id === studentId ? { ...student, status: nextStatus } : student
  );

  saveStudents();
  renderTable();
}

addStudentBtn.addEventListener('click', addStudent);
studentNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addStudent();
  }
});

resetBtn.addEventListener('click', () => {
  const confirmed = window.confirm('Reset all attendance data?');

  if (!confirmed) {
    return;
  }

  students = [];
  saveStudents();
  renderTable();
});

tableBody.addEventListener('click', (event) => {
  const target = event.target.closest('.action-btn');

  if (!target) {
    return;
  }

  const studentId = Number(target.dataset.id);
  const nextStatus = target.dataset.status;
  updateStudentStatus(studentId, nextStatus);
});

setTodayDate();
renderTable();
