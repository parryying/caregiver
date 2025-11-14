const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../caregiver.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Initializing database...');

db.serialize(() => {
    // Drop existing tables if they exist (for fresh start)
    db.run('DROP TABLE IF EXISTS time_entries');
    db.run('DROP TABLE IF EXISTS caregivers');

    // Create caregivers table
    db.run(`CREATE TABLE caregivers (
        id TEXT PRIMARY KEY,
        englishName TEXT NOT NULL,
        chineseName TEXT NOT NULL,
        monthlyHours INTEGER NOT NULL DEFAULT 160,
        hourlyRate REAL NOT NULL DEFAULT 25.00,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create time_entries table
    db.run(`CREATE TABLE time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caregiverId TEXT NOT NULL,
        clockIn DATETIME NOT NULL,
        clockOut DATETIME,
        totalHours REAL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caregiverId) REFERENCES caregivers(id)
    )`);

    // Insert sample caregiver data
    db.run(`INSERT INTO caregivers (id, englishName, chineseName, monthlyHours, hourlyRate) 
            VALUES ('maria', 'Maria Chen', '陈玛丽亚', 160, 25.00)`);

    console.log('✅ Database tables created successfully');
    console.log('✅ Sample caregiver added: Maria Chen | 陈玛丽亚');

    // Create some sample time entries
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const clockIn1 = new Date(yesterday);
    clockIn1.setHours(9, 0, 0, 0);
    const clockOut1 = new Date(yesterday);
    clockOut1.setHours(17, 0, 0, 0);
    const totalHours1 = 8;

    db.run(`INSERT INTO time_entries (caregiverId, clockIn, clockOut, totalHours, notes) 
            VALUES ('maria', ?, ?, ?, 'Regular shift')`,
            [clockIn1.toISOString(), clockOut1.toISOString(), totalHours1]);

    console.log('✅ Sample time entries added');
});

db.close((err) => {
    if (err) {
        console.error('❌ Error closing database:', err.message);
    } else {
        console.log('✅ Database initialization completed');
        console.log(`📁 Database location: ${dbPath}`);
    }
});