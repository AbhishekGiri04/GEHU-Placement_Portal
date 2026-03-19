// ─── INIT ─────────────────────────────────────────────────────────────────────
let _allApplications = [];
let _allEvents = [];

document.addEventListener('DOMContentLoaded', () => {
  requireAuth('student');
  loadDashboard();
  showSection('home');

  // Wire resume file input
  document.getElementById('resumeUpload')?.addEventListener('change', handleResumeFileSelect);
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

function navigateTo(section) {
  showSection(section);
  const loaders = {
    profile: loadProfile,
    events: loadEvents,
    applications: loadApplications,
    resume: loadResume,
    analytics: loadAnalytics,
    announcements: loadAnnouncements,
    messages: loadMessages,
    settings: loadSettings
  };
  if (loaders[section]) loaders[section]();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const user = getUser();
  document.querySelectorAll('.student-name').forEach(el =>
    el.textContent = `${user.studentFirstName || ''} ${user.studentLastName || ''}`.trim() || 'Student'
  );
  setText('studentIdDisplay', `Student ID: ${user.studentAdmissionNumber || ''}`);
  setText('studentEmailDisplay', user.collegeEmailId || user.emailId || '');

  const data = await api.get('/students/dashboard');
  if (!data?.success) return;

  const { stats, recentApplications, upcomingDrives } = data.data;
  setText('stat-total-applied', stats.total_applied ?? 0);
  setText('stat-selected', stats.selected ?? 0);
  setText('stat-pending', stats.pending ?? 0);
  setText('stat-available-drives', stats.available_drives ?? 0);

  renderRecentApplications(recentApplications);
  loadDashboardAnnouncements();
}

function renderRecentApplications(apps) {
  const container = document.getElementById('recentApplicationsList');
  if (!container) return;
  if (!apps?.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No applications yet</p>';
    return;
  }
  container.innerHTML = apps.map(a => `
    <div class="application-item">
      <div class="company-info">
        <span class="material-symbols-outlined company-logo">business</span>
        <div>
          <h5>${a.organizing_company}</h5>
          <p>${a.job_role}</p>
        </div>
      </div>
      <span class="status-badge ${a.participation_status.toLowerCase()}">${a.participation_status}</span>
    </div>
  `).join('');
}

async function loadDashboardAnnouncements() {
  const container = document.getElementById('dashboardAnnouncements');
  if (!container) return;
  const data = await api.get('/announcements');
  if (!data?.success || !data.announcements.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No announcements</p>';
    return;
  }
  container.innerHTML = data.announcements.slice(0, 3).map(a => `
    <div style="padding:0.8rem 0;border-bottom:1px solid #f3f4f6;">
      <h5 style="margin:0 0 4px;font-size:0.9rem;color:#1e3a5f;">${a.title}</h5>
      <p style="margin:0;font-size:0.82rem;color:#6b7280;">${a.content.substring(0, 80)}...</p>
      <small style="color:#9ca3af;">${new Date(a.created_at).toLocaleDateString('en-IN')}</small>
    </div>
  `).join('');
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
async function loadProfile() {
  const data = await api.get('/students/profile');
  if (!data?.success) { showToast('Failed to load profile', 'error'); return; }

  const s = data.student;
  setText('profile-name', `${s.student_first_name} ${s.student_last_name}`);
  setText('profile-id', s.student_admission_number);
  setText('profile-roll', s.student_university_roll_no || s.student_admission_number);
  setText('profile-college-email', s.college_email_id || '');
  setText('profile-phone', s.mobile_no || '');
  setText('profile-program', `${s.course} — ${s.department} | Batch ${s.batch}`);
  setText('profile-father', s.father_name || '—');
  setText('profile-mother', s.mother_name || '—');
  setText('profile-dob', s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('en-IN') : '—');
  setText('profile-email', s.email_id || '—');
  setText('profile-course', s.course || '—');
  setText('profile-dept', s.department || '—');
  setText('profile-batch', s.batch || '—');
  setText('profile-cgpa', s.cgpa ?? '—');
  setText('profile-10th', s.tenth_percentage ? `${s.tenth_percentage}%` : '—');
  setText('profile-12th', s.twelfth_percentage ? `${s.twelfth_percentage}%` : '—');
  setText('profile-backlogs', s.back_logs_count ?? 0);
  setText('profile-address', s.address || 'Not provided');

  // Pre-fill settings form
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
  setVal('edit-email', s.email_id);
  setVal('edit-mobile', s.mobile_no);
  setVal('edit-address', s.address || '');
  setVal('edit-backlogs', s.back_logs_count ?? 0);
  setVal('modal-edit-email', s.email_id);
  setVal('modal-edit-mobile', s.mobile_no);
  setVal('modal-edit-address', s.address || '');
  setVal('modal-edit-backlogs', s.back_logs_count ?? 0);
}

async function saveProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  // Support both modal and settings form IDs
  const get = (a, b) => (document.getElementById(a)?.value ?? document.getElementById(b)?.value ?? '');

  const data = await api.put('/students/profile', {
    mobileNo: get('modal-edit-mobile', 'edit-mobile'),
    emailId: get('modal-edit-email', 'edit-email'),
    address: get('modal-edit-address', 'edit-address'),
    backLogsCount: get('modal-edit-backlogs', 'edit-backlogs') || 0
  });

  setLoading(btn, false);
  if (data?.success) {
    showToast('Profile updated successfully', 'success');
    document.getElementById('editProfileModal').style.display = 'none';
    loadProfile();
  } else {
    showToast(data?.message || 'Update failed', 'error');
  }
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
async function loadSettings() {
  await loadProfile(); // reuse profile loader to fill settings form
}

async function changePassword(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return; }
  if (newPass.length < 8 || !/\d/.test(newPass)) {
    showToast('Password must be at least 8 characters and include a number', 'error');
    return;
  }

  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  const data = await api.put('/students/change-password', {
    currentPassword: document.getElementById('current-password').value,
    newPassword: newPass
  });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Password changed successfully', 'success');
    e.target.reset();
  } else {
    showToast(data?.message || 'Failed to change password', 'error');
  }
}

// ─── EVENTS / DRIVES ──────────────────────────────────────────────────────────
async function loadEvents() {
  const container = document.getElementById('eventsGrid');
  const empty = document.getElementById('eventsEmpty');
  if (!container) return;

  container.innerHTML = '<p style="color:#6b7280;padding:1rem;">Loading drives...</p>';

  const data = await api.get('/events/upcoming');
  if (!data?.success) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  _allEvents = data.events || [];
  renderEvents(_allEvents);
}

function filterDrives() {
  const search = document.getElementById('driveSearch')?.value.toLowerCase() || '';
  const sort = document.getElementById('driveSort')?.value || 'latest';

  let filtered = _allEvents.filter(e =>
    !search ||
    e.company_name?.toLowerCase().includes(search) ||
    e.event_name?.toLowerCase().includes(search) ||
    e.job_role?.toLowerCase().includes(search)
  );

  if (sort === 'package') filtered.sort((a, b) => (b.expected_package || 0) - (a.expected_package || 0));
  else if (sort === 'deadline') filtered.sort((a, b) => new Date(a.registration_end) - new Date(b.registration_end));

  renderEvents(filtered);
}

function renderEvents(events) {
  const container = document.getElementById('eventsGrid');
  const empty = document.getElementById('eventsEmpty');
  if (!container) return;

  if (!events.length) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  container.innerHTML = events.map(e => `
    <div class="event-card card hover-scale">
      <div class="event-header">
        <div class="company-info">
          <span class="material-symbols-outlined">business</span>
          <div>
            <h4>${e.company_name || e.organizing_company}</h4>
            <p class="role">${e.job_role}</p>
          </div>
        </div>
        <span class="status-badge" style="background:#10b981;color:#fff;">${e.status}</span>
      </div>
      <div class="event-details">
        <div class="detail-item"><span class="material-symbols-outlined">payments</span><span>₹${e.expected_package} LPA</span></div>
        <div class="detail-item"><span class="material-symbols-outlined">school</span><span>Min CGPA: ${e.expected_cgpa}</span></div>
        <div class="detail-item"><span class="material-symbols-outlined">schedule</span><span>Closes: ${new Date(e.registration_end).toLocaleDateString('en-IN')}</span></div>
        <div class="detail-item"><span class="material-symbols-outlined">laptop</span><span>${e.event_mode}</span></div>
      </div>
      <p style="font-size:0.85rem;color:#6b7280;margin:0.5rem 0;">${(e.event_description || '').substring(0, 120)}...</p>
      <div class="event-actions">
        <button class="btn btn-primary" onclick="applyToDrive(${e.event_id})">Apply Now</button>
      </div>
    </div>
  `).join('');
}

async function applyToDrive(eventId) {
  const data = await api.post(`/students/apply/${eventId}`, {});
  if (data?.success) {
    showToast('Successfully applied to the drive!', 'success');
    loadEvents();
    loadDashboard();
  } else {
    showToast(data?.message || 'Application failed', 'error');
  }
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
async function loadApplications() {
  const tbody = document.getElementById('applicationsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  const data = await api.get('/students/applications');
  if (!data?.success) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;">Failed to load applications</td></tr>';
    return;
  }

  _allApplications = data.applications || [];
  renderApplications(_allApplications);
}

function filterApplications() {
  const search = document.getElementById('appSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('appStatusFilter')?.value || '';

  const filtered = _allApplications.filter(a =>
    (!search || a.organizing_company?.toLowerCase().includes(search) || a.job_role?.toLowerCase().includes(search)) &&
    (!status || a.participation_status === status)
  );
  renderApplications(filtered);
}

function renderApplications(apps) {
  const tbody = document.getElementById('applicationsBody');
  if (!tbody) return;

  if (!apps.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6b7280;">No applications found</td></tr>';
    return;
  }

  tbody.innerHTML = apps.map(a => `
    <tr>
      <td>${a.organizing_company}</td>
      <td>${a.job_role}</td>
      <td>${new Date(a.created_at).toLocaleDateString('en-IN')}</td>
      <td><span class="status-badge ${a.participation_status.toLowerCase()}">${a.participation_status}</span></td>
      <td>₹${a.expected_package} LPA</td>
      <td>
        ${['REGISTERED', 'ATTEMPTED'].includes(a.participation_status)
          ? `<button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.8rem;background:#ef4444;color:#fff;border:none;"
               onclick="withdrawApplication(${a.event_id})">Withdraw</button>`
          : `<span style="color:#6b7280;font-size:0.85rem;">${a.participation_status}</span>`
        }
      </td>
    </tr>
  `).join('');
}

async function withdrawApplication(eventId) {
  const confirmed = await showConfirm(
    'Withdraw Application',
    'Are you sure you want to withdraw this application? This action cannot be undone.'
  );
  if (!confirmed) return;
  const data = await api.delete(`/students/withdraw/${eventId}`);
  if (data?.success) {
    showToast('Application withdrawn', 'success');
    loadApplications();
    loadDashboard();
  } else {
    showToast(data?.message || 'Withdrawal failed', 'error');
  }
}

function showConfirm(title, message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2rem;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
          <span style="width:42px;height:42px;background:#fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span class="material-symbols-outlined" style="color:#d97706;font-size:1.4rem;">warning</span>
          </span>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#1e293b;">${title}</h3>
        </div>
        <p style="margin:0 0 1.5rem;color:#64748b;font-size:0.875rem;line-height:1.6;">${message}</p>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
          <button id="confirmCancel" style="padding:0.55rem 1.2rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#374151;font-weight:500;cursor:pointer;font-size:0.875rem;font-family:inherit;">Cancel</button>
          <button id="confirmOk" style="padding:0.55rem 1.2rem;border-radius:8px;border:none;background:#ef4444;color:#fff;font-weight:600;cursor:pointer;font-size:0.875rem;font-family:inherit;">Withdraw</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirmOk').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirmCancel').onclick = () => { overlay.remove(); resolve(false); };
    overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
  });
}

function exportApplications() {
  if (!_allApplications.length) { showToast('No applications to export', 'warning'); return; }
  const rows = [['Company', 'Role', 'Date', 'Status', 'Package']];
  _allApplications.forEach(a => rows.push([
    a.organizing_company, a.job_role,
    new Date(a.created_at).toLocaleDateString('en-IN'),
    a.participation_status, `${a.expected_package} LPA`
  ]));
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  link.download = 'my_applications.csv';
  link.click();
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
async function loadAnalytics() {
  const data = await api.get('/students/applications');
  if (!data?.success) return;

  const apps = data.applications || [];
  const total = apps.length;
  const selected = apps.filter(a => a.participation_status === 'SELECTED').length;
  const pending = apps.filter(a => a.participation_status === 'REGISTERED').length;
  const rate = total > 0 ? ((selected / total) * 100).toFixed(1) : 0;

  setText('an-applied', total);
  setText('an-selected', selected);
  setText('an-pending', pending);
  setText('an-rate', `${rate}%`);

  // Status breakdown bars
  const statusCounts = {};
  apps.forEach(a => { statusCounts[a.participation_status] = (statusCounts[a.participation_status] || 0) + 1; });
  const colors = { REGISTERED: '#3b82f6', SELECTED: '#10b981', REJECTED: '#ef4444', ATTEMPTED: '#f59e0b', ABSENT: '#6b7280', COMPLETED: '#8b5cf6' };

  const barsContainer = document.getElementById('analyticsStatusBars');
  if (barsContainer) {
    barsContainer.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
      <div style="margin-bottom:0.8rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:0.85rem;font-weight:500;">${status}</span>
          <span style="font-size:0.85rem;color:#6b7280;">${count} / ${total}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${(count/total*100).toFixed(1)}%;background:${colors[status]||'#3b82f6'};"></div>
        </div>
      </div>
    `).join('');
  }

  // Table
  const tbody = document.getElementById('analyticsTable');
  if (tbody) {
    if (!apps.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;">No applications yet</td></tr>';
      return;
    }
    tbody.innerHTML = apps.map(a => `
      <tr>
        <td>${a.organizing_company}</td>
        <td>${a.job_role}</td>
        <td>${new Date(a.created_at).toLocaleDateString('en-IN')}</td>
        <td><span class="status-badge ${a.participation_status.toLowerCase()}">${a.participation_status}</span></td>
        <td>₹${a.expected_package} LPA</td>
      </tr>
    `).join('');
  }
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
async function loadAnnouncements() {
  const container = document.getElementById('announcementsList');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:2rem;">Loading...</p>';

  const data = await api.get('/announcements');
  if (!data?.success) {
    container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:2rem;">Failed to load announcements</p>';
    return;
  }

  if (!data.announcements.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:2rem;">No announcements yet</p>';
    return;
  }

  const badge = document.getElementById('annNewBadge');
  if (badge) { badge.textContent = `${data.announcements.length} Total`; badge.style.display = 'inline'; }

  container.innerHTML = data.announcements.map(a => `
    <div class="ann-card">
      <h5>${a.title}</h5>
      <p>${a.content}</p>
      <small>Posted by ${a.created_by} · ${new Date(a.created_at).toLocaleDateString('en-IN')}</small>
    </div>
  `).join('');
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
async function loadMessages() {
  const container = document.getElementById('messagesList');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:2rem;">Loading...</p>';

  // Students see their own sent messages by fetching from messages endpoint
  // We filter by sender_email matching the logged-in student
  const user = getUser();
  const data = await api.get('/messages/mine');

  if (!data?.success) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:2rem;">
        <span class="material-symbols-outlined" style="font-size:3rem;color:#3b82f6;display:block;margin-bottom:1rem;">send</span>
        <h4>Send a Message to Admin</h4>
        <p style="color:#6b7280;">Use the "New Message" button above to contact the placement cell.</p>
      </div>
    `;
    return;
  }

  const myMessages = data.messages;

  if (!myMessages.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:2rem;">No messages sent yet. Use "New Message" to contact admin.</p>';
    return;
  }

  container.innerHTML = myMessages.map(m => `
    <div class="msg-card ${m.status === 'new' ? 'unread' : m.status === 'replied' ? 'replied' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;">
          <p style="font-weight:600;margin:0 0 4px;">${m.subject}</p>
          <p style="color:#374151;margin:0 0 6px;">${m.message}</p>
          <small style="color:#9ca3af;">${new Date(m.created_at).toLocaleString('en-IN')}</small>
        </div>
        <span style="flex-shrink:0;margin-left:1rem;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;color:#fff;background:${m.status==='replied'?'#10b981':m.status==='read'?'#6b7280':'#3b82f6'}">${m.status.toUpperCase()}</span>
      </div>
      ${m.reply ? `
        <div class="msg-reply-box">
          <p style="font-weight:600;margin:0 0 4px;color:#166534;">Admin Reply:</p>
          <p>${m.reply}</p>
          <small style="color:#9ca3af;">${new Date(m.replied_at).toLocaleString('en-IN')}</small>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function sendMessage(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const user = getUser();

  setLoading(btn, true);
  const data = await api.post('/messages/send', {
    sender_name: `${user.studentFirstName || ''} ${user.studentLastName || ''}`.trim(),
    sender_email: user.emailId || user.collegeEmailId,
    subject: document.getElementById('msgSubject').value,
    message: document.getElementById('msgBody').value
  });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Message sent to admin successfully', 'success');
    document.getElementById('composeModal').style.display = 'none';
    e.target.reset();
    loadMessages();
  } else {
    showToast(data?.message || 'Failed to send message', 'error');
  }
}

// ─── RESUME ───────────────────────────────────────────────────────────────────
async function loadResume() {
  const data = await api.get('/students/profile');
  if (!data?.success) return;

  const resumeLink = data.student.resume_link;
  const uploadArea = document.getElementById('uploadArea');
  const previewArea = document.getElementById('resumePreviewArea');

  if (resumeLink) {
    if (uploadArea) uploadArea.style.display = 'none';
    if (previewArea) {
      previewArea.style.display = 'block';
      const fileName = document.getElementById('resumeFileName');
      const downloadBtn = document.getElementById('downloadResumeBtn');
      if (fileName) fileName.textContent = resumeLink.split('/').pop();
      if (downloadBtn) downloadBtn.href = resumeLink;
    }
    setText('resumeLastUpdated', data.student.updated_at ? new Date(data.student.updated_at).toLocaleDateString('en-IN') : 'On file');
  } else {
    if (uploadArea) uploadArea.style.display = 'block';
    if (previewArea) previewArea.style.display = 'none';
  }
}

function handleResumeFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    showToast('Only PDF files are allowed', 'error');
    e.target.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5MB', 'error');
    e.target.value = '';
    return;
  }

  uploadResume(file);
}

async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const btn = document.getElementById('selectResumeBtn');
  if (btn) setLoading(btn, true);
  const data = await api.upload('/students/resume/upload', formData);
  if (btn) setLoading(btn, false);

  if (data?.success) {
    showToast('Resume uploaded successfully', 'success');
    const user = getUser();
    user.resumeLink = data.resumeLink;
    localStorage.setItem('user', JSON.stringify(user));
    loadResume();
  } else {
    showToast(data?.message || 'Upload failed', 'error');
  }
}

function clearResume() {
  const uploadArea = document.getElementById('uploadArea');
  const previewArea = document.getElementById('resumePreviewArea');
  if (uploadArea) uploadArea.style.display = 'block';
  if (previewArea) previewArea.style.display = 'none';
  document.getElementById('resumeUpload').value = '';
}

async function saveResumeLink(e) {
  e.preventDefault();
  const link = document.getElementById('resumeDriveLink').value.trim();
  if (!link.startsWith('https://')) { showToast('Please provide a valid HTTPS link', 'error'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);
  const data = await api.put('/students/resume/link', { driveLink: link });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Resume link saved', 'success');
    const user = getUser();
    user.resumeLink = link;
    localStorage.setItem('user', JSON.stringify(user));
    loadResume();
  } else {
    showToast(data?.message || 'Failed to save link', 'error');
  }
}
