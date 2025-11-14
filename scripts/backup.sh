#!/bin/bash
# Caregiver Data Backup Script
# Run this regularly to sync Render data to local

# Configuration
RENDER_URL="https://caregiver-c54j.onrender.com"
BACKUP_DIR="./data-backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/caregiver-backup-$DATE.json"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Downloading backup from Render..."

# Download backup from Render
curl -s "$RENDER_URL/api/backup" \
  -H "Accept: application/json" \
  -o "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
  echo "✅ Backup successful: $BACKUP_FILE"
  
  # Parse and display backup info
  CAREGIVERS=$(grep -o '"totalCaregivers":[0-9]*' "$BACKUP_FILE" | cut -d: -f2)
  ENTRIES=$(grep -o '"totalTimeEntries":[0-9]*' "$BACKUP_FILE" | cut -d: -f2)
  
  echo "📊 Backup contains:"
  echo "   - Caregivers: $CAREGIVERS"
  echo "   - Time Entries: $ENTRIES"
  
  # Keep only last 10 backups
  ls -t "$BACKUP_DIR"/*.json 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
  
  echo "🗂️  Keeping last 10 backups in $BACKUP_DIR"
  
  # Optional: Commit to git for version control
  read -p "📝 Commit backup to git? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add "$BACKUP_FILE"
    git commit -m "📦 Backup: $DATE - $CAREGIVERS caregivers, $ENTRIES entries"
    echo "✅ Backup committed to git"
  fi
  
else
  echo "❌ Backup failed!"
  rm -f "$BACKUP_FILE" 2>/dev/null
  exit 1
fi

echo "🎯 Backup complete!"