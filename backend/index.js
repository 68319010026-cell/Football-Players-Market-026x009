const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔌 เชื่อมต่อ Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // ปรับตาม User ของเครื่องพี่
    password: '',      // ปรับตาม Password เครื่องพี่
    database: 'football_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ ดึง Database ไม่สำเร็จ:', err.message);
        return;
    }
    console.log('🔌 เชื่อมต่อ MySQL Database สำเร็จแล้ว!');
});

// 1. GET: ดึงข้อมูลนักเตะทั้งหมดจาก SQL
app.get('/api/players', (req, res) => {
    const sql = 'SELECT * FROM players ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. POST: เพิ่มนักเตะใหม่ลงตาราง SQL (พร้อมคำนวณราคา)
app.post('/api/players', (req, res) => {
    const { name, position, rating } = req.body;
    
    // ลอจิกการคำนวณราคาหลังบ้านของคุณ
    let price = rating * 100000;
    if (position === 'FW') price *= 1.5;
    price = Math.round(price);

    const sql = 'INSERT INTO players (name, position, rating, price) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, position, rating, price], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name, position, rating, price });
    });
});

// 3. DELETE: ลบนักเตะออกจาก SQL ตาม ID
app.delete('/api/players/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM players WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'ลบนักเตะออกจากระบบแล้ว' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server รันแล้วบน http://localhost:${PORT}`);
});