# Caregiver Data Backup Script for Windows PowerShell
# Run this regularly to sync Render data to local

param(
    [string]$RenderUrl = "https://caregiver-c54j.onrender.com",
    [string]$BackupDir = ".\data-backups",
    [switch]$CommitToGit
)

# Configuration
$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDir "caregiver-backup-$Date.json"

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "🔄 Downloading backup from Render..." -ForegroundColor Cyan

try {
    # Download backup from Render
    $Response = Invoke-RestMethod -Uri "$RenderUrl/api/backup" -Method Get -Headers @{
        "Accept" = "application/json"
    }
    
    # Save to file
    $Response | ConvertTo-Json -Depth 100 | Out-File -FilePath $BackupFile -Encoding UTF8
    
    Write-Host "✅ Backup successful: $BackupFile" -ForegroundColor Green
    
    # Display backup info
    $Caregivers = $Response.totalCaregivers
    $Entries = $Response.totalTimeEntries
    
    Write-Host "📊 Backup contains:" -ForegroundColor Yellow
    Write-Host "   - Caregivers: $Caregivers" -ForegroundColor White
    Write-Host "   - Time Entries: $Entries" -ForegroundColor White
    
    # Keep only last 10 backups
    $OldBackups = Get-ChildItem -Path $BackupDir -Filter "*.json" | 
                  Sort-Object LastWriteTime -Descending | 
                  Select-Object -Skip 10
    
    if ($OldBackups) {
        $OldBackups | Remove-Item -Force
        Write-Host "🗂️  Cleaned up old backups, keeping last 10" -ForegroundColor Gray
    }
    
    # Optional: Commit to git
    if ($CommitToGit) {
        try {
            git add $BackupFile
            git commit -m "📦 Backup: $Date - $Caregivers caregivers, $Entries entries"
            Write-Host "✅ Backup committed to git" -ForegroundColor Green
        }
        catch {
            Write-Host "⚠️  Git commit failed: $_" -ForegroundColor Yellow
        }
    }
    else {
        $CommitChoice = Read-Host "📝 Commit backup to git? (y/n)"
        if ($CommitChoice -eq 'y' -or $CommitChoice -eq 'Y') {
            try {
                git add $BackupFile
                git commit -m "📦 Backup: $Date - $Caregivers caregivers, $Entries entries"
                Write-Host "✅ Backup committed to git" -ForegroundColor Green
            }
            catch {
                Write-Host "⚠️  Git commit failed: $_" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "🎯 Backup complete!" -ForegroundColor Green
    
    # Show file info
    $FileInfo = Get-ChildItem $BackupFile
    Write-Host "📁 File: $($FileInfo.Name) ($([math]::Round($FileInfo.Length/1KB, 1)) KB)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Backup failed: $_" -ForegroundColor Red
    if (Test-Path $BackupFile) {
        Remove-Item $BackupFile -Force
    }
    exit 1
}

# Usage examples
Write-Host ""
Write-Host "💡 Usage Examples:" -ForegroundColor Cyan
Write-Host "   .\scripts\backup.ps1                      # Basic backup" -ForegroundColor Gray
Write-Host "   .\scripts\backup.ps1 -CommitToGit         # Backup + git commit" -ForegroundColor Gray
Write-Host "   .\scripts\backup.ps1 -BackupDir C:\Backups # Custom location" -ForegroundColor Gray