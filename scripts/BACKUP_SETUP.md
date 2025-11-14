# Instructions for Setting Up Automated Backups

## 🕒 Windows Task Scheduler Setup

### Step 1: Open Task Scheduler
- Press `Win + R`, type `taskschd.msc`, press Enter
- Or search "Task Scheduler" in Start menu

### Step 2: Create Basic Task
1. **Right-click** "Task Scheduler Library"
2. **Select** "Create Basic Task..."
3. **Name**: "Caregiver Data Backup"
4. **Description**: "Daily backup of caregiver time tracking data"

### Step 3: Set Trigger
1. **When**: Daily
2. **Start Date**: Today
3. **Time**: Pick a convenient time (e.g., 11:00 PM)
4. **Recur every**: 1 day

### Step 4: Set Action
1. **Action**: Start a program
2. **Program/script**: `powershell.exe`
3. **Arguments**: `-ExecutionPolicy Bypass -File "C:\Parry\Vibecoding\Caregiver new\caregiver\scripts\backup.ps1" -CommitToGit`
4. **Start in**: `C:\Parry\Vibecoding\Caregiver new\caregiver`

### Step 5: Finish
- **Review settings** and click Finish
- **Test** by right-clicking the task and selecting "Run"

## 🖥️ Manual Backup (Anytime)

### PowerShell Method:
```powershell
# Navigate to your project
cd "C:\Parry\Vibecoding\Caregiver new\caregiver"

# Run backup script
.\scripts\backup.ps1

# Or backup with auto-commit
.\scripts\backup.ps1 -CommitToGit
```

### Browser Method:
1. Go to: https://caregiver-c54j.onrender.com/api/backup
2. File will download automatically
3. Save in your project folder

## 📂 Backup File Locations

### Automated Backups:
- **Location**: `.\data-backups\`
- **Format**: `caregiver-backup-YYYY-MM-DD_HH-MM-SS.json`
- **Retention**: Last 10 backups kept automatically

### Manual Browser Downloads:
- **Location**: Your Downloads folder
- **Filename**: `caregiver-backup-YYYY-MM-DD.json`

## 🔄 Restore Process

### If You Need to Restore Data:
1. **Go to your app**: https://caregiver-c54j.onrender.com/
2. **Click**: "📤 Restore Data" button
3. **Select**: Your backup JSON file
4. **Confirm**: Restoration (⚠️ replaces all current data)

### Or Via API:
```powershell
# Upload backup file
$BackupContent = Get-Content "backup-file.json" -Raw
Invoke-RestMethod -Uri "https://caregiver-c54j.onrender.com/api/restore" -Method Post -Body $BackupContent -ContentType "application/json"
```

## ⚠️ Important Notes

### Data Flow Direction:
- **Render → Local**: Manual backups only
- **Local → Render**: Code changes auto-deploy
- **No automatic sync**: Database changes don't auto-sync

### Best Practices:
1. **Backup weekly** at minimum
2. **Test restore** process occasionally  
3. **Keep backups** in multiple locations
4. **Monitor backup success** logs

### Troubleshooting:
- **Script fails**: Check internet connection
- **App unreachable**: Verify Render URL
- **Permission denied**: Run PowerShell as Administrator
- **Git errors**: Ensure you're in git repository folder