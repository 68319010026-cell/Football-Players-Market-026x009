// 1. ดึงข้อมูลเก่าจาก LocalStorage (ถ้ามี) ถ้าไม่มีให้เป็นอาร์เรย์ว่าง []
let myTeam = JSON.parse(localStorage.getItem('dreamTeam')) || [];

// 2. ฟังก์ชันสำหรับเซฟข้อมูลลง LocalStorage (จะเรียกใช้ทุกครั้งที่มีการ เพิ่ม หรือ ลบ นักเตะ)
function saveToLocalStorage() {
    localStorage.setItem('dreamTeam', JSON.stringify(myTeam));
}