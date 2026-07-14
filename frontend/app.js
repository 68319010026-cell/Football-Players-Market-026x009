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

  // in-memory squad data (replace with real backend calls when ready)
  let players = [];
  let nextId = 1;
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
      return `
        <div class="squad-item" data-id="${p.id}">
          <span class="r">${escapeHtml(String(p.rating))}</span>
          <span class="p">${escapeHtml(p.position)}</span>
          <span class="n">${escapeHtml(p.name)}</span>
          <span class="price">${escapeHtml(priceLabel)}</span>
          <span class="item-actions">
            <button type="button" class="edit-btn" data-action="edit" data-id="${p.id}">แก้ไข</button>
            <button type="button" class="delete-btn" data-action="delete" data-id="${p.id}">ลบ</button>
          </span>
        </div>
      `;
    }).join('');
  }

  function enterEditMode(id){
    const player = players.find(p => p.id === id);
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
    const id = Number(btn.dataset.id);
    if(btn.dataset.action === 'edit'){
      enterEditMode(id);
    } else if(btn.dataset.action === 'delete'){
      const player = players.find(p => p.id === id);
      players = players.filter(p => p.id !== id);
      if(editingId === id) exitEditMode();
      renderSquadList();
      statusLine.textContent = player ? `ลบ "${player.name}" ออกจากตลาดแล้ว` : 'ลบนักเตะออกจากตลาดแล้ว';
      statusLine.className = 'status-line';
    }
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = nameInput.value.trim();
    if(!name){
      statusLine.textContent = 'กรุณากรอกชื่อนักเตะก่อน Push';
      statusLine.className = 'status-line err';
      nameInput.focus();
      return;
    }

    const payload = {
      name: name,
      position: positionSelect.value,
      rating: Number(ratingInput.value),
      image: imageInput.value.trim(),
      price: priceInput.value ? Number(priceInput.value) : null
    };

    if(editingId !== null){
      // Update existing player
      // Real backend call would look like:
      // fetch(`/api/players/${editingId}`, { method:'PUT', body: JSON.stringify(payload) })
      const idx = players.findIndex(p => p.id === editingId);
      if(idx !== -1){
        players[idx] = Object.assign({ id: editingId }, payload);
      }
      console.log('Update player payload:', payload);
      statusLine.textContent = `บันทึกการแก้ไข "${name}" เรียบร้อยแล้ว`;
      statusLine.className = 'status-line ok';
      exitEditMode();
    } else {
      // Create new player
      // Real backend call would look like:
      // fetch('/api/players', { method:'POST', body: JSON.stringify(payload) })
      const newPlayer = Object.assign({ id: nextId++ }, payload);
      players.unshift(newPlayer);
      console.log('Push player payload:', payload);
      statusLine.textContent = `Push "${name}" เข้าตลาดเรียบร้อยแล้ว!`;
      statusLine.className = 'status-line ok';
    }

    renderSquadList();
    form.reset();
    ratingInput.value = 75;
    renderCard();
  });

  renderCard();
  renderSquadList();
})();