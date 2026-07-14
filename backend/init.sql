CREATE DATABASE IF NOT EXISTS football_db;
USE football_db;

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ใส่ข้อมูลตั้งต้น 2 คน
INSERT INTO players (name, position, rating, price) VALUES 
('Lionel Messi', 'FW', 93, 15000000),
('Cristiano Ronaldo', 'FW', 91, 12000000);