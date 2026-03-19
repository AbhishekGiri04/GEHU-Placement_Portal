const API_BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const request = async (method, endpoint, body = null, skipAuthRedirect = false) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (res.status === 401 && !skipAuthRedirect) {
    localStorage.clear();
    window.location.href = '/frontend/pages/login-page.html';
    return;
  }

  return data;
};

const uploadFile = async (endpoint, formData) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });
  return res.json();
};

const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, body, skipAuthRedirect = false) => request('POST', endpoint, body, skipAuthRedirect),
  put: (endpoint, body) => request('PUT', endpoint, body),
  delete: (endpoint) => request('DELETE', endpoint),
  upload: (endpoint, formData) => uploadFile(endpoint, formData)
};

window.api = api;
