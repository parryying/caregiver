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

## 📊 Next Steps
1. Install Node.js and run the backend
2. Update the frontend to use the API
3. Test on multiple devices
4. Deploy to cloud (optional)

---

**Need Help?** The backend is ready to run once Node.js is installed!