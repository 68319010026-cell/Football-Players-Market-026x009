// 1. รอให้โครงสร้างเว็บโหลดเสร็จสมบูรณ์ก่อนทำงาน
document.addEventListener('DOMContentLoaded', () => {
    const playerForm = document.getElementById('player-form');

    // 2. ดักจับเหตุการณ์ตอนที่ผู้ใช้กดปุ่มส่งฟอร์ม (Submit)
    if (playerForm) {
        playerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // ป้องกันหน้าเว็บรีเฟรชตัวเอง

            // ดึงค่าจากช่อง Input ตาม ID ที่เรากำหนดไว้เป๊ะๆ
            const name = document.getElementById('input-name').value;
            const position = document.getElementById('select-position').value;
            const rating = document.getElementById('input-rating').value;
            const imageUrl = document.getElementById('input-image').value;

            // 3. ส่งข้อมูลไปให้ฟังก์ชัน addPlayer ของฝั่ง Backend ทำงาน (เก็บลง LocalStorage)
            if (typeof addPlayer === 'function') {
                addPlayer(name, position, rating, imageUrl);
                
                // รีเซ็ตล้างข้อมูลในฟอร์มหลังจากเพิ่มเสร็จ
                playerForm.reset();

                // สั่งอัปเดตแสดงการ์ดใหม่ล่าสุดบนจอทันที
                updatePlayerDisplay();
            } else {
                console.error("ไม่พบฟังก์ชัน addPlayer ของ Backend!");
            }
        });
    }

    // สั่งให้แสดงรายชื่อนักเตะที่มีอยู่ตั้งแต่ตอนเปิดหน้าเว็บครั้งแรก
    updatePlayerDisplay();
});

// 4. ฟังก์ชันอัปเดตและสร้าง HTML เพื่อแสดงการ์ดนักเตะบนหน้าจอ
function updatePlayerDisplay() {
    const displayArea = document.getElementById('player-display-area');
    if (!displayArea) return;

    // เคลียร์พื้นที่แสดงผลเดิมเพื่อรอพ่นข้อมูลใหม่
    displayArea.innerHTML = '';

    // สมมติว่า Backend เก็บข้อมูลไว้ใน LocalStorage หรือมีตัวแปรดึงข้อมูลออกมา
    const players = JSON.parse(localStorage.getItem('players')) || [];

    if (players.length === 0) {
        displayArea.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #8fa0b0;">ยังไม่มีนักเตะในทีมของคุณ ลองเพิ่มนักเตะดูสิ!</p>`;
        return;
    }

    // วนลูปเพื่อสร้างการ์ดของนักเตะแต่ละคน
    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'fut-card';
        card.innerHTML = `
            <div class="card-top">
                <span class="rating">${player.rating}</span>
                <span class="position">${player.position}</span>
            </div>
            <div class="image-wrapper">
                <img src="${player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150'}" alt="${player.name}">
            </div>
            <div class="card-bottom">
                <div class="player-name">${player.name}</div>
                <button class="btn-info">ดูข้อมูล</button>
                <button class="btn-remove" onclick="handleDelete('${player.id}')">ปลดออกจากทีม</button>
            </div>
        `;
        displayArea.appendChild(card);
    });
}

// 5. ฟังก์ชันสำหรับปุ่มลบเมื่อคลิก "ปลดออกจากทีม"
window.handleDelete = function(playerId) {
    if (typeof deletePlayer === 'function') {
        deletePlayer(playerId); // เรียกใช้ฟังก์ชันลบของ Backend
        updatePlayerDisplay(); // อัปเดตแสดงหน้าจอใหม่หลังลบ
    } else {
        console.error("ไม่พบฟังก์ชัน deletePlayer ของ Backend!");
    }
}