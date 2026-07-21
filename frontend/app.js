// ==========================================
// CARD & MARKET CONTROLLER MODULE (app.js)
// ==========================================
(function () {
  'use strict';

  const API_BASE_URL = 'http://localhost:3000';

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.checkAuthStatus === 'function') {
      window.checkAuthStatus();
    }

    // Input Elements
    const form = document.getElementById('player-form');
    const nameInput = document.getElementById('player-name');
    const posSelect = document.getElementById('player-pos');
    const ratingInput = document.getElementById('player-rating');
    const ratingBadge = document.getElementById('rating-val');
    const priceInput = document.getElementById('player-price');
    const imgInput = document.getElementById('player-img');

    // Display Card Elements
    const cardRating = document.getElementById('card-rating-display');
    const cardPos = document.getElementById('card-pos-display');
    const cardName = document.getElementById('card-name-display');
    const cardPrice = document.getElementById('card-price-display');
    const cardPhotoWrap = document.querySelector('.card-photo-wrap');

    // Other UI Elements
    const statusLine = document.getElementById('status-line');
    const testBtn = document.getElementById('test-btn');
    const pushBtn = document.getElementById('push-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editingBanner = document.getElementById('editing-banner');
    const squadList = document.getElementById('squad-list');
    const squadTitle = document.getElementById('squad-title');

    let players = [];
    let editingId = null;

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }

    function formatPrice(price) {
      const n = Number(price);
      if (!price || isNaN(n)) return '$0';
      return '$' + n.toLocaleString();
    }

    // Live Preview การ์ดฝั่งขวา
    function updateCard() {
      const rating = ratingInput ? ratingInput.value : '85';
      const name = (nameInput && nameInput.value.trim() !== '') ? nameInput.value.trim() : 'PLAYER NAME';
      const pos = posSelect ? posSelect.value : 'FW';
      const price = priceInput ? formatPrice(priceInput.value) : '$0';
      const img = imgInput ? imgInput.value.trim() : '';

      if (ratingBadge) ratingBadge.textContent = rating;
      if (cardRating) cardRating.textContent = rating;
      if (cardName) cardName.textContent = name;
      if (cardPos) cardPos.textContent = pos;
      if (cardPrice) cardPrice.textContent = price;

      if (cardPhotoWrap) {
        if (img) {
          cardPhotoWrap.innerHTML = `<img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" onerror="this.parentElement.innerHTML='<span class=\\'placeholder\\'>NO PHOTO</span>';">`;
        } else {
          cardPhotoWrap.innerHTML = `<span class="placeholder">NO PHOTO</span>`;
        }
      }
    }

    function renderSquadList() {
      if (!squadList) return;
      if (squadTitle) squadTitle.style.display = players.length ? 'block' : 'none';

      squadList.innerHTML = players.map(function (p) {
        const id = p._id || p.id;
        return `
          <div class="squad-item" data-id="${id}">
            <span class="r">${escapeHtml(String(p.rating))}</span>
            <span class="p">${escapeHtml(p.position)}</span>
            <span class="n">${escapeHtml(p.name)}</span>
            <span class="price">${escapeHtml(formatPrice(p.price))}</span>
            <span class="item-actions">
              <button type="button" class="edit-btn" data-action="edit" data-id="${id}">แก้ไข</button>
              <button type="button" class="edit-btn del" data-action="delete" data-id="${id}">ลบ</button>
            </span>
          </div>
        `;
      }).join('');
    }

    async function fetchPlayers() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/players`);
        if (res.ok) {
          players = await res.json();
          renderSquadList();
        }
      } catch (err) {
        console.log('Backend ยังไม่ได้รัน หรือดึงข้อมูลไม่ได้');
      }
    }

    async function deletePlayer(id) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการลบนักเตะ');
        if (window.toggleAuthModal) window.toggleAuthModal(true);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/players/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          if (statusLine) {
            statusLine.textContent = 'ลบนักเตะเรียบร้อยแล้ว';
            statusLine.className = 'status-line ok';
          }
          fetchPlayers();
        }
      } catch (err) {
        if (statusLine) {
          statusLine.textContent = 'เกิดข้อผิดพลาดในการลบ';
          statusLine.className = 'status-line err';
        }
      }
    }

    function enterEditMode(id) {
      const player = players.find(p => (p._id || p.id) == id);
      if (!player) return;
      editingId = id;
      if (nameInput) nameInput.value = player.name;
      if (posSelect) posSelect.value = player.position;
      if (ratingInput) ratingInput.value = player.rating;
      if (imgInput) imgInput.value = player.image || '';
      if (priceInput) priceInput.value = player.price || '';
      updateCard();

      if (pushBtn) pushBtn.textContent = 'SAVE CHANGES';
      if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';
      if (editingBanner) editingBanner.classList.add('show');
    }

    function exitEditMode() {
      editingId = null;
      if (pushBtn) pushBtn.textContent = 'ADD PLAYER';
      if (cancelEditBtn) cancelEditBtn.style.display = 'none';
      if (editingBanner) editingBanner.classList.remove('show');
    }

    // ผูก Events ทุกช่องข้อมูลให้ขยับการ์ดแบบ Realtime
    [nameInput, posSelect, ratingInput, priceInput, imgInput].forEach(el => {
      if (el) {
        el.addEventListener('input', updateCard);
        el.addEventListener('change', updateCard);
      }
    });

    if (testBtn) {
      testBtn.addEventListener('click', function () {
        if (nameInput) nameInput.value = 'Lionel Messi';
        if (posSelect) posSelect.value = 'FW';
        if (ratingInput) ratingInput.value = 93;
        if (priceInput) priceInput.value = 50000000;
        if (imgInput) imgInput.value = '';
        updateCard();
      });
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', function () {
        exitEditMode();
        if (form) form.reset();
        if (ratingInput) ratingInput.value = 85;
        updateCard();
      });
    }

    if (squadList) {
      squadList.addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'edit') enterEditMode(id);
        else if (action === 'delete') {
          if (confirm('คุณต้องการลบนักเตะคนนี้ใช่หรือไม่?')) deletePlayer(id);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
          alert('กรุณาเข้าสู่ระบบก่อนทำรายการ เพิ่ม/แก้ไข นักเตะ');
          if (window.toggleAuthModal) window.toggleAuthModal(true);
          return;
        }

        const payload = {
          name: name,
          position: posSelect ? posSelect.value : 'FW',
          rating: ratingInput ? Number(ratingInput.value) : 85,
          image: imgInput ? imgInput.value.trim() : '',
          price: (priceInput && priceInput.value) ? Number(priceInput.value) : null
        };

        try {
          const method = editingId !== null ? 'PUT' : 'POST';
          const url = editingId !== null ? `${API_BASE_URL}/api/players/${editingId}` : `${API_BASE_URL}/api/players`;

          const res = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            exitEditMode();
            form.reset();
            if (ratingInput) ratingInput.value = 85;
            updateCard();
            fetchPlayers();
          }
        } catch (err) {
          console.log(err);
        }
      });
    }

    updateCard();
    fetchPlayers();
  });
})();