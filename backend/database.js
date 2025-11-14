const path = require('path');
require('dotenv').config();

// Database configuration module
// Supports both SQLite (for local/simple deployment) and PostgreSQL (for production)

function createDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (DATABASE_URL) {
        // Use PostgreSQL for production (Render, Heroku, etc.)
        console.log('🐘 Connecting to PostgreSQL database...');
        return createPostgreSQLConnection(DATABASE_URL);
    } else {
        // Use SQLite for local development and simple deployment
        console.log('📁 Using SQLite database...');
        return createSQLiteConnection();
    }
}

function createPostgreSQLConnection(databaseUrl) {
    const { Pool } = require('pg');
    
    const pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Create a wrapper to match SQLite interface
    const db = {
        // Query methods
        all: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(query, params)
                .then(result => callback(null, result.rows))
                .catch(err => callback(err));
        },
        
        get: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(query, params)
                .then(result => callback(null, result.rows[0]))
                .catch(err => callback(err));
        },
        
        run: (query, params, callback) => {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            pool.query(query, params)
                .then(result => {
                    const mockThis = { 
                        changes: result.rowCount,
                        lastID: result.insertId || null 
                    };
                    if (callback) callback.call(mockThis, null);
                })
                .catch(err => {
                    if (callback) callback(err);
                });
        },
        
        serialize: (callback) => {
            if (callback) callback();
        },
        
        prepare: (query) => {
            return {
                run: (params, callback) => {
                    if (typeof params === 'function') {
                        callback = params;
                        params = [];
                    }
                    pool.query(query, params)
                        .then(result => {
                            if (callback) callback(null);
                        })
                        .catch(err => {
                            if (callback) callback(err);
                        });
                },
                finalize: () => { /* No-op for PostgreSQL */ }
            };
        },
        
        close: (callback) => {
            pool.end(callback);
        }
    };

    // Initialize PostgreSQL tables
    initializePostgreSQLTables(pool);
    
    return db;
}

function createSQLiteConnection() {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'caregiver.db');
    const db = new sqlite3.Database(dbPath);
    
    // Initialize SQLite tables
    initializeSQLiteTables(db);
    
    return db;
}

function initializePostgreSQLTables(pool) {
    const createTables = `
        CREATE TABLE IF NOT EXISTS caregivers (
            id TEXT PRIMARY KEY,
            englishName TEXT NOT NULL,
            chineseName TEXT NOT NULL,
            monthlyHours INTEGER NOT NULL DEFAULT 160,
            hourlyRate DECIMAL(10,2) NOT NULL DEFAULT 25.00,
            isActive BOOLEAN DEFAULT TRUE,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS time_entries (
            id SERIAL PRIMARY KEY,
            caregiverId TEXT NOT NULL,
            clockIn TIMESTAMP NOT NULL,
            clockOut TIMESTAMP,
            totalHours DECIMAL(10,2),
            notes TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (caregiverId) REFERENCES caregivers(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_time_entries_caregiver ON time_entries(caregiverId);
        CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(clockIn);
    `;

    pool.query(createTables)
        .then(() => console.log('✅ PostgreSQL tables initialized'))
        .catch(err => console.error('❌ PostgreSQL table initialization error:', err));
}

function initializeSQLiteTables(db) {
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
            FOREIGN KEY (caregiverId) REFERENCES caregivers(id) ON DELETE CASCADE
        )`);

        console.log('✅ SQLite tables initialized');
    });
}

module.exports = { createDatabase };