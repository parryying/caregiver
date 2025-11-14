# Simple Caregiver Backup Script
param(
    [string]$RenderUrl = "https://caregiver-c54j.onrender.com",
    [string]$BackupDir = ".\data-backups",
    [switch]$CommitToGit
)

$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDir "caregiver-backup-$Date.json"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Downloading backup from Render..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri "$RenderUrl/api/backup" -Method Get
    $Response | ConvertTo-Json -Depth 100 | Out-File -FilePath $BackupFile -Encoding UTF8
    
    Write-Host "Backup successful: $BackupFile" -ForegroundColor Green
    Write-Host "Caregivers: $($Response.totalCaregivers)" -ForegroundColor Yellow
    Write-Host "Time Entries: $($Response.totalTimeEntries)" -ForegroundColor Yellow
    
    if ($CommitToGit) {
        git add $BackupFile
        git commit -m "Backup: $Date"
        Write-Host "Committed to git" -ForegroundColor Green
    }
    
    $FileInfo = Get-ChildItem $BackupFile
    Write-Host "File: $($FileInfo.Name) ($([math]::Round($FileInfo.Length/1KB, 1)) KB)" -ForegroundColor Gray
}
catch {
    Write-Host "Backup failed: $_" -ForegroundColor Red
    if (Test-Path $BackupFile) {
        Remove-Item $BackupFile -Force
    }
    exit 1
}

Write-Host "Backup complete!" -ForegroundColor Green