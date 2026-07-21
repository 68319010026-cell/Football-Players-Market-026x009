const API_BASE_URL = 'http://localhost:3000'; // เปลี่ยนเป็น Port ของ Backend คุณ

// ==========================================
// 1. ระบบ AUTHENTICATION & MODAL
// ==========================================
function toggleAuthModal(show) {
  const modal = document.getElementById('auth-modal');
  document.getElementById('auth-msg').innerText = '';
  if (show) modal.classList.remove('hidden');
  else modal.classList.add('hidden');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  document.getElementById('auth-msg').innerText = '';

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginBtn.classList.add('active');
    regBtn.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    loginBtn.classList.remove('active');
    regBtn.classList.add('active');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const msgEl = document.getElementById('auth-msg');

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.style.color = '#8FD9A8';
      msgEl.innerText = 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ';
      switchAuthTab('login');
    } else {
      msgEl.style.color = 'var(--danger)';
      msgEl.innerText = data.message || 'เกิดข้อผิดพลาดในการสมัคร';
    }
  } catch (err) {
    msgEl.style.color = 'var(--danger)';
    msgEl.innerText = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
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
      if(data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      
      toggleAuthModal(false);
      checkAuthStatus();
    } else {
      msgEl.style.color = 'var(--danger)';
      msgEl.innerText = data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
  } catch (err) {
    msgEl.style.color = 'var(--danger)';
    msgEl.innerText = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
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

  if (token) {
    guestView.classList.add('hidden');
    userView.classList.remove('hidden');
  } else {
    guestView.classList.remove('hidden');
    userView.classList.add('hidden');
  }
}

checkAuthStatus();


// ==========================================
// 2. ระบบจัดการการ์ดนักเตะ (เชื่อมต่อ API จริง)
// ==========================================
(function(){
  const form = document.getElementById('player-form');
  const nameInput = document.getElementById('input-name');
  const positionSelect = document.getElementById('select-position');
  const ratingInput = document.getElementById('input-rating');
  const ratingBadge = document.getElementById('rating-badge');
  const imageInput = document.getElementById('input-image');
  const priceInput = document.getElementById('input-price');
  const displayArea = document.getElementById('player-display-area');
  const statusLine = document.getElementById('status-line');
  const testBtn = document.getElementById('test-btn');
  const pushBtn = document.getElementById('push-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editingBanner = document.getElementById('editing-banner');
  const squadList = document.getElementById('squad-list');
  const squadTitle = document.getElementById('squad-title');

  const positionLabels = { GK:'ผู้รักษาประตู', DF:'กองหลัง', MF:'กองกลาง', FW:'กองหน้า' };

  let players = [];
  let editingId = null;

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function formatPrice(price){
    const n = Number(price);
    if(!price || isNaN(n)) return null;
    return n.toLocaleString('th-TH') + ' บาท';
  }

  function renderCard(){
    const name = nameInput.value.trim() || 'ชื่อนักเตะ';
    const position = positionSelect.value;
    const rating = ratingInput.value;
    const imageUrl = imageInput.value.trim();
    const priceLabel = formatPrice(priceInput.value);

    ratingBadge.textContent = rating;

    const photoHtml = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" onerror="this.parentElement.innerHTML='<span class=\\'placeholder\\'>โหลดรูปไม่ได้</span>';">`
      : `<span class="placeholder">ยังไม่มีรูป</span>`;

    displayArea.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="card-top">
            <div>
              <div class="card-rating">${escapeHtml(rating)}</div>
              <div class="card-position">${escapeHtml(position)}</div>
            </div>
            <div class="card-crest">DT</div>
          </div>
          <div class="card-photo-wrap">${photoHtml}</div>
          <div class="card-divider"></div>
          <div class="card-name">${escapeHtml(name)}</div>
          <div class="card-foot">${escapeHtml(positionLabels[position] || '')}</div>
        </div>
        ${priceLabel ? `<div class="card-price">${escapeHtml(priceLabel)}</div>` : ''}
      </div>
    `;
  }

  function renderSquadList(){
    squadTitle.style.display = players.length ? 'block' : 'none';
    squadList.innerHTML = players.map(function(p){
      const priceLabel = formatPrice(p.price) || 'ยังไม่ตั้งราคา';
      const id = p._id || p.id; // รองรับทั้ง MongoDB _id หรือ id ทั่วไป
      return `
        <div class="squad-item" data-id="${id}">
          <span class="r">${escapeHtml(String(p.rating))}</span>
          <span class="p">${escapeHtml(p.position)}</span>
          <span class="n">${escapeHtml(p.name)}</span>
          <span class="price">${escapeHtml(priceLabel)}</span>
          <span class="item-actions">
            <button type="button" class="edit-btn" data-action="edit" data-id="${id}">แก้ไข</button>
            <button type="button" class="edit-btn" style="border-color:var(--danger); color:var(--danger);" data-action="delete" data-id="${id}">ลบ</button>
          </span>
        </div>
      `;
    }).join('');
  }

  // ดึงรายการนักเตะจาก Backend (GET)
  async function fetchPlayers() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/players`);
      if (res.ok) {
        players = await res.json();
        renderSquadList();
      }
    } catch (err) {
      console.log('ยังไม่สามารถดึงข้อมูลนักเตะได้:', err);
    }
  }

  // ลบนักเตะออกจาก Backend (DELETE)
  async function deletePlayer(id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการลบนักเตะ');
      toggleAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        statusLine.textContent = 'ลบนักเตะเรียบร้อยแล้ว';
        statusLine.className = 'status-line ok';
        fetchPlayers();
      } else {
        statusLine.textContent = 'ไม่สามารถลบนักเตะได้';
        statusLine.className = 'status-line err';
      }
    } catch (err) {
      statusLine.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      statusLine.className = 'status-line err';
    }
  }

  function enterEditMode(id){
    const player = players.find(p => (p._id || p.id) == id);
    if(!player) return;
    editingId = id;
    nameInput.value = player.name;
    positionSelect.value = player.position;
    ratingInput.value = player.rating;
    imageInput.value = player.image || '';
    priceInput.value = player.price || '';
    renderCard();

    pushBtn.textContent = 'บันทึกการแก้ไข';
    pushBtn.classList.add('editing');
    cancelEditBtn.style.display = 'inline-block';
    editingBanner.classList.add('show');
    statusLine.textContent = `กำลังแก้ไข "${player.name}"`;
    statusLine.className = 'status-line';
    form.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function exitEditMode(){
    editingId = null;
    pushBtn.textContent = 'Push เข้าตลาด';
    pushBtn.classList.remove('editing');
    cancelEditBtn.style.display = 'none';
    editingBanner.classList.remove('show');
  }

  ['input','change'].forEach(evt => {
    nameInput.addEventListener(evt, renderCard);
    positionSelect.addEventListener(evt, renderCard);
    ratingInput.addEventListener(evt, renderCard);
    imageInput.addEventListener(evt, renderCard);
    priceInput.addEventListener(evt, renderCard);
  });

  testBtn.addEventListener('click', function(){
    nameInput.value = 'ทดสอบ นักเตะ';
    positionSelect.value = 'FW';
    ratingInput.value = 88;
    imageInput.value = '';
    priceInput.value = 2500;
    renderCard();
    statusLine.textContent = 'พิมพ์ทดสอบแล้ว — ลองดูการ์ดทางขวา';
    statusLine.className = 'status-line ok';
  });

  cancelEditBtn.addEventListener('click', function(){
    exitEditMode();
    form.reset();
    ratingInput.value = 75;
    renderCard();
    statusLine.textContent = 'ยกเลิกการแก้ไขแล้ว';
    statusLine.className = 'status-line';
  });

  squadList.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit') {
      enterEditMode(id);
    } else if (action === 'delete') {
      if (confirm('คุณต้องการลบนักเตะคนนี้ใช่หรือไม่?')) {
        deletePlayer(id);
      }
    }
  });

  // บันทึก / แก้ไขข้อมูลนักเตะ (POST & PUT)
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const name = nameInput.value.trim();
    if(!name){
      statusLine.textContent = 'กรุณากรอกชื่อนักเตะก่อน Push';
      statusLine.className = 'status-line err';
      nameInput.focus();
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ Push หรือแก้ไขนักเตะ');
      toggleAuthModal(true);
      return;
    }

    const payload = {
      name: name,
      position: positionSelect.value,
      rating: Number(ratingInput.value),
      image: imageInput.value.trim(),
      price: priceInput.value ? Number(priceInput.value) : null
    };

    try {
      if(editingId !== null){
        // UPDATE (PUT)
        const res = await fetch(`${API_BASE_URL}/api/players/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          statusLine.textContent = `บันทึกการแก้ไข "${name}" เรียบร้อยแล้ว`;
          statusLine.className = 'status-line ok';
          exitEditMode();
          fetchPlayers();
        } else {
          statusLine.textContent = 'ไม่สามารถบันทึกการแก้ไขได้';
          statusLine.className = 'status-line err';
        }
      } else {
        // CREATE (POST)
        const res = await fetch(`${API_BASE_URL}/api/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          statusLine.textContent = `Push "${name}" เข้าตลาดเรียบร้อยแล้ว!`;
          statusLine.className = 'status-line ok';
          fetchPlayers();
        } else {
          statusLine.textContent = 'ไม่สามารถสร้างนักเตะได้';
          statusLine.className = 'status-line err';
        }
      }

      form.reset();
      ratingInput.value = 75;
      renderCard();

    } catch (err) {
      statusLine.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
      statusLine.className = 'status-line err';
    }
  });

  renderCard();
  fetchPlayers(); // ดึงรายการนักเตะทันทีเมื่อโหลดหน้าเว็บ
})();