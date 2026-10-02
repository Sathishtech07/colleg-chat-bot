/**
 * admin.js — Admin Dashboard Management
 * =====================================
 * Handles tab navigation, loading data from Java Servlets,
 * and performing CRUD operations (Add / Delete) for:
 *   1. Q&A Knowledge Base
 *   2. Departments
 *   3. Faculty Members
 *   4. Events & Announcements
 *   5. Registered Students
 *
 * Includes fallback demo data when backend is not running.
 */

// ----------------------------------------------------------------
// FALLBACK / DEMO DATA (Used if Java backend is offline)
// ----------------------------------------------------------------
const DEMO_QA = [
  { id: 1, keywords: 'timings, timing, open, close, hours', answer: 'College hours are Monday to Saturday, 8:30 AM to 4:30 PM. The campus remains closed on Sundays.', category: 'General' },
  { id: 2, keywords: 'cse, computer science, hod, head', answer: 'The CSE Department HOD is Dr. R. K. Sharma. Office: CSE Block, Room 201. Email: cse.hod@sit.edu.', category: 'Department' },
  { id: 3, keywords: 'library, books, reading room', answer: 'The Central Library is located on the 2nd Floor of the Main Academic Block. Timings: 8:00 AM to 7:00 PM.', category: 'Facilities' },
  { id: 4, keywords: 'admission, apply, eligibility', answer: 'Admissions are based on State Entrance Exams & Management Quota. Visit www.sit.edu/admissions or contact +91 98765 43210.', category: 'Admissions' },
  { id: 5, keywords: 'leave, apply leave, leave application', answer: 'Submit a leave application form signed by your Mentor / HOD to the Department Office at least 1 day prior.', category: 'Student Support' }
];

const DEMO_DEPTS = [
  { id: 1, dept_name: 'Computer Science & Engineering', code: 'CSE', hod_name: 'Dr. R. K. Sharma', email: 'cse.hod@sit.edu', description: 'AI, Data Science, Software Development, & Cybersecurity.', icon: '💻' },
  { id: 2, dept_name: 'Electronics & Communication', code: 'ECE', hod_name: 'Dr. Anita Roy', email: 'ece.hod@sit.edu', description: 'Embedded Systems, VLSI Design, Robotics, & Communications.', icon: '⚡' },
  { id: 3, dept_name: 'Mechanical Engineering', code: 'MECH', hod_name: 'Prof. S. N. Verma', email: 'mech.hod@sit.edu', description: 'CAD/CAM, Thermal Systems, & Automated Manufacturing.', icon: '⚙️' },
  { id: 4, dept_name: 'Civil Engineering', code: 'CIVIL', hod_name: 'Dr. M. K. Gupta', email: 'civil.hod@sit.edu', description: 'Structural Engineering, Surveying, & Environmental Engineering.', icon: '🏗️' },
  { id: 5, dept_name: 'Information Technology', code: 'IT', hod_name: 'Dr. Sunita Rao', email: 'it.hod@sit.edu', description: 'Cloud Computing, Web Architecture, & Information Security.', icon: '🌐' }
];

const DEMO_FACULTY = [
  { id: 1, name: 'Dr. R. K. Sharma', department: 'Computer Science', designation: 'Professor & HOD', email: 'rksharma@sit.edu', phone: '+91 98765 43210' },
  { id: 2, name: 'Prof. Ananya Sen', department: 'Computer Science', designation: 'Assistant Professor', email: 'ananya@sit.edu', phone: '+91 98765 43211' },
  { id: 3, name: 'Dr. Anita Roy', department: 'Electronics', designation: 'Professor & HOD', email: 'anita@sit.edu', phone: '+91 98765 43212' },
  { id: 4, name: 'Prof. S. N. Verma', department: 'Mechanical', designation: 'Associate Professor & HOD', email: 'verma@sit.edu', phone: '+91 98765 43213' }
];

const DEMO_EVENTS = [
  { id: 1, title: 'TechSparks 2026 — Annual Tech Fest', event_date: '2026-10-15', time: '09:00 AM - 05:00 PM', location: 'Main Auditorium', description: 'Hackathons, Robotics, Coding Competitions & Paper Presentations.', category: 'Technical' },
  { id: 2, title: 'AI & Machine Learning Workshop', event_date: '2026-10-22', time: '10:00 AM - 04:00 PM', location: 'Seminar Hall B', description: 'Hands-on training session on PyTorch and Deep Learning.', category: 'Workshop' },
  { id: 3, title: 'Inter-College Sports Meet', event_date: '2026-11-05', time: '08:00 AM - 06:00 PM', location: 'College Sports Complex', description: 'Cricket, Football, Basketball, & Athletics.', category: 'Sports' }
];

const DEMO_STUDENTS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@sit.edu', role: 'student', created_at: '2026-09-01' },
  { id: 2, name: 'Priya Menon', email: 'priya@sit.edu', role: 'student', created_at: '2026-09-05' },
  { id: 3, name: 'Arjun Patel', email: 'arjun@sit.edu', role: 'student', created_at: '2026-09-10' }
];

// ----------------------------------------------------------------
// TAB NAVIGATION
// ----------------------------------------------------------------
function initAdminTabs() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const panels   = document.querySelectorAll('.admin-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;

      // Update active nav button
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update active panel
      panels.forEach(panel => {
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
}

// ----------------------------------------------------------------
// LOAD & RENDER DATA
// ----------------------------------------------------------------

/**
 * Load stats for top summary cards
 */
async function loadDashboardStats() {
  const qaData     = await apiFetch('/admin/qa') || DEMO_QA;
  const deptsData  = await apiFetch('/departments') || DEMO_DEPTS;
  const facultyData= await apiFetch('/faculty') || DEMO_FACULTY;
  const studentData= await apiFetch('/admin/students') || DEMO_STUDENTS;

  document.getElementById('stat-qa-count').textContent     = qaData.length || DEMO_QA.length;
  document.getElementById('stat-dept-count').textContent   = deptsData.length || DEMO_DEPTS.length;
  document.getElementById('stat-faculty-count').textContent= facultyData.length || DEMO_FACULTY.length;
  document.getElementById('stat-user-count').textContent   = studentData.length || DEMO_STUDENTS.length;
}

/**
 * 1. QA Manager — Load & Render Table
 */
async function loadQATable() {
  const tbody = document.getElementById('qa-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">Loading Q&A items...</td></tr>';

  let list = await apiFetch('/admin/qa');
  if (!list || list.length === 0) list = DEMO_QA;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>#${item.id}</td>
      <td><span class="badge badge-gold">${escapeHtml(item.category || 'General')}</span></td>
      <td style="max-width:200px; word-break:break-word;"><code>${escapeHtml(item.keywords)}</code></td>
      <td style="max-width:320px;">${escapeHtml(item.answer)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteQA(${item.id})">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * 2. Departments — Load & Render Table
 */
async function loadDeptsTable() {
  const tbody = document.getElementById('depts-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Loading departments...</td></tr>';

  let list = await apiFetch('/departments');
  if (!list || list.length === 0) list = DEMO_DEPTS;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.code)}</strong></td>
      <td>${escapeHtml(item.icon || '🏫')} ${escapeHtml(item.dept_name)}</td>
      <td>${escapeHtml(item.hod_name)}</td>
      <td><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></td>
      <td>${escapeHtml(item.description || 'N/A')}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteDept(${item.id})">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * 3. Faculty — Load & Render Table
 */
async function loadFacultyTable() {
  const tbody = document.getElementById('faculty-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Loading faculty...</td></tr>';

  let list = await apiFetch('/faculty');
  if (!list || list.length === 0) list = DEMO_FACULTY;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td><span class="badge badge-navy">${escapeHtml(item.department)}</span></td>
      <td>${escapeHtml(item.designation)}</td>
      <td>${escapeHtml(item.email)}</td>
      <td>${escapeHtml(item.phone || 'N/A')}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteFaculty(${item.id})">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * 4. Events — Load & Render Table
 */
async function loadEventsTable() {
  const tbody = document.getElementById('events-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Loading events...</td></tr>';

  let list = await apiFetch('/events');
  if (!list || list.length === 0) list = DEMO_EVENTS;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.title)}</strong></td>
      <td><span class="badge badge-gold">${escapeHtml(item.category || 'Event')}</span></td>
      <td>📅 ${formatDate(item.event_date)}</td>
      <td>⏰ ${escapeHtml(item.time || 'N/A')}</td>
      <td>📍 ${escapeHtml(item.location || 'Campus')}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteEvent(${item.id})">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * 5. Students — Load & Render Table
 */
async function loadStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">Loading registered users...</td></tr>';

  let list = await apiFetch('/admin/students');
  if (!list || list.length === 0) list = DEMO_STUDENTS;

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>#${item.id}</td>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${escapeHtml(item.email)}</td>
      <td><span class="badge ${item.role === 'admin' ? 'badge-gold' : 'badge-navy'}">${item.role.toUpperCase()}</span></td>
      <td>${formatDate(item.created_at || '2026-09-01')}</td>
    </tr>
  `).join('');
}

// ----------------------------------------------------------------
// FORM SUBMISSION HANDLERS (ADD DATA)
// ----------------------------------------------------------------

function initAdminForms() {
  // Add QA Form
  const qaForm = document.getElementById('add-qa-form');
  if (qaForm) {
    qaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(qaForm);
      const res = await apiFetch('/admin/qa', { method: 'POST', body: formData });
      if (res && res.success) {
        showToast('Q&A pair added successfully!', 'success');
        qaForm.reset();
        loadQATable();
        loadDashboardStats();
      } else {
        // Fallback demo insert
        DEMO_QA.unshift({
          id: DEMO_QA.length + 1,
          keywords: formData.get('keywords'),
          answer: formData.get('answer'),
          category: formData.get('category') || 'General'
        });
        showToast('Added to demo list (Backend offline)', 'info');
        qaForm.reset();
        loadQATable();
        loadDashboardStats();
      }
    });
  }

  // Add Department Form
  const deptForm = document.getElementById('add-dept-form');
  if (deptForm) {
    deptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(deptForm);
      const res = await apiFetch('/departments', { method: 'POST', body: formData });
      if (res && res.success) {
        showToast('Department added successfully!', 'success');
        deptForm.reset();
        loadDeptsTable();
        loadDashboardStats();
      } else {
        DEMO_DEPTS.unshift({
          id: DEMO_DEPTS.length + 1,
          dept_name: formData.get('dept_name'),
          code: formData.get('code'),
          hod_name: formData.get('hod_name'),
          email: formData.get('email'),
          description: formData.get('description'),
          icon: formData.get('icon') || '🏫'
        });
        showToast('Added to demo list (Backend offline)', 'info');
        deptForm.reset();
        loadDeptsTable();
        loadDashboardStats();
      }
    });
  }

  // Add Faculty Form
  const facultyForm = document.getElementById('add-faculty-form');
  if (facultyForm) {
    facultyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(facultyForm);
      const res = await apiFetch('/faculty', { method: 'POST', body: formData });
      if (res && res.success) {
        showToast('Faculty member added successfully!', 'success');
        facultyForm.reset();
        loadFacultyTable();
        loadDashboardStats();
      } else {
        DEMO_FACULTY.unshift({
          id: DEMO_FACULTY.length + 1,
          name: formData.get('name'),
          department: formData.get('department'),
          designation: formData.get('designation'),
          email: formData.get('email'),
          phone: formData.get('phone')
        });
        showToast('Added to demo list (Backend offline)', 'info');
        facultyForm.reset();
        loadFacultyTable();
        loadDashboardStats();
      }
    });
  }

  // Add Event Form
  const eventForm = document.getElementById('add-event-form');
  if (eventForm) {
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(eventForm);
      const res = await apiFetch('/events', { method: 'POST', body: formData });
      if (res && res.success) {
        showToast('Event created successfully!', 'success');
        eventForm.reset();
        loadEventsTable();
      } else {
        DEMO_EVENTS.unshift({
          id: DEMO_EVENTS.length + 1,
          title: formData.get('title'),
          event_date: formData.get('event_date'),
          time: formData.get('time'),
          location: formData.get('location'),
          description: formData.get('description'),
          category: formData.get('category') || 'General'
        });
        showToast('Added to demo list (Backend offline)', 'info');
        eventForm.reset();
        loadEventsTable();
      }
    });
  }
}

// ----------------------------------------------------------------
// DELETE ACTIONS
// ----------------------------------------------------------------

async function deleteQA(id) {
  if (!confirm('Are you sure you want to delete this Q&A pair?')) return;
  const res = await apiFetch(`/admin/qa?id=${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Q&A deleted!', 'success');
  } else {
    const idx = DEMO_QA.findIndex(q => q.id === id);
    if (idx !== -1) DEMO_QA.splice(idx, 1);
    showToast('Deleted from demo list', 'info');
  }
  loadQATable();
  loadDashboardStats();
}

async function deleteDept(id) {
  if (!confirm('Are you sure you want to delete this department?')) return;
  const res = await apiFetch(`/admin/departments?id=${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Department deleted!', 'success');
  } else {
    const idx = DEMO_DEPTS.findIndex(d => d.id === id);
    if (idx !== -1) DEMO_DEPTS.splice(idx, 1);
    showToast('Deleted from demo list', 'info');
  }
  loadDeptsTable();
  loadDashboardStats();
}

async function deleteFaculty(id) {
  if (!confirm('Are you sure you want to delete this faculty member?')) return;
  const res = await apiFetch(`/admin/faculty?id=${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Faculty deleted!', 'success');
  } else {
    const idx = DEMO_FACULTY.findIndex(f => f.id === id);
    if (idx !== -1) DEMO_FACULTY.splice(idx, 1);
    showToast('Deleted from demo list', 'info');
  }
  loadFacultyTable();
  loadDashboardStats();
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  const res = await apiFetch(`/admin/events?id=${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Event deleted!', 'success');
  } else {
    const idx = DEMO_EVENTS.findIndex(e => e.id === id);
    if (idx !== -1) DEMO_EVENTS.splice(idx, 1);
    showToast('Deleted from demo list', 'info');
  }
  loadEventsTable();
}

// ----------------------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Protect admin page — user must be logged in as admin
  requireAuth('admin');

  // Display admin name in welcome banner
  const user = getUser();
  if (user) {
    const adminNameEl = document.getElementById('admin-welcome-name');
    if (adminNameEl) adminNameEl.textContent = user.name;
  }

  // Setup tabs & forms
  initAdminTabs();
  initAdminForms();

  // Load all tables
  loadDashboardStats();
  loadQATable();
  loadDeptsTable();
  loadFacultyTable();
  loadEventsTable();
  loadStudentsTable();
});
