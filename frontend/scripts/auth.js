const showToast = (message, type = 'info') => {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}@keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(110%)}}';
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.id = 'toast';
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
  toast.style.cssText = `position:fixed;top:24px;right:24px;padding:14px 20px;border-radius:10px;background:${colors[type]||colors.info};color:#fff;font-weight:500;z-index:99999;box-shadow:0 6px 20px rgba(0,0,0,0.18);animation:toastIn 0.35s ease forwards;max-width:360px;font-size:14px;line-height:1.5;`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3650);
};

const setLoading = (btn, loading) => {
  if (loading) {
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = 'Please wait...';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.original || btn.innerHTML;
    btn.disabled = false;
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const handleLogin = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const role = document.querySelector('.role-option.active')?.dataset.role || 'student';
  let userId, password;

  if (role === 'student') {
    userId = document.getElementById('studentId').value.trim();
    password = document.getElementById('studentPassword').value;
  } else if (role === 'admin') {
    userId = document.getElementById('adminId').value.trim();
    password = document.getElementById('adminPassword').value;
  } else {
    userId = document.getElementById('companyId').value.trim();
    password = document.getElementById('companyPassword').value;
  }

  if (!userId || !password) {
    showToast('Please fill in all fields', 'error');
    setLoading(btn, false);
    return;
  }

  const endpoint = role === 'student'
    ? '/auth/students/login'
    : role === 'admin'
    ? '/auth/admins/login'
    : '/auth/companies/login';

  const data = await api.post(endpoint, { userId, password }, true);
  setLoading(btn, false);

  if (!data || !data.success) {
    showToast(data?.message || 'Login failed', 'error');
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('role', role);

  showToast('Login successful! Redirecting...', 'success');

  const redirects = {
    student: '/frontend/pages/student-dashboard.html',
    admin: '/frontend/pages/admin-dashboard.html',
    company: '/frontend/pages/company-dashboard.html'
  };

  setTimeout(() => { window.location.href = redirects[role]; }, 800);
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const handleForgotPassword = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const userId = document.getElementById('resetUserId').value.trim();
  const role = document.querySelector('.role-option.active')?.dataset.role || 'student';

  if (!userId) {
    showToast('Please enter your ID', 'error');
    setLoading(btn, false);
    return;
  }

  const data = await api.post('/auth/forgot-password', { userId, role });
  setLoading(btn, false);

  if (!data || !data.success) {
    showToast(data?.message || 'Failed to send reset email', 'error');
    return;
  }

  showToast('Password reset link sent to your registered email!', 'success');
  document.getElementById('forgotPasswordModal').style.display = 'none';
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
const handleResetPassword = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  setLoading(btn, true);

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    setLoading(btn, false);
    return;
  }

  const data = await api.post('/auth/reset-password', { token, role, newPassword });
  setLoading(btn, false);

  if (!data || !data.success) {
    showToast(data?.message || 'Reset failed', 'error');
    return;
  }

  showToast('Password reset successfully! Redirecting to login...', 'success');
  setTimeout(() => { window.location.href = '/frontend/pages/login-page.html'; }, 1500);
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
const logout = () => {
  localStorage.clear();
  window.location.href = '/frontend/pages/login-page.html';
};

// ─── GUARD ────────────────────────────────────────────────────────────────────
const requireAuth = (expectedRole) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || role !== expectedRole) {
    localStorage.clear();
    window.location.href = '/frontend/pages/login-page.html';
  } else {
    document.body.style.visibility = 'visible';
  }
};

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) || {}; }
  catch { return {}; }
};

window.showToast = showToast;
window.setLoading = setLoading;
window.logout = logout;
window.requireAuth = requireAuth;
window.getUser = getUser;
window.handleLogin = handleLogin;
window.handleForgotPassword = handleForgotPassword;
window.handleResetPassword = handleResetPassword;
