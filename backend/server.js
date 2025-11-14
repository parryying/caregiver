const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../')));

// Database setup
const dbPath = path.join(__dirname, 'caregiver.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Caregivers table
    db.run(`CREATE TABLE IF NOT EXISTS caregivers (
        id TEXT PRIMARY KEY,
        englishName TEXT NOT NULL,
        chineseName TEXT NOT NULL,
        monthlyHours INTEGER NOT NULL DEFAULT 160,
        hourlyRate REAL NOT NULL DEFAULT 25.00,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Time entries table
    db.run(`CREATE TABLE IF NOT EXISTS time_entries (
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

    console.log('Database tables initialized');
});

// API Routes

// Get all caregivers
app.get('/api/caregivers', (req, res) => {
    db.all('SELECT * FROM caregivers WHERE isActive = 1 ORDER BY englishName', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ caregivers: rows });
    });
});

// Create new caregiver
app.post('/api/caregivers', (req, res) => {
    const { id, englishName, chineseName, monthlyHours, hourlyRate } = req.body;
    
    if (!englishName || !chineseName) {
        res.status(400).json({ error: 'English and Chinese names are required' });
        return;
    }

    const caregiverId = id || Date.now().toString();
    
    db.run(
        'INSERT INTO caregivers (id, englishName, chineseName, monthlyHours, hourlyRate) VALUES (?, ?, ?, ?, ?)',
        [caregiverId, englishName, chineseName, monthlyHours || 160, hourlyRate || 25.00],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                message: 'Caregiver created successfully',
                caregiverId: caregiverId 
            });
        }
    );
});

// Update caregiver
app.put('/api/caregivers/:id', (req, res) => {
    const { englishName, chineseName, monthlyHours, hourlyRate } = req.body;
    const caregiverId = req.params.id;

    db.run(
        'UPDATE caregivers SET englishName = ?, chineseName = ?, monthlyHours = ?, hourlyRate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [englishName, chineseName, monthlyHours, hourlyRate, caregiverId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Caregiver not found' });
                return;
            }
            res.json({ message: 'Caregiver updated successfully' });
        }
    );
});

// Delete caregiver (soft delete)
app.delete('/api/caregivers/:id', (req, res) => {
    const caregiverId = req.params.id;

    db.run(
        'UPDATE caregivers SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [caregiverId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Caregiver deleted successfully' });
        }
    );
});

// Get time entries for a caregiver
app.get('/api/caregivers/:id/time-entries', (req, res) => {
    const caregiverId = req.params.id;
    const { month } = req.query; // Optional month filter (YYYY-MM)

    let query = 'SELECT * FROM time_entries WHERE caregiverId = ?';
    let params = [caregiverId];

    if (month) {
        query += ' AND DATE(clockIn) LIKE ?';
        params.push(`${month}%`);
    }

    query += ' ORDER BY clockIn DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ timeEntries: rows });
    });
});

// Get all time entries
app.get('/api/time-entries', (req, res) => {
    const { month } = req.query;
    
    let query = `
        SELECT te.*, c.englishName, c.chineseName 
        FROM time_entries te 
        JOIN caregivers c ON te.caregiverId = c.id 
        WHERE c.isActive = 1
    `;
    let params = [];

    if (month) {
        query += ' AND DATE(te.clockIn) LIKE ?';
        params.push(`${month}%`);
    }

    query += ' ORDER BY te.clockIn DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ timeEntries: rows });
    });
});

// Create time entry (clock in)
app.post('/api/time-entries', (req, res) => {
    const { caregiverId, clockIn, clockOut, notes } = req.body;
    
    if (!caregiverId || !clockIn) {
        res.status(400).json({ error: 'caregiverId and clockIn are required' });
        return;
    }

    // Calculate total hours if clockOut is provided
    let totalHours = null;
    if (clockOut) {
        const clockInTime = new Date(clockIn);
        const clockOutTime = new Date(clockOut);
        totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    }

    db.run(
        'INSERT INTO time_entries (caregiverId, clockIn, clockOut, totalHours, notes) VALUES (?, ?, ?, ?, ?)',
        [caregiverId, clockIn, clockOut, totalHours, notes || ''],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                message: 'Time entry created successfully',
                entryId: this.lastID 
            });
        }
    );
});

// Update time entry (clock out or edit)
app.put('/api/time-entries/:id', (req, res) => {
    const { clockIn, clockOut, notes } = req.body;
    const entryId = req.params.id;

    // Calculate total hours
    let totalHours = null;
    if (clockIn && clockOut) {
        const clockInTime = new Date(clockIn);
        const clockOutTime = new Date(clockOut);
        totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    }

    db.run(
        'UPDATE time_entries SET clockIn = ?, clockOut = ?, totalHours = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [clockIn, clockOut, totalHours, notes || '', entryId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Time entry not found' });
                return;
            }
            res.json({ message: 'Time entry updated successfully' });
        }
    );
});

// Clock out (update existing entry)
app.patch('/api/time-entries/:id/clock-out', (req, res) => {
    const { clockOut } = req.body;
    const entryId = req.params.id;

    if (!clockOut) {
        res.status(400).json({ error: 'clockOut time is required' });
        return;
    }

    // First, get the clock in time to calculate total hours
    db.get('SELECT clockIn FROM time_entries WHERE id = ?', [entryId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Time entry not found' });
            return;
        }

        const clockInTime = new Date(row.clockIn);
        const clockOutTime = new Date(clockOut);
        const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);

        db.run(
            'UPDATE time_entries SET clockOut = ?, totalHours = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [clockOut, totalHours, entryId],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ 
                    message: 'Clocked out successfully',
                    totalHours: totalHours 
                });
            }
        );
    });
});

// Delete time entry
app.delete('/api/time-entries/:id', (req, res) => {
    const entryId = req.params.id;

    db.run('DELETE FROM time_entries WHERE id = ?', [entryId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Time entry deleted successfully' });
    });
});

// Get current active time entry for a caregiver
app.get('/api/caregivers/:id/current-entry', (req, res) => {
    const caregiverId = req.params.id;

    db.get(
        'SELECT * FROM time_entries WHERE caregiverId = ? AND clockOut IS NULL ORDER BY clockIn DESC LIMIT 1',
        [caregiverId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ currentEntry: row || null });
        }
    );
});

// Monthly summary for all caregivers
app.get('/api/summary/:month', (req, res) => {
    const month = req.params.month; // Format: YYYY-MM

    const query = `
        SELECT 
            c.id,
            c.englishName,
            c.chineseName,
            c.monthlyHours,
            c.hourlyRate,
            COALESCE(SUM(te.totalHours), 0) as workedHours,
            COALESCE(SUM(te.totalHours * c.hourlyRate), 0) as totalPay
        FROM caregivers c
        LEFT JOIN time_entries te ON c.id = te.caregiverId 
            AND DATE(te.clockIn) LIKE ?
            AND te.totalHours IS NOT NULL
        WHERE c.isActive = 1
        GROUP BY c.id, c.englishName, c.chineseName, c.monthlyHours, c.hourlyRate
        ORDER BY c.englishName
    `;

    db.all(query, [`${month}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const summary = rows.map(row => ({
            ...row,
            remainingHours: Math.max(0, row.monthlyHours - row.workedHours)
        }));

        res.json({ summary });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Caregiver Backend Server running on port ${PORT}`);
    console.log(`📊 Database: ${dbPath}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});