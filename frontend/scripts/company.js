document.addEventListener('DOMContentLoaded', () => {
  requireAuth('company');
  loadDashboard();
  showSection('dashboard');
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

function showDashboard() { showSection('dashboard'); }

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  const user = getUser();
  const nameEls = document.querySelectorAll('.company-name');
  nameEls.forEach(el => el.textContent = user.companyName || '');

  const data = await api.get('/companies/dashboard');
  if (!data?.success) return;

  const { stats, recentApplicants } = data.data;

  setText('stat-total-drives', stats.total_drives || 0);
  setText('stat-upcoming-drives', stats.upcoming_drives || 0);
  setText('stat-total-applicants', stats.total_applicants || 0);
  setText('stat-selected', stats.selected_count || 0);

  renderRecentApplicants(recentApplicants);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderRecentApplicants(applicants) {
  const container = document.getElementById('recentApplicantsList');
  if (!container) return;

  if (!applicants.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">No applicants yet</p>';
    return;
  }

  container.innerHTML = applicants.map(a => `
    <div class="application-item">
      <div class="company-info">
        <span class="material-symbols-outlined">person</span>
        <div>
          <h5>${a.student_first_name} ${a.student_last_name}</h5>
          <p>${a.department} | CGPA: ${a.cgpa} | ${a.event_name}</p>
        </div>
      </div>
      <span class="status-badge ${a.participation_status.toLowerCase()}">${a.participation_status}</span>
    </div>
  `).join('');
}

// ─── DRIVES / EVENTS ──────────────────────────────────────────────────────────
async function loadDrives() {
  const container = document.getElementById('drivesContainer');
  if (!container) return;

  container.innerHTML = '<p style="color:#6b7280;padding:1rem;">Loading drives...</p>';

  const data = await api.get('/companies/events');
  if (!data?.success) {
    container.innerHTML = '<p style="color:#ef4444;padding:1rem;">Failed to load drives</p>';
    return;
  }

  if (!data.events.length) {
    container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:2rem;">No drives created yet. Create your first drive!</p>';
    return;
  }

  container.innerHTML = data.events.map(e => `
    <div class="job-card">
      <div class="job-header">
        <div>
          <h3 class="job-title">${e.event_name}</h3>
          <p class="job-department">
            <span class="material-symbols-outlined" style="font-size:0.9rem;vertical-align:middle;">work</span>
            ${e.job_role} &nbsp;·&nbsp; ${e.event_mode}
          </p>
        </div>
        <div class="job-actions">
          <button class="btn btn-outline" onclick="openEditDriveModal(${e.event_id})">Edit</button>
          <button class="btn btn-outline" style="background:#ef4444;color:#fff;border:none;"
            onclick="deleteDrive(${e.event_id})">Delete</button>
        </div>
      </div>
      <div class="job-details">
        <div class="job-detail">
          <span class="material-symbols-outlined">payments</span>
          <span>₹${e.expected_package} LPA</span>
        </div>
        <div class="job-detail">
          <span class="material-symbols-outlined">school</span>
          <span>Min CGPA: ${e.expected_cgpa}</span>
        </div>
        <div class="job-detail">
          <span class="material-symbols-outlined">schedule</span>
          <span>Closes: ${new Date(e.registration_end).toLocaleDateString('en-IN')}</span>
        </div>
        <div class="job-detail">
          <span class="material-symbols-outlined">group</span>
          <span>${e.applicant_count || 0} Applicants</span>
        </div>
      </div>
      <div class="job-footer">
        <span class="status-badge ${e.status.toLowerCase()}">${e.status}</span>
        <button class="btn btn-primary" onclick="loadApplicants(${e.event_id}, '${e.event_name.replace(/'/g,"\\'")}')">View Applicants</button>
      </div>
    </div>
  `).join('');
}

// Convert ISO timestamp to datetime-local input format
function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openCreateDriveModal() {
  document.getElementById('driveModalTitle').textContent = 'Create New Drive';
  document.getElementById('driveForm').reset();
  document.getElementById('driveEventId').value = '';
  document.getElementById('driveModal').style.display = 'flex';
}

function openEditDriveModal(eventId) {
  api.get(`/companies/events`).then(data => {
    if (!data?.success) return;
    const event = data.events.find(e => String(e.event_id) === String(eventId));
    if (!event) return;

    document.getElementById('driveModalTitle').textContent = 'Edit Drive';
    document.getElementById('driveEventId').value = event.event_id;
    document.getElementById('driveEventName').value = event.event_name;
    document.getElementById('driveJobRole').value = event.job_role;
    document.getElementById('driveExpectedCgpa').value = event.expected_cgpa;
    document.getElementById('driveExpectedPackage').value = event.expected_package;
    document.getElementById('driveMode').value = event.event_mode;
    document.getElementById('driveRegStart').value = toDatetimeLocal(event.registration_start);
    document.getElementById('driveRegEnd').value = toDatetimeLocal(event.registration_end);
    document.getElementById('driveEligibleDepts').value = event.eligible_departments;
    document.getElementById('driveDescription').value = event.event_description;
    document.getElementById('driveStatus').value = event.status;
    document.getElementById('driveModal').style.display = 'flex';
  });
}

function closeDriveModal() {
  document.getElementById('driveModal').style.display = 'none';
}

async function submitDriveForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const eventId = document.getElementById('driveEventId').value;
  const payload = {
    eventName: document.getElementById('driveEventName').value,
    jobRole: document.getElementById('driveJobRole').value,
    expectedCgpa: document.getElementById('driveExpectedCgpa').value,
    expectedPackage: document.getElementById('driveExpectedPackage').value,
    eventMode: document.getElementById('driveMode').value,
    registrationStart: document.getElementById('driveRegStart').value,
    registrationEnd: document.getElementById('driveRegEnd').value,
    eligibleDepartments: document.getElementById('driveEligibleDepts').value,
    eventDescription: document.getElementById('driveDescription').value,
    status: document.getElementById('driveStatus').value
  };

  const data = eventId
    ? await api.put(`/companies/events/${eventId}`, payload)
    : await api.post('/companies/events', payload);

  setLoading(btn, false);

  if (data?.success) {
    showToast(eventId ? 'Drive updated successfully' : 'Drive created successfully', 'success');
    closeDriveModal();
    loadDrives();
    loadDashboard();
  } else {
    showToast(data?.message || 'Operation failed', 'error');
  }
}

async function deleteDrive(eventId) {
  const ok = await showConfirm('Delete Drive', 'Are you sure you want to delete this drive? All applications will be removed.');
  if (!ok) return;
  const data = await api.delete(`/companies/events/${eventId}`);
  if (data?.success) {
    showToast('Drive deleted successfully', 'success');
    loadDrives();
    loadDashboard();
  } else {
    showToast(data?.message || 'Delete failed', 'error');
  }
}

// ─── APPLICANTS ───────────────────────────────────────────────────────────────
let currentEventId = null;

async function loadApplicants(eventId, eventName) {
  currentEventId = eventId;
  showSection('applicants');

  const title = document.getElementById('applicantsEventTitle');
  if (title) title.textContent = `Applicants — ${eventName}`;

  const tbody = document.getElementById('applicantsBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  const data = await api.get(`/companies/events/${eventId}/applicants`);
  if (!data?.success) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Failed to load applicants</td></tr>';
    return;
  }

  if (!data.applicants.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No applicants yet</td></tr>';
    return;
  }

  renderApplicantRows(data.applicants.map(a => ({ ...a, eventId })));
}

async function updateApplicantStatus(eventId, admissionNumber, status) {
  const data = await api.put(`/companies/events/${eventId}/applicants/${admissionNumber}`, { status });
  if (data?.success) {
    showToast(`Status updated to ${status}`, 'success');
  } else {
    showToast(data?.message || 'Update failed', 'error');
  }
}

async function loadAllApplicants() {
  currentEventId = null;
  const title = document.getElementById('applicantsEventTitle');
  if (title) title.innerHTML = '<span class="material-symbols-outlined">group</span> All Applicants';

  const tbody = document.getElementById('applicantsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  // Load all drives first, then get applicants for each
  const drivesData = await api.get('/companies/events');
  if (!drivesData?.success || !drivesData.events.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No drives found</td></tr>';
    return;
  }

  const allRows = [];
  for (const drive of drivesData.events) {
    const data = await api.get(`/companies/events/${drive.event_id}/applicants`);
    if (data?.success && data.applicants.length) {
      data.applicants.forEach(a => allRows.push({ ...a, eventId: drive.event_id, eventName: drive.event_name }));
    }
  }

  if (!allRows.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No applicants yet</td></tr>';
    return;
  }

  renderApplicantRows(allRows);
}

async function filterApplicants() {
  const department = document.getElementById('filterDept')?.value.toLowerCase() || '';
  const status = document.getElementById('filterStatus')?.value || '';

  const tbody = document.getElementById('applicantsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Loading...</td></tr>';

  if (currentEventId) {
    // Filtering within a specific drive
    const data = await api.get(`/companies/events/${currentEventId}/applicants`);
    if (!data?.success) { showToast('Filter failed', 'error'); return; }
    let rows = data.applicants.map(a => ({ ...a, eventId: currentEventId }));
    if (department) rows = rows.filter(a => a.department?.toLowerCase().includes(department));
    if (status) rows = rows.filter(a => a.participation_status === status);
    rows.length ? renderApplicantRows(rows) : (tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No applicants match filter</td></tr>');
  } else {
    // Filtering across all drives
    const drivesData = await api.get('/companies/events');
    if (!drivesData?.success) { showToast('Filter failed', 'error'); return; }
    const allRows = [];
    for (const drive of drivesData.events) {
      const data = await api.get(`/companies/events/${drive.event_id}/applicants`);
      if (data?.success) data.applicants.forEach(a => allRows.push({ ...a, eventId: drive.event_id, eventName: drive.event_name }));
    }
    let filtered = allRows;
    if (department) filtered = filtered.filter(a => a.department?.toLowerCase().includes(department));
    if (status) filtered = filtered.filter(a => a.participation_status === status);
    filtered.length ? renderApplicantRows(filtered) : (tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">No applicants match filter</td></tr>');
  }
}

function renderApplicantRows(rows) {
  const tbody = document.getElementById('applicantsBody');
  tbody.innerHTML = rows.map(a => `
    <tr>
      <td>${a.student_first_name} ${a.student_last_name}</td>
      <td>${a.department}</td>
      <td>${a.cgpa}</td>
      <td>${a.batch}</td>
      <td>${a.resume_link ? `<a href="${a.resume_link}" target="_blank" class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;">View</a>` : '<span style="color:#9ca3af;">N/A</span>'}</td>
      <td>
        <select class="status-select" onchange="updateApplicantStatus(${a.eventId}, '${a.student_admission_number}', this.value)"
          style="padding:0.3rem;border-radius:4px;border:1px solid #d1d5db;font-size:0.8rem;">
          ${['REGISTERED','ATTEMPTED','COMPLETED','ABSENT','SELECTED','REJECTED'].map(s =>
            `<option value="${s}" ${a.participation_status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td><a href="mailto:${a.email_id}" class="btn btn-outline" style="padding:0.3rem 0.6rem;font-size:0.8rem;">Email</a></td>
    </tr>
  `).join('');
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
async function loadCompanyProfile() {
  const data = await api.get('/companies/profile');
  if (!data?.success) return;

  const c = data.company;
  const fields = {
    'profile-company-name': c.company_name,
    'profile-hr-name': c.hr_name,
    'profile-hr-email': c.hr_email,
    'profile-hr-phone': c.hr_phone
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  const editFields = {
    'edit-company-name': c.company_name,
    'edit-hr-name': c.hr_name,
    'edit-hr-phone': c.hr_phone
  };
  Object.entries(editFields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

async function saveCompanyProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const data = await api.put('/companies/profile', {
    companyName: document.getElementById('edit-company-name').value,
    hrName: document.getElementById('edit-hr-name').value,
    hrPhone: document.getElementById('edit-hr-phone').value
  });

  setLoading(btn, false);
  if (data?.success) {
    showToast('Profile updated', 'success');
    loadCompanyProfile();
  } else {
    showToast(data?.message || 'Update failed', 'error');
  }
}

async function changeCompanyPassword(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (newPass !== confirmPass) { showToast('Passwords do not match', 'error'); return; }

  setLoading(btn, true);
  const data = await api.put('/companies/change-password', {
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
    drives: loadDrives,
    applicants: loadAllApplicants,
    messages: loadCompanyMessages,
    profile: loadCompanyProfile
  };
  if (loaders[section]) loaders[section]();
}

async function loadCompanyMessages() {
  const container = document.getElementById('companyMessagesList');
  if (!container) return;
  container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:1rem;">Use the button above to contact the placement admin.</p>';
}

async function sendCompanyMessage(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const data = await api.post('/companies/messages', {
    subject: document.getElementById('companyMsgSubject').value,
    message: document.getElementById('companyMsgBody').value
  });
  setLoading(btn, false);

  if (data?.success) {
    showToast('Message sent to admin successfully', 'success');
    document.getElementById('companyMsgModal').style.display = 'none';
    e.target.reset();
  } else {
    showToast(data?.message || 'Failed to send message', 'error');
  }
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
