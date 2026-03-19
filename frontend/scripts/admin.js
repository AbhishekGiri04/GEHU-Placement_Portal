document.addEventListener('DOMContentLoaded', () => {
  requireAuth('admin');
  loadDashboard();
  showSection('home');
});

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.main-section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector(`.nav-item[data-section="${id}"]`);
  if (active) active.classList.add('active');
}

function showDashboard() { showSection('home'); }

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const user = getUser();
  const nameEls = document.querySelectorAll('.admin-name');
  nameEls.forEach(el => el.textContent = user.adminName || 'Admin');

  const data = await api.get('/admin/dashboard');
  if (!data?.success) return;

  const { stats, recentApplications, topCompanies } = data.data;

  setText('stat-total-students', stats.total_students || 0);
  setText('stat-total-companies', stats.total_companies || 0);
  setText('stat-upcoming-events', stats.upcoming_events || 0);
  setText('stat-total-applications', stats.total_applications || 0);
  setText('stat-total-selected', stats.total_selected || 0);
  setText('stat-unread-messages', stats.unread_messages || 0);

  renderRecentActivity(recentApplications);
  renderTopCompanies(topCompanies);
}

function renderRecentActivity(apps) {
  const container = document.getElementById('recentActivityList');
  if (!container) return;
  if (!apps.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No recent activity</p>';
    return;
  }
  container.innerHTML = apps.map(a => `
    <div class="application-item">
      <div class="company-info">
        <span class="material-symbols-outlined">person</span>
        <div>
          <h5>${a.student_first_name} ${a.student_last_name}</h5>
          <p>${a.event_name} — ${a.company_name}</p>
        </div>
      </div>
      <span class="status-badge ${a.participation_status.toLowerCase()}">${a.participation_status}</span>
    </div>
  `).join('');
}

function renderTopCompanies(companies) {
  const container = document.getElementById('topCompaniesList');
  if (!container) return;
  if (!companies.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No data</p>';
    return;
  }
  container.innerHTML = companies.map(c => `
    <div class="application-item">
      <div class="company-info">
        <span class="material-symbols-outlined">business</span>
        <div>
          <h5>${c.company_name}</h5>
          <p>${c.drives} drives | ${c.applicants} applicants | ${c.selected} selected</p>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
async function loadStudents() {
  const search = document.getElementById('studentSearch')?.value || '';
  const dept = document.getElementById('studentDeptFilter')?.value || '';
  const batch = document.getElementById('studentBatchFilter')?.value || '';

  let query = '/admin/students?';
  if (search) query += `search=${encodeURIComponent(search)}&`;
  if (dept) query += `department=${encodeURIComponent(dept)}&`;
  if (batch) query += `batch=${batch}`;

  const tbody = document.getElementById('studentsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  const data = await api.get(query);
  if (!data?.success) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Failed to load</td></tr>';
    return;
  }

  if (!data.students.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No students found</td></tr>';
    return;
  }

  tbody.innerHTML = data.students.map(s => `
    <tr>
      <td>${s.student_admission_number}</td>
      <td>${s.student_first_name} ${s.student_last_name}</td>
      <td>${s.department}</td>
      <td>${s.batch}</td>
      <td>${s.cgpa}</td>
      <td>${s.email_id}</td>
      <td>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
          <button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.78rem;width:70px;"
            onclick="openEditStudentModal('${s.student_admission_number}')">Edit</button>
          <button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.78rem;width:70px;background:#ef4444;color:#fff;border:none;"
            onclick="deleteStudent('${s.student_admission_number}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddStudentModal() {
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentAdmissionInput').disabled = false;
  document.getElementById('studentModal').style.display = 'flex';
}

async function openEditStudentModal(admissionNumber) {
  const data = await api.get(`/admin/students?search=${admissionNumber}`);
  if (!data?.success || !data.students.length) return;

  const s = data.students.find(x => x.student_admission_number === admissionNumber);
  if (!s) return;

  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentAdmissionInput').value = s.student_admission_number;
  document.getElementById('studentAdmissionInput').disabled = true;
  document.getElementById('studentFirstName').value = s.student_first_name;
  document.getElementById('studentLastName').value = s.student_last_name;
  document.getElementById('studentEmail').value = s.email_id;
  document.getElementById('studentMobile').value = s.mobile_no;
  document.getElementById('studentDept').value = s.department;
  document.getElementById('studentBatch').value = s.batch;
  document.getElementById('studentCgpa').value = s.cgpa;
  document.getElementById('studentModal').style.display = 'flex';
}

function closeStudentModal() {
  document.getElementById('studentModal').style.display = 'none';
}

async function submitStudentForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const admissionNumber = document.getElementById('studentAdmissionInput').value;
  const isEdit = document.getElementById('studentAdmissionInput').disabled;

  const payload = {
    studentAdmissionNumber: admissionNumber,
    studentFirstName: document.getElementById('studentFirstName').value,
    studentLastName: document.getElementById('studentLastName').value,
    emailId: document.getElementById('studentEmail').value,
    mobileNo: document.getElementById('studentMobile').value,
    department: document.getElementById('studentDept').value,
    batch: document.getElementById('studentBatch').value,
    cgpa: document.getElementById('studentCgpa').value
  };

  const data = isEdit
    ? await api.put(`/admin/students/${admissionNumber}`, payload)
    : await api.post('/admin/students', payload);

  setLoading(btn, false);

  if (data?.success) {
    showToast(isEdit ? 'Student updated' : 'Student added', 'success');
    closeStudentModal();
    loadStudents();
  } else {
    showToast(data?.message || 'Operation failed', 'error');
  }
}

async function deleteStudent(admissionNumber) {
  const ok = await showConfirm('Delete Student', `Are you sure you want to delete student <strong>${admissionNumber}</strong>? This cannot be undone.`);
  if (!ok) return;
  const data = await api.delete(`/admin/students/${admissionNumber}`);
  if (data?.success) {
    showToast('Student deleted successfully', 'success');
    loadStudents();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── COMPANIES ────────────────────────────────────────────────────────────────
async function loadCompanies() {
  const tbody = document.getElementById('companiesBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  const data = await api.get('/admin/companies');
  if (!data?.success) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ef4444;">Failed to load</td></tr>';
    return;
  }

  if (!data.companies.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;">No companies found</td></tr>';
    return;
  }

  tbody.innerHTML = data.companies.map(c => `
    <tr>
      <td>${c.company_id}</td>
      <td>${c.company_name}</td>
      <td>${c.hr_name}</td>
      <td>${c.hr_email}</td>
      <td>
        <button class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;background:#ef4444;color:#fff;border:none;"
          onclick="deleteCompany('${c.company_id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deleteCompany(companyId) {
  const ok = await showConfirm('Delete Company', `Are you sure you want to delete <strong>${companyId}</strong>? All associated drives and applications will also be removed.`);
  if (!ok) return;
  const data = await api.delete(`/admin/companies/${companyId}`);
  if (data?.success) {
    showToast('Company deleted successfully', 'success');
    loadCompanies();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
async function loadEvents() {
  const tbody = document.getElementById('eventsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  const data = await api.get('/admin/events');
  if (!data?.success) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Failed to load</td></tr>';
    return;
  }

  if (!data.events.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No events found</td></tr>';
    return;
  }

  tbody.innerHTML = data.events.map(e => `
    <tr>
      <td>${e.event_name}</td>
      <td>${e.company_name || e.company_id}</td>
      <td>${e.job_role}</td>
      <td>₹${e.expected_package} LPA</td>
      <td>${e.applicant_count || 0}</td>
      <td><span class="status-badge ${e.status.toLowerCase()}">${e.status}</span></td>
      <td>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
          <button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.78rem;width:70px;"
            onclick="openEditEventModal(${e.event_id})">Edit</button>
          <button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.78rem;width:70px;background:#ef4444;color:#fff;border:none;"
            onclick="deleteEvent(${e.event_id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddEventModal() {
  document.getElementById('eventModalTitle').textContent = 'Create Event';
  document.getElementById('eventForm').reset();
  document.getElementById('eventIdInput').value = '';
  document.getElementById('eventModal').style.display = 'flex';
}

// Convert ISO timestamp to datetime-local input format (YYYY-MM-DDTHH:MM)
function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function openEditEventModal(eventId) {
  const data = await api.get('/admin/events');
  if (!data?.success) return;
  const event = data.events.find(e => String(e.event_id) === String(eventId));
  if (!event) return;

  document.getElementById('eventModalTitle').textContent = 'Edit Event';
  document.getElementById('eventIdInput').value = event.event_id;
  document.getElementById('eventName').value = event.event_name;
  document.getElementById('eventCompanyId').value = event.company_id;
  document.getElementById('eventJobRole').value = event.job_role;
  document.getElementById('eventCgpa').value = event.expected_cgpa;
  document.getElementById('eventPackage').value = event.expected_package;
  document.getElementById('eventMode').value = event.event_mode;
  document.getElementById('eventRegStart').value = toDatetimeLocal(event.registration_start);
  document.getElementById('eventRegEnd').value = toDatetimeLocal(event.registration_end);
  document.getElementById('eventDepts').value = event.eligible_departments;
  document.getElementById('eventDescription').value = event.event_description;
  document.getElementById('eventStatus').value = event.status;
  document.getElementById('eventModal').style.display = 'flex';
}

function closeEventModal() {
  document.getElementById('eventModal').style.display = 'none';
}

async function submitEventForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const eventId = document.getElementById('eventIdInput').value;
  const payload = {
    eventName: document.getElementById('eventName').value,
    companyId: document.getElementById('eventCompanyId').value,
    jobRole: document.getElementById('eventJobRole').value,
    expectedCgpa: document.getElementById('eventCgpa').value,
    expectedPackage: document.getElementById('eventPackage').value,
    eventMode: document.getElementById('eventMode').value,
    registrationStart: document.getElementById('eventRegStart').value,
    registrationEnd: document.getElementById('eventRegEnd').value,
    eligibleDepartments: document.getElementById('eventDepts').value,
    eventDescription: document.getElementById('eventDescription').value,
    status: document.getElementById('eventStatus').value
  };

  const data = eventId
    ? await api.put(`/admin/events/${eventId}`, payload)
    : await api.post('/admin/events', payload);

  setLoading(btn, false);

  if (data?.success) {
    showToast(eventId ? 'Event updated' : 'Event created', 'success');
    closeEventModal();
    loadEvents();
    loadDashboard();
  } else {
    showToast(data?.message || 'Operation failed', 'error');
  }
}

async function deleteEvent(eventId) {
  const ok = await showConfirm('Delete Event', 'Are you sure you want to delete this event? All student applications for this drive will also be removed.');
  if (!ok) return;
  const data = await api.delete(`/admin/events/${eventId}`);
  if (data?.success) {
    showToast('Event deleted successfully', 'success');
    loadEvents();
    loadDashboard();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
async function loadAnalytics() {
  const data = await api.get('/admin/analytics');
  if (!data?.success) return;

  const { byDept, byCompany } = data.data;

  const deptContainer = document.getElementById('analyticsByDept');
  if (deptContainer) {
    deptContainer.innerHTML = byDept.map(d => `
      <tr>
        <td>${d.department}</td>
        <td>${d.total_students}</td>
        <td>${d.placed}</td>
        <td>${d.total_students > 0 ? ((d.placed / d.total_students) * 100).toFixed(1) : 0}%</td>
      </tr>
    `).join('');
  }

  const companyContainer = document.getElementById('analyticsByCompany');
  if (companyContainer) {
    companyContainer.innerHTML = byCompany.map(c => `
      <tr>
        <td>${c.company_name}</td>
        <td>${c.applicants}</td>
        <td>${c.selected}</td>
        <td>₹${c.max_package} LPA</td>
      </tr>
    `).join('');
  }
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
async function loadAnnouncements() {
  const container = document.getElementById('announcementsList');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">Loading...</p>';

  const data = await api.get('/admin/announcements');
  if (!data?.success) {
    container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:1rem;">Failed to load</p>';
    return;
  }

  if (!data.announcements.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No announcements yet</p>';
    return;
  }

  container.innerHTML = data.announcements.map(a => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1.2rem;margin-bottom:1rem;border-left:4px solid #3b82f6;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;">
          <h5 style="margin:0 0 6px;color:#1e3a5f;">${a.title}</h5>
          <p style="margin:0 0 8px;color:#374151;font-size:0.9rem;">${a.content}</p>
          <small style="color:#9ca3af;">By ${a.created_by} · ${new Date(a.created_at).toLocaleDateString('en-IN')}</small>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;margin-left:1rem;">
          <button class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="openEditAnnouncementModal(${a.id},'${a.title.replace(/'/g,"\\'").replace(/"/g,'&quot;')}','${a.content.replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/\n/g,' ')}')">Edit</button>
          <button class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;background:#ef4444;color:#fff;border:none;" onclick="deleteAnnouncement(${a.id})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openCreateAnnouncementModal() {
  document.getElementById('annModalTitle').textContent = 'Create Announcement';
  document.getElementById('annIdInput').value = '';
  document.getElementById('annTitle').value = '';
  document.getElementById('annContent').value = '';
  document.getElementById('announcementModal').style.display = 'flex';
}

function openEditAnnouncementModal(id, title, content) {
  document.getElementById('annModalTitle').textContent = 'Edit Announcement';
  document.getElementById('annIdInput').value = id;
  document.getElementById('annTitle').value = title;
  document.getElementById('annContent').value = content;
  document.getElementById('announcementModal').style.display = 'flex';
}

function closeAnnouncementModal() {
  document.getElementById('announcementModal').style.display = 'none';
}

async function submitAnnouncementForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const id = document.getElementById('annIdInput').value;
  const payload = {
    title: document.getElementById('annTitle').value,
    content: document.getElementById('annContent').value
  };

  const data = id
    ? await api.put(`/admin/announcements/${id}`, payload)
    : await api.post('/admin/announcements', payload);

  setLoading(btn, false);
  if (data?.success) {
    showToast(id ? 'Announcement updated' : 'Announcement created', 'success');
    closeAnnouncementModal();
    loadAnnouncements();
  } else {
    showToast(data?.message || 'Operation failed', 'error');
  }
}

async function deleteAnnouncement(id) {
  const ok = await showConfirm('Delete Announcement', 'Are you sure you want to delete this announcement? It will no longer be visible to students.');
  if (!ok) return;
  const data = await api.delete(`/admin/announcements/${id}`);
  if (data?.success) {
    showToast('Announcement deleted successfully', 'success');
    loadAnnouncements();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
async function loadMessages() {
  const container = document.getElementById('messagesList');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">Loading...</p>';

  const data = await api.get('/admin/messages');
  if (!data?.success) {
    container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:1rem;">Failed to load messages</p>';
    return;
  }

  if (!data.messages.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No messages</p>';
    return;
  }

  container.innerHTML = data.messages.map(m => `
    <div class="message-card card" style="margin-bottom:1rem;padding:1.2rem;border-left:4px solid ${m.status==='new'?'#3b82f6':m.status==='replied'?'#10b981':'#e5e7eb'};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;">
        <div style="flex:1;">
          <h5 style="margin:0 0 4px;">${m.sender_name} <span style="color:#6b7280;font-weight:400;font-size:0.85rem;">&lt;${m.sender_email}&gt;</span>
            <span style="font-size:0.75rem;background:#f3f4f6;padding:2px 6px;border-radius:4px;margin-left:6px;">${m.sender_role||'guest'}</span>
          </h5>
          <p style="font-weight:600;margin:0 0 6px;">${m.subject}</p>
          <p style="color:#374151;margin:0 0 6px;">${m.message}</p>
          <small style="color:#9ca3af;">${new Date(m.created_at).toLocaleString('en-IN')}</small>
          ${m.reply ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:0.8rem;margin-top:0.8rem;">
            <p style="font-weight:600;color:#166534;margin:0 0 4px;">Your Reply:</p>
            <p style="color:#166534;margin:0;">${m.reply}</p>
            <small style="color:#9ca3af;">${new Date(m.replied_at).toLocaleString('en-IN')}</small>
          </div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
          ${m.status==='new' ? `<button class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="markMessageRead(${m.id})">Mark Read</button>` : ''}
          <button class="btn btn-primary" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="openReplyModal(${m.id},'${m.sender_name.replace(/'/g,"\\'")}')">Reply</button>
          <button class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;background:#ef4444;color:#fff;border:none;" onclick="deleteMessage(${m.id})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function markMessageRead(messageId) {
  const data = await api.put(`/admin/messages/${messageId}/read`, {});
  if (data?.success) {
    showToast('Message marked as read', 'success');
    loadMessages();
    loadDashboard();
  } else {
    showToast('Failed to update', 'error');
  }
}

function openReplyModal(messageId, senderName) {
  document.getElementById('replyMessageId').value = messageId;
  document.getElementById('replyModalTitle').textContent = `Reply to ${senderName}`;
  document.getElementById('replyText').value = '';
  document.getElementById('replyModal').style.display = 'flex';
}

function closeReplyModal() {
  document.getElementById('replyModal').style.display = 'none';
}

async function submitReply(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const id = document.getElementById('replyMessageId').value;
  const reply = document.getElementById('replyText').value;

  setLoading(btn, true);
  const data = await api.post(`/admin/messages/${id}/reply`, { reply });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Reply sent successfully', 'success');
    closeReplyModal();
    loadMessages();
  } else {
    showToast(data?.message || 'Failed to send reply', 'error');
  }
}

async function deleteMessage(messageId) {
  const ok = await showConfirm('Delete Message', 'Are you sure you want to delete this message? This action cannot be undone.');
  if (!ok) return;
  const data = await api.delete(`/admin/messages/${messageId}`);
  if (data?.success) {
    showToast('Message deleted successfully', 'success');
    loadMessages();
    loadDashboard();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── ADMIN PROFILE ────────────────────────────────────────────────────────────
async function loadAdminProfile() {
  const data = await api.get('/admin/profile');
  if (!data?.success) return;

  const a = data.admin;
  const editFields = {
    'edit-admin-name': a.admin_name,
    'edit-admin-phone': a.phone_number,
    'edit-admin-city': a.city,
    'edit-admin-dept': a.department
  };
  Object.entries(editFields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  });
}

async function saveAdminProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const data = await api.put('/admin/profile', {
    adminName: document.getElementById('edit-admin-name').value,
    phoneNumber: document.getElementById('edit-admin-phone').value,
    city: document.getElementById('edit-admin-city').value,
    department: document.getElementById('edit-admin-dept').value
  });

  setLoading(btn, false);
  if (data?.success) {
    showToast('Profile updated', 'success');
  } else {
    showToast(data?.message || 'Update failed', 'error');
  }
}

async function changeAdminPassword(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return; }

  setLoading(btn, true);
  const data = await api.put('/admin/change-password', {
    currentPassword: document.getElementById('current-password').value,
    newPassword: newPass
  });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Password changed', 'success');
    e.target.reset();
  } else {
    showToast(data?.message || 'Failed', 'error');
  }
}

// ─── SECTION LOADERS ──────────────────────────────────────────────────────────
function navigateTo(section) {
  showSection(section);
  const loaders = {
    students: loadStudents,
    companies: loadCompanies,
    events: loadEvents,
    analytics: loadAnalytics,
    messages: loadMessages,
    announcements: loadAnnouncements,
    profile: loadAdminProfile
  };
  if (loaders[section]) loaders[section]();
}

function showConfirm(title, message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2rem;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
          <span style="width:42px;height:42px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-symbols-outlined" style="color:#ef4444;font-size:1.4rem;">warning</span>
          </span>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#1e293b;">${title}</h3>
        </div>
        <p style="margin:0 0 1.5rem;color:#64748b;font-size:0.875rem;line-height:1.6;">${message}</p>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
          <button id="confirmCancel" style="padding:0.55rem 1.2rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#374151;font-weight:500;cursor:pointer;font-size:0.875rem;font-family:inherit;">Cancel</button>
          <button id="confirmOk" style="padding:0.55rem 1.2rem;border-radius:8px;border:none;background:#ef4444;color:#fff;font-weight:600;cursor:pointer;font-size:0.875rem;font-family:inherit;">Delete</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirmOk').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirmCancel').onclick = () => { overlay.remove(); resolve(false); };
    overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
  });
}
