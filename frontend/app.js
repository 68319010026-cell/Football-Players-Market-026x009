// งบประมาณเริ่มต้นของทีม (100 ล้านยูโร)
let teamBudget = 100000000;
// ตัวแปรสำหรับเก็บ ID ของนักเตะที่กำลังถูกแก้ไข (ถ้าไม่มีจะเป็น null)
let editPlayerId = null;

document.addEventListener('DOMContentLoaded', () => {
    const playerForm = document.getElementById('player-form');
    const submitBtn = playerForm.querySelector('.btn-submit-neon');

    if (playerForm) {
        playerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

            // ดึงค่าจากฟอร์ม
            const name = document.getElementById('input-name').value;
            const position = document.getElementById('select-position').value;
            const rating = document.getElementById('input-rating').value;
            const imageUrl = document.getElementById('input-image').value;

            let players = JSON.parse(localStorage.getItem('players')) || [];

            if (editPlayerId !== null) {
                // --- โหมดแก้ไขข้อมูล ---
                players = players.map(player => {
                    if (player.id === editPlayerId) {
                        return {
                            ...player,
                            name: name,
                            position: position,
                            rating: rating,
                            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150'
                        };
                    }
                    return player;
                });

                // รีเซ็ตสถานะโหมดแก้ไขกลับเป็นปกติ
                editPlayerId = null;
                if (submitBtn) {
                    submitBtn.innerHTML = `<span class="icon-check">✓</span> เซ็นสัญญาเข้าทีม`;
                    submitBtn.style.background = 'linear-gradient(90deg, #10b981, #0df59b)'; // กลับเป็นสีเขียว
                }
            } else {
                // --- โหมดเพิ่มนักเตะใหม่ (ปกติ) ---
                const newPlayer = {
                    id: Date.now().toString(),
                    name: name,
                    position: position,
                    rating: rating,
                    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150'
                };
                players.push(newPlayer);
            }

            // บันทึกและวาดการ์ดใหม่
            localStorage.setItem('players', JSON.stringify(players));
            playerForm.reset();
            updatePlayerDisplay();
        });
    }

    updatePlayerDisplay();
});

// ฟังก์ชันวาดการ์ดนักเตะ
function updatePlayerDisplay() {
    const displayArea = document.getElementById('player-display-area');
    if (!displayArea) return;

    displayArea.innerHTML = '';
    const players = JSON.parse(localStorage.getItem('players')) || [];

    if (players.length === 0) {
        displayArea.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #8fa0b0; padding-top: 100px;">ยังไม่มีนักเตะในทีมของคุณ ลองเพิ่มนักเตะดูสิ!</p>`;
        return;
    }

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'fut-card';
        card.innerHTML = `
            <div class="card-top">
                <span class="rating">${player.rating}</span>
                <span class="position">${player.position}</span>
            </div>
            <div class="image-wrapper">
                <img src="${player.imageUrl}" alt="${player.name}">
            </div>
            <div class="card-bottom">
                <div class="player-name">${player.name}</div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="handleEdit('${player.id}')">แก้ไข</button>
                    <button class="btn-remove" onclick="handleDelete('${player.id}')">ปลดออก</button>
                </div>
            </div>
        `;
        displayArea.appendChild(card);
    });
}

// ฟังก์ชันคำนวณค่าตัวนักเตะ (คุณเป็นคนคุมลอจิกนี้)
function calculatePlayerPrice(position, rating) {
    let basePrice = rating * 100000; // พลัง x 100,000 ยูโร

    // ตัวคูณตามความฮิตของตำแหน่ง
    if (position === 'กองหน้า (FW)') {
        basePrice *= 1.5;
    } else if (position === 'กองกลาง (MF)') {
        basePrice *= 1.2;
    } else if (position === 'กองหลัง (DF)') {
        basePrice *= 0.9;
    } else if (position === 'ผู้รักษาประตู (GK)') {
        basePrice *= 0.8;
    }

    return Math.round(basePrice);
}

// ตัวอย่างจังหวะที่ผู้ใช้กดเพิ่มนักเตะ
function handleAddPlayer(name, position, rating) {
    const price = calculatePlayerPrice(position, rating);

    // 🚨 เช็กก่อนว่างบพอไหม
    if (teamBudget - price < 0) {
        alert(`❌ งบประมาณไม่พอ! นักเตะคนนี้ค่าตัว ${price.toLocaleString()} EUR แต่งบเหลือเพียง ${teamBudget.toLocaleString()} EUR`);
        return; // เด้งออก ไม่ยอมให้เพิ่ม
    }

    // หักเงินออกจากงบรวม
    teamBudget -= price;

    // ... (ลอจิกการเพิ่มนักเตะของคุณตัวเดิม เช่น push เข้า Array และ render การ์ด) ...
    // ตอนบันทึกข้อมูลนักเตะ อย่าลืมพ่วงค่า price นี้ลงไปด้วยนะ!
}

function handleDeletePlayer(playerId) {
    // 1. หาตัวนักเตะที่จะลบก่อน เพื่อดูว่าค่าตัวเขาเท่าไหร่
    const player = players.find(p => p.id === playerId);
    
    if (player) {
        // 2. คืนเงินค่าตัวเข้าสู่ งบประมาณหลัก
        teamBudget += player.price;
        
        // 3. ทำการลบนักเตะตามลอจิกเดิมของคุณ...
    }
}

// ฟังก์ชันเตรียมข้อมูลก่อนแก้ไข (เมื่อคลิกปุ่ม "แก้ไข")
window.handleEdit = function(playerId) {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const playerToEdit = players.find(p => p.id === playerId);

    if (playerToEdit) {
        // 1. ดึงข้อมูลนักเตะกลับไปใส่ในช่องกรอกของฟอร์ม
        document.getElementById('input-name').value = playerToEdit.name;
        document.getElementById('select-position').value = playerToEdit.position;
        document.getElementById('input-rating').value = playerToEdit.rating;
        document.getElementById('input-image').value = playerToEdit.imageUrl;

        // 2. ล็อก ID นักเตะที่กำลังแก้ไขไว้
        editPlayerId = playerId;

        // 3. เปลี่ยนหน้าตาปุ่ม Submit ให้เด่นชัดว่าเป็น "โหมดแก้ไข"
        const submitBtn = document.querySelector('.btn-submit-neon');
        if (submitBtn) {
            submitBtn.innerHTML = `✏️ บันทึกการแก้ไขข้อมูล`;
            submitBtn.style.background = 'linear-gradient(90deg, #f5b041, #f39c12)'; // เปลี่ยนเป็นสีส้มทอง
        }

        // เลื่อนหน้าจอกลับขึ้นไปที่ฟอร์ม (สำหรับมือถือ)
        document.querySelector('.control-panel').scrollIntoView({ behavior: 'smooth' });
    }
}

// ฟังก์ชันลบนักเตะ
window.handleDelete = function(playerId) {
    // ป้องกันการลบข้อมูลขณะที่กำลังกดแก้ไขค้างไว้
    if (editPlayerId === playerId) {
        alert("กรุณาบันทึกข้อมูลการแก้ไข หรือรีเซ็ตฟอร์มก่อนทำการปลดนักเตะคนนี้ออกครับ!");
        return;
    }

    let players = JSON.parse(localStorage.getItem('players')) || [];
    players = players.filter(player => player.id !== playerId);
    localStorage.setItem('players', JSON.stringify(players));
    updatePlayerDisplay();
}