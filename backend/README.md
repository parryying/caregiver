# Caregiver Time Tracking Backend Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install Node.js
1. **Download Node.js**: Go to https://nodejs.org
2. **Choose LTS version** (recommended for most users)
3. **Run installer** and follow the setup wizard
4. **Verify installation**: Open PowerShell and run:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Backend Dependencies
```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install

# Initialize the database
npm run init-db
```

### Step 3: Start the Backend Server
```bash
# Start in development mode
npm run dev

# OR start in production mode
npm start
```

### Step 4: Access Your App
- **Frontend with Backend**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/health
- **Database**: SQLite file at `backend/caregiver.db`

## 📋 What the Backend Provides

### ✅ **Universal Data Storage**
- SQLite database (single file, no server needed)
- Data persists across all browsers and devices
- Automatic backups possible

### ✅ **REST API Endpoints**
- `GET /api/caregivers` - Get all caregivers
- `POST /api/caregivers` - Add new caregiver
- `PUT /api/caregivers/:id` - Update caregiver
- `DELETE /api/caregivers/:id` - Delete caregiver
- `GET /api/time-entries` - Get all time entries
- `POST /api/time-entries` - Clock in/add manual entry
- `PUT /api/time-entries/:id` - Update time entry
- `PATCH /api/time-entries/:id/clock-out` - Clock out
- `GET /api/summary/:month` - Monthly summary report

### ✅ **Features**
- Real-time data sync across all devices
- Automatic time calculations
- Monthly reporting
- Data export capabilities
- CORS enabled for frontend access

## 🔧 Backend Architecture

```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── caregiver.db       # SQLite database (created automatically)
└── scripts/
    └── initDatabase.js # Database initialization
```

## 🌐 Database Schema

### Caregivers Table
- `id` (TEXT, PRIMARY KEY)
- `englishName` (TEXT)
- `chineseName` (TEXT) 
- `monthlyHours` (INTEGER)
- `hourlyRate` (REAL)
- `isActive` (BOOLEAN)
- `createdAt`, `updatedAt` (DATETIME)

### Time Entries Table
- `id` (INTEGER, AUTO INCREMENT)
- `caregiverId` (TEXT, FOREIGN KEY)
- `clockIn` (DATETIME)
- `clockOut` (DATETIME)
- `totalHours` (REAL)
- `notes` (TEXT)
- `createdAt`, `updatedAt` (DATETIME)

## 🚀 Deployment Options

### Option 1: Local Server (Recommended for home use)
- Run on your home computer
- Access from any device on your WiFi network
- No hosting costs

### Option 2: Cloud Hosting
- **Free options**: Render, Railway, Fly.io
- **Paid options**: DigitalOcean, AWS, Google Cloud
- Access from anywhere in the world

### Option 3: VPS/Dedicated Server
- Full control and customization
- Can run 24/7
- Suitable for multiple families

## 🔒 Security Features
- CORS protection
- Input validation
- SQL injection prevention
- Error handling
- Graceful shutdown

## 🔄 Data Backup & Persistence Solutions

### ✅ **New Backup Features Added**

#### **Automatic Backups**
- 🕒 **Every 6 hours** - Automatic JSON backups created
- 🚀 **On startup** - Initial backup when server starts
- 📁 **Stored in**: `backend/backups/` folder
- 📝 **Format**: `auto-backup-YYYY-MM-DD.json`

#### **Manual Backup/Restore API**
- 📥 **Download Backup**: `GET /api/backup`
- 📤 **Restore Data**: `POST /api/restore` 
- 🌐 **Frontend Integration**: Download/Restore buttons in UI
- ⚠️ **Safety**: Restore requires confirmation (replaces ALL data)

#### **Smart Database Support**
- 🗃️ **SQLite**: Default for local development (single file)
- 🐘 **PostgreSQL**: Production ready (set `DATABASE_URL`)
- 🔄 **Auto-detection**: Uses PostgreSQL if `DATABASE_URL` exists
- 📊 **Same API**: No code changes needed when switching databases

### 🌟 **Frontend Enhancements**
- 🔔 **Backup Reminders**: Weekly notifications to download backups
- 💾 **One-click Download**: Instant backup download button
- 📤 **Drag & Drop Restore**: Upload backup files to restore
- 🔍 **Backup Preview**: See backup contents before restoring
- ⚡ **Connection Monitoring**: Shows network status and errors

---

## 🚀 **Deployment Options for Data Persistence**

### **Option 1: Free with Manual Backups (Current Setup)**
```bash
# What you have now:
✅ SQLite database (resets on Render restart)
✅ Automatic 6-hour backups  
✅ Manual download/restore via UI
✅ Backup reminders

# Perfect for: Small family use, occasional logging
```

### **Option 2: PostgreSQL on Render (Recommended)**
```bash
# Steps to set up permanent storage:
1. Go to Render dashboard
2. Add PostgreSQL database (free tier available)
3. Copy DATABASE_URL from PostgreSQL settings  
4. Add DATABASE_URL as environment variable in your web service
5. Redeploy - data will persist permanently!

# Cost: Free tier available, $7/month for starter
```

### **Option 3: External Database**
```bash
# Use any PostgreSQL provider:
- Supabase (free tier)
- ElephantSQL (free tier)  
- AWS RDS
- Google Cloud SQL

# Just set DATABASE_URL environment variable
```

## 📋 **How to Set Up Permanent Storage**

### **Quick Setup with Render PostgreSQL:**

1. **Add Database**:
   - In Render dashboard, click "New +"
   - Select "PostgreSQL" 
   - Choose Free plan
   - Create database

2. **Get Connection String**:
   - Copy the "External Database URL"
   - Looks like: `postgresql://username:password@host:port/database`

3. **Configure Your App**:
   - In your web service settings
   - Go to "Environment" 
   - Add: `DATABASE_URL = [paste the URL here]`
   - Click "Save Changes"

4. **Deploy**:
   - Your app will automatically redeploy
   - Database will switch to PostgreSQL
   - Data persists forever! ✅

### **Manual Backup Strategy (Current Setup)**:
- Download backups weekly using the UI button
- Store backup files safely (Google Drive, etc.)
- Restore when needed after server resets

---

## 🔧 **Advanced Features**

### **Multi-Database Support**
The app automatically detects and uses the appropriate database:
```bash
# Local development
DATABASE_URL=  # (empty) → Uses SQLite

# Production with PostgreSQL  
DATABASE_URL=postgresql://... → Uses PostgreSQL
```

### **Backup File Format**
```json
{
  "version": "1.0",
  "timestamp": "2025-11-13T...",
  "caregivers": [...],
  "timeEntries": [...],
  "totalCaregivers": 5,
  "totalTimeEntries": 247
}
```

### **API Endpoints**
```javascript
// Download backup (opens download dialog)
GET /api/backup

// Restore from backup
POST /api/restore
{
  "caregivers": [...],
  "timeEntries": [...]
}
```

---

## 💡 **Recommendations**

### **For Small Family Use:**
- ✅ Keep current setup (SQLite + manual backups)
- ✅ Download backup weekly via UI
- ✅ Store backups in Google Drive/Dropbox

### **For Regular Use:**
- 🔥 **Upgrade to PostgreSQL** (5 minutes setup)
- ✅ Never lose data again
- ✅ Access from anywhere anytime
- ✅ Perfect family caregiver tracking

### **For Multiple Families:**
- 🔥 **PostgreSQL + paid Render plan**
- ✅ Custom domain
- ✅ Enhanced performance  
- ✅ Professional setup

---

**Need Help?** The backup system is ready to use - just click "Download Backup" in the app!
