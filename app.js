// ==========================================
// 🧠 BACKEND ENGINE: Football Club Manager Class
// ==========================================
class FootballClubManager {
    constructor(initialBudget = 100000000) {
        // ดึงข้อมูลจาก localStorage ถ้าไม่มีให้เริ่มจากค่าเริ่มต้น
        this.players = JSON.parse(localStorage.getItem('players')) || [];
        this.budget = localStorage.getItem('teamBudget') 
            ? parseInt(localStorage.getItem('teamBudget')) 
            : initialBudget;
    }

    // 1. Logic คำนวณค่าตัวนักเตะตามตำแหน่งและค่าพลัง (Algorithm)
    calculatePlayerValue(position, rating) {
        let baseValue = rating * 100000; // พลัง x 100,000 EUR
        
        switch (position) {
            case 'FW':
            case 'กองหน้า (FW)':
                baseValue *= 1.5;
                break;
            case 'MF':
            case 'กองกลาง (MF)':
                baseValue *= 1.2;
                break;
            case 'DF':
            case 'กองหลัง (DF)':
                baseValue *= 0.9;
                break;
            case 'GK':
            case 'ผู้รักษาประตู (GK)':
                baseValue *= 0.8;
                break;
        }
        return Math.round(baseValue);
    }

    // 2. Logic การเพิ่มนักเตะใหม่พร้อมตรวจสอบงบประมาณ (Validation & Mutation)
    addPlayer(name, position, rating) {
        const price = this.calculatePlayerValue(position, rating);

        // ตรวจสอบเงื่อนไขหลังบ้าน: งบพอไหม?
        if (this.budget - price < 0) {
            return {
                success: false,
                message: `งบไม่พอ! นักเตะราคา ${price.toLocaleString()} EUR แต่งบเหลือแค่ ${this.budget.toLocaleString()} EUR`
            };
        }

        // หักงบประมาณและบันทึกข้อมูล
        this.budget -= price;
        const newPlayer = {
            id: Date.now(),
            name: name,
            position: position,
            rating: parseInt(rating),
            price: price
        };

        this.players.push(newPlayer);
        this.saveToStorage();

        return {
            success: true,
            player: newPlayer,
            message: "เพิ่มนักเตะและคำนวณค่าตัวเรียบร้อย"
        };
    }

    // 3. Logic การลบนักเตะและคืนเงินเข้าคลัง (Refund)
    deletePlayer(id) {
        const playerIndex = this.players.findIndex(p => p.id === id);
        
        if (playerIndex === -1) {
            return { success: false, message: "ไม่พบนายทวารหรือนักเตะรายนี้" };
        }

        const player = this.players[playerIndex];
        this.budget += player.price; // คืนเงินค่าตัวเข้าคลังหลัก
        this.players.splice(playerIndex, 1); // ลบออกจากรายการ
        this.saveToStorage();

        return { success: true, message: "ลบนักเตะและคืนเงินสำเร็จ" };
    }

    // 4. บันทึกข้อมูลแบบถาวร (Data Persistence)
    saveToStorage() {
        localStorage.setItem('players', JSON.stringify(this.players));
        localStorage.setItem('teamBudget', this.budget.toString());
    }

    // 5. ดึงข้อมูลสถานะปัจจุบันของระบบ
    getClubState() {
        return {
            players: this.players,
            budget: this.budget
        };
    }
}

// ประกาศใช้งานคลาสระบบหลักของหลังบ้านเพื่อให้หน้าบ้านเรียกใช้ได้
const clubBackend = new FootballClubManager();