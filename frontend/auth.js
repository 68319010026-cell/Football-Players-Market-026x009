// ==========================================
// AUTHENTICATION MODULE (auth.js)
// ==========================================
const API_BASE_URL = 'http://localhost:3000';

function toggleAuthModal(show) {
  const modal = document.getElementById('auth-modal');
  const msgEl = document.getElementById('auth-msg');
  if (msgEl) msgEl.innerText = '';
  if (modal) {
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
  }
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  const msgEl = document.getElementById('auth-msg');
  if (msgEl) msgEl.innerText = '';

  if (tab === 'login') {
    if (loginForm) loginForm.classList.remove('hidden');
    if (regForm) regForm.classList.add('hidden');
    if (loginBtn) loginBtn.classList.add('active');
    if (regBtn) regBtn.classList.remove('active');
  } else {
    if (loginForm) loginForm.classList.add('hidden');
    if (regForm) regForm.classList.remove('hidden');
    if (loginBtn) loginBtn.classList.remove('active');
    if (regBtn) regBtn.classList.add('active');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email')?.value;
  const password = document.getElementById('reg-password')?.value;
  const msgEl = document.getElementById('auth-msg');

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      if (msgEl) {
        msgEl.style.color = '#8FD9A8';
        msgEl.innerText = 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ';
      }
      switchAuthTab('login');
    } else {
      if (msgEl) {
        msgEl.style.color = '#ff4d4d';
        msgEl.innerText = data.message || 'เกิดข้อผิดพลาดในการสมัคร';
      }
    }
  } catch (err) {
    if (msgEl) {
      msgEl.style.color = '#ff4d4d';
      msgEl.innerText = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    }
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const msgEl = document.getElementById('auth-msg');

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      
      toggleAuthModal(false);
      checkAuthStatus();
    } else {
      if (msgEl) {
        msgEl.style.color = '#ff4d4d';
        msgEl.innerText = data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      }
    }
  } catch (err) {
    if (msgEl) {
      msgEl.style.color = '#ff4d4d';
      msgEl.innerText = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
    }
  }
}

async function handleLogout() {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
  } catch(e) { console.log(e); }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  checkAuthStatus();
}

function checkAuthStatus() {
  const token = localStorage.getItem('accessToken');
  const guestView = document.getElementById('auth-guest-view');
  const userView = document.getElementById('auth-user-view');

  if (guestView && userView) {
    if (token) {
      guestView.classList.add('hidden');
      userView.classList.remove('hidden');
    } else {
      guestView.classList.remove('hidden');
      userView.classList.add('hidden');
    }
  }
}

// ผูกฟังก์ชันไว้ที่ window เพื่อป้องกันปัญหา Scope บล็อก onclick
window.toggleAuthModal = toggleAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.checkAuthStatus = checkAuthStatus;