// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

// Global state
let caregivers = [];
let timeEntries = [];
let isOnline = false;

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showError(`API Error: ${error.message}`);
        throw error;
    }
}

// Connection Status
async function checkConnection() {
    try {
        await apiCall('/health');
        isOnline = true;
        updateConnectionStatus(true);
    } catch (error) {
        isOnline = false;
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(online) {
    const statusElement = document.getElementById('connectionStatus');
    if (online) {
        statusElement.textContent = 'Online | 在线';
        statusElement.className = 'connection-status status-online';
    } else {
        statusElement.textContent = 'Offline | 离线';
        statusElement.className = 'connection-status status-offline';
    }
}

// Error handling
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
    setTimeout(() => {
        errorDiv.innerHTML = '';
    }, 5000);
}

// Current time display
function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentTime').textContent = now.toLocaleDateString('en-US', options);
}

// Caregiver Management Functions
async function loadCaregivers() {
    try {
        const response = await apiCall('/caregivers');
        caregivers = response.caregivers;
        renderCaregiverCards();
        return caregivers;
    } catch (error) {
        console.error('Failed to load caregivers:', error);
        return [];
    }
}

async function openCaregiverManager() {
    document.getElementById('caregiverModal').style.display = 'block';
    await loadCaregiversList();
    clearCaregiverForm();
}

function closeCaregiverModal() {
    document.getElementById('caregiverModal').style.display = 'none';
}

async function loadCaregiversList() {
    const list = document.getElementById('caregiversList');
    
    if (caregivers.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #666;">No caregivers added yet | 暂无护工</p>';
        return;
    }

    let html = '';
    for (const caregiver of caregivers) {
        const worked = await calculateWorkedHours(caregiver.id);
        const remaining = Math.max(0, caregiver.monthlyHours - worked);
        
        html += `
            <div class="caregiver-item">
                <div class="caregiver-info">
                    <strong>${caregiver.englishName} | ${caregiver.chineseName}</strong><br>
                    <small>Monthly Hours | 月小时: ${caregiver.monthlyHours}h | Rate | 时薪: $${caregiver.hourlyRate}</small><br>
                    <small>Worked | 已工作: ${worked.toFixed(1)}h | Remaining | 剩余: ${remaining.toFixed(1)}h</small>
                </div>
                <div class="caregiver-actions">
                    <button class="btn btn-small" style="background: #ffc107;" onclick="editCaregiver('${caregiver.id}')">
                        Edit | 编辑
                    </button>
                    <button class="btn btn-small" style="background: #dc3545; color: white;" onclick="deleteCaregiver('${caregiver.id}')">
                        Delete | 删除
                    </button>
                </div>
            </div>
        `;
    }
    
    list.innerHTML = html;
}

async function saveCaregiver(event) {
    event.preventDefault();
    
    const englishName = document.getElementById('englishName').value;
    const chineseName = document.getElementById('chineseName').value;
    const monthlyHours = parseInt(document.getElementById('monthlyHours').value);
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
    const editingId = document.getElementById('editingCaregiverId').value;
    
    try {
        if (editingId) {
            // Update existing caregiver
            await apiCall(`/caregivers/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ englishName, chineseName, monthlyHours, hourlyRate })
            });
        } else {
            // Create new caregiver
            await apiCall('/caregivers', {
                method: 'POST',
                body: JSON.stringify({ 
                    id: Date.now().toString(),
                    englishName, 
                    chineseName, 
                    monthlyHours, 
                    hourlyRate 
                })
            });
        }
        
        await loadCaregivers();
        await loadCaregiversList();
        clearCaregiverForm();
        
        alert(`Caregiver saved successfully! | 护工保存成功！`);
    } catch (error) {
        alert(`Error saving caregiver: ${error.message}`);
    }
}

function editCaregiver(caregiverId) {
    const caregiver = caregivers.find(c => c.id === caregiverId);
    if (caregiver) {
        document.getElementById('englishName').value = caregiver.englishName;
        document.getElementById('chineseName').value = caregiver.chineseName;
        document.getElementById('monthlyHours').value = caregiver.monthlyHours;
        document.getElementById('hourlyRate').value = caregiver.hourlyRate;
        document.getElementById('editingCaregiverId').value = caregiverId;
    }
}

async function deleteCaregiver(caregiverId) {
    if (confirm('Are you sure you want to delete this caregiver? This will also delete all their time entries.\n确定要删除此护工吗？这将同时删除其所有时间记录。')) {
        try {
            await apiCall(`/caregivers/${caregiverId}`, { method: 'DELETE' });
            await loadCaregivers();
            await loadCaregiversList();
            alert('Caregiver deleted successfully | 护工删除成功');
        } catch (error) {
            alert(`Error deleting caregiver: ${error.message}`);
        }
    }
}

function clearCaregiverForm() {
    document.getElementById('caregiverForm').reset();
    document.getElementById('editingCaregiverId').value = '';
    document.getElementById('monthlyHours').value = 160;
    document.getElementById('hourlyRate').value = 25.00;
}

// Time Tracking Functions
async function renderCaregiverCards() {
    const container = document.getElementById('caregiversContainer');
    
    if (caregivers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>No caregivers added yet | 暂无护工</h3>
                <p>Click "Manage Caregivers" to add your first caregiver<br>点击"管理护工"添加第一个护工</p>
            </div>
        `;
        return;
    }

    let html = '';
    for (const caregiver of caregivers) {
        const currentEntry = await getCurrentTimeEntry(caregiver.id);
        const isClocked = currentEntry !== null;
        const worked = await calculateWorkedHours(caregiver.id);
        const remaining = Math.max(0, caregiver.monthlyHours - worked);
        
        html += `
            <div class="caregiver-card">
                <div class="caregiver-name">
                    ${caregiver.englishName} | ${caregiver.chineseName}
                </div>
                
                <div class="status-badge ${isClocked ? 'status-in' : 'status-out'}" id="status-${caregiver.id}">
                    ${isClocked ? 'Clocked In | 已上班' : 'Clocked Out | 已下班'}
                </div>

                <div class="action-buttons">
                    <button class="btn btn-clock-in" onclick="clockIn('${caregiver.id}')" ${isClocked ? 'disabled' : ''}>
                        Clock In<br>上班打卡
                    </button>
                    <button class="btn btn-clock-out" onclick="clockOut('${caregiver.id}')" ${!isClocked ? 'disabled' : ''}>
                        Clock Out<br>下班打卡
                    </button>
                    <button class="btn btn-edit" onclick="showTimeEntries('${caregiver.id}')">
                        Edit Time | 编辑时间
                    </button>
                </div>

                <div class="hours-info">
                    <div class="hours-card">
                        <div class="hours-number" id="worked-${caregiver.id}">${worked.toFixed(1)}</div>
                        <div class="hours-label">Hours Worked<br>已工作小时</div>
                    </div>
                    <div class="hours-card">
                        <div class="hours-number" id="remaining-${caregiver.id}">${remaining.toFixed(1)}</div>
                        <div class="hours-label">Hours Remaining<br>剩余小时</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function clockIn(caregiverId) {
    // Check if already clocked in
    const currentEntry = await getCurrentTimeEntry(caregiverId);
    if (currentEntry) {
        alert('Already clocked in | 已经上班打卡');
        return;
    }

    try {
        const now = new Date().toISOString();
        await apiCall('/time-entries', {
            method: 'POST',
            body: JSON.stringify({
                caregiverId: caregiverId,
                clockIn: now
            })
        });
        
        await renderCaregiverCards();
        alert(`Clocked in at ${new Date().toLocaleTimeString()}\n上班打卡时间: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        alert(`Error clocking in: ${error.message}`);
    }
}

async function clockOut(caregiverId) {
    try {
        const currentEntry = await getCurrentTimeEntry(caregiverId);
        if (!currentEntry) {
            alert('Not currently clocked in | 未上班打卡');
            return;
        }

        const now = new Date().toISOString();
        await apiCall(`/time-entries/${currentEntry.id}/clock-out`, {
            method: 'PATCH',
            body: JSON.stringify({ clockOut: now })
        });
        
        await renderCaregiverCards();
        alert(`Clocked out at ${new Date().toLocaleTimeString()}\n下班打卡时间: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        alert(`Error clocking out: ${error.message}`);
    }
}

async function getCurrentTimeEntry(caregiverId) {
    try {
        const response = await apiCall(`/caregivers/${caregiverId}/current-entry`);
        return response.currentEntry;
    } catch (error) {
        console.error('Failed to get current entry:', error);
        return null;
    }
}

async function calculateWorkedHours(caregiverId) {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const response = await apiCall(`/caregivers/${caregiverId}/time-entries?month=${currentMonth}`);
        return response.timeEntries
            .filter(entry => entry.totalHours)
            .reduce((total, entry) => total + entry.totalHours, 0);
    } catch (error) {
        console.error('Failed to calculate worked hours:', error);
        return 0;
    }
}

// Time Entry Management
async function showTimeEntries(caregiverId) {
    try {
        const caregiver = caregivers.find(c => c.id === caregiverId);
        const response = await apiCall(`/caregivers/${caregiverId}/time-entries`);
        const entries = response.timeEntries;
        
        if (entries.length === 0) {
            if (confirm('No time entries found for this caregiver. Would you like to add a manual entry?\n此护工暂无时间记录。是否要添加手动记录？')) {
                addManualTimeEntry(caregiverId);
            }
            return;
        }
        
        let message = `Time Entries for ${caregiver.englishName} | ${caregiver.chineseName}:\n`;
        message += `时间记录:\n\n`;
        
        entries.slice(0, 5).forEach((entry, index) => {
            const clockIn = new Date(entry.clockIn);
            const clockOut = entry.clockOut ? new Date(entry.clockOut) : null;
            const duration = entry.totalHours ? entry.totalHours.toFixed(2) : 'In progress';
            
            message += `${index + 1}. ${clockIn.toLocaleDateString()} ${clockIn.toLocaleTimeString()}`;
            if (clockOut) {
                message += ` → ${clockOut.toLocaleTimeString()} (${duration}h)`;
            } else {
                message += ` → In progress | 进行中`;
            }
            message += `\n`;
        });
        
        const action = prompt(message + '\nOptions | 选项:\n1. Add manual entry | 添加手动记录\n2. Edit last entry | 编辑最后记录\n3. Cancel | 取消\n\nEnter 1, 2, or 3:');
        
        if (action === '1') {
            addManualTimeEntry(caregiverId);
        } else if (action === '2' && entries.length > 0) {
            editTimeEntry(entries[0]); // Most recent entry
        }
    } catch (error) {
        alert(`Error loading time entries: ${error.message}`);
    }
}

function addManualTimeEntry(caregiverId) {
    document.getElementById('timeEditModal').style.display = 'block';
    document.getElementById('editingTimeEntryId').value = '';
    
    // Set default times (today 9 AM to 5 PM)
    const today = new Date();
    const clockIn = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0);
    const clockOut = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0);
    
    document.getElementById('editClockIn').value = formatDateTimeLocal(clockIn);
    document.getElementById('editClockOut').value = formatDateTimeLocal(clockOut);
    document.getElementById('editNotes').value = '';
    
    window.currentEditingCaregiver = caregiverId;
}

function editTimeEntry(entry) {
    document.getElementById('timeEditModal').style.display = 'block';
    document.getElementById('editingTimeEntryId').value = entry.id;
    
    document.getElementById('editClockIn').value = formatDateTimeLocal(new Date(entry.clockIn));
    document.getElementById('editClockOut').value = entry.clockOut ? formatDateTimeLocal(new Date(entry.clockOut)) : '';
    document.getElementById('editNotes').value = entry.notes || '';
    
    window.currentEditingCaregiver = entry.caregiverId;
}

async function saveTimeEdit(event) {
    event.preventDefault();
    
    const entryId = document.getElementById('editingTimeEntryId').value;
    const clockIn = new Date(document.getElementById('editClockIn').value).toISOString();
    const clockOutValue = document.getElementById('editClockOut').value;
    const clockOut = clockOutValue ? new Date(clockOutValue).toISOString() : null;
    const notes = document.getElementById('editNotes').value;
    
    if (clockOut && new Date(clockOut) <= new Date(clockIn)) {
        alert('Clock out time must be after clock in time | 下班时间必须晚于上班时间');
        return;
    }
    
    try {
        if (entryId) {
            // Edit existing entry
            await apiCall(`/time-entries/${entryId}`, {
                method: 'PUT',
                body: JSON.stringify({ clockIn, clockOut, notes })
            });
        } else {
            // Add new entry
            await apiCall('/time-entries', {
                method: 'POST',
                body: JSON.stringify({
                    caregiverId: window.currentEditingCaregiver,
                    clockIn,
                    clockOut,
                    notes
                })
            });
        }
        
        closeTimeEditModal();
        await renderCaregiverCards();
        alert('Time entry saved successfully | 时间记录保存成功');
    } catch (error) {
        alert(`Error saving time entry: ${error.message}`);
    }
}

function closeTimeEditModal() {
    document.getElementById('timeEditModal').style.display = 'none';
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Report Generation
async function generateReport() {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthName = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        const response = await apiCall(`/summary/${currentMonth}`);
        const summary = response.summary;
        
        let reportHtml = `
            <html>
            <head>
                <title>Caregiver Report - ${monthName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
                    @media print { body { margin: 10px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Caregiver Time Report | 护工时间报告</h1>
                    <h2>${monthName}</h2>
                    <p>Generated on ${new Date().toLocaleDateString()} | 生成日期: ${new Date().toLocaleDateString()}</p>
                </div>
        `;
        
        for (const caregiver of summary) {
            const entriesResponse = await apiCall(`/caregivers/${caregiver.id}/time-entries?month=${currentMonth}`);
            const entries = entriesResponse.timeEntries;
            
            reportHtml += `
                <div class="summary">
                    <h3>${caregiver.englishName} | ${caregiver.chineseName}</h3>
                    <p>Monthly Allocation | 月分配: ${caregiver.monthlyHours} hours | 小时</p>
                    <p>Hours Worked | 已工作: ${caregiver.workedHours.toFixed(2)} hours | 小时</p>
                    <p>Hours Remaining | 剩余: ${caregiver.remainingHours.toFixed(2)} hours | 小时</p>
                    <p>Total Pay | 总工资: $${caregiver.totalPay.toFixed(2)} (@ $${caregiver.hourlyRate}/hour)</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date | 日期</th>
                            <th>Clock In | 上班</th>
                            <th>Clock Out | 下班</th>
                            <th>Hours | 小时</th>
                            <th>Notes | 备注</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            entries.forEach(entry => {
                const clockIn = new Date(entry.clockIn);
                const clockOut = entry.clockOut ? new Date(entry.clockOut) : null;
                
                reportHtml += `
                    <tr>
                        <td>${clockIn.toLocaleDateString()}</td>
                        <td>${clockIn.toLocaleTimeString()}</td>
                        <td>${clockOut ? clockOut.toLocaleTimeString() : 'In Progress'}</td>
                        <td>${entry.totalHours ? entry.totalHours.toFixed(2) : '-'}</td>
                        <td>${entry.notes || '-'}</td>
                    </tr>
                `;
            });
            
            reportHtml += '</tbody></table>';
        }
        
        reportHtml += '</body></html>';
        
        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            if (confirm('Print report now? | 现在打印报告吗？')) {
                printWindow.print();
            }
        }, 500);
    } catch (error) {
        alert(`Error generating report: ${error.message}`);
    }
}

// Data Management
async function toggleDataView() {
    const dataView = document.getElementById('timeLogsView');
    if (dataView.style.display === 'none') {
        dataView.style.display = 'block';
        await loadTimeLogsList();
    } else {
        dataView.style.display = 'none';
    }
}

async function loadTimeLogsList() {
    try {
        const response = await apiCall('/time-entries');
        timeEntries = response.timeEntries;
        
        const logsList = document.getElementById('timeLogsList');
        
        if (timeEntries.length === 0) {
            logsList.innerHTML = '<p style="text-align: center; color: #666;">No time entries yet | 暂无时间记录</p>';
            return;
        }

        let html = '';
        timeEntries.slice(0, 20).forEach((entry) => {
            const clockIn = new Date(entry.clockIn);
            const clockOut = entry.clockOut ? new Date(entry.clockOut) : null;
            const duration = entry.totalHours ? entry.totalHours.toFixed(1) : 'In progress';
            
            html += `
                <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2196F3;">
                    <strong>${entry.englishName} | ${entry.chineseName}</strong><br>
                    <small>Clock In | 上班: ${clockIn.toLocaleString()}</small><br>
                    ${clockOut ? `<small>Clock Out | 下班: ${clockOut.toLocaleString()}</small><br>` : '<small style="color: #28a745;">Currently clocked in | 正在上班</small><br>'}
                    <small>Duration | 时长: ${duration} hours | 小时</small><br>
                    ${entry.notes ? `<small>Notes | 备注: ${entry.notes}</small><br>` : ''}
                    <button class="btn btn-small" style="background: #ffc107; margin-top: 5px;" onclick="editTimeEntry(${JSON.stringify(entry).replace(/"/g, '&quot;')})">
                        Edit | 编辑
                    </button>
                </div>
            `;
        });
        
        logsList.innerHTML = html;
    } catch (error) {
        document.getElementById('timeLogsList').innerHTML = `<p style="color: #dc3545;">Error loading time logs: ${error.message}</p>`;
    }
}

async function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.\n确定要清除所有数据吗？此操作无法撤销。')) {
        try {
            // This would require a special API endpoint to clear all data
            alert('Clear all data feature requires backend implementation | 清除所有数据功能需要后端实现');
        } catch (error) {
            alert(`Error clearing data: ${error.message}`);
        }
    }
}

async function exportData() {
    try {
        const [caregiversResponse, timeEntriesResponse] = await Promise.all([
            apiCall('/caregivers'),
            apiCall('/time-entries')
        ]);
        
        const data = {
            exportDate: new Date().toISOString(),
            caregivers: caregiversResponse.caregivers,
            timeEntries: timeEntriesResponse.timeEntries
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `caregiver-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('Data exported successfully | 数据导出成功');
    } catch (error) {
        alert(`Error exporting data: ${error.message}`);
    }
}

function addCaregiver() {
    openCaregiverManager();
}

// Modal Management
window.onclick = function(event) {
    const caregiverModal = document.getElementById('caregiverModal');
    const timeEditModal = document.getElementById('timeEditModal');
    
    if (event.target === caregiverModal) {
        closeCaregiverModal();
    }
    if (event.target === timeEditModal) {
        closeTimeEditModal();
    }
}

// Initialize App
async function initializeApp() {
    updateTime();
    setInterval(updateTime, 60000);
    
    await checkConnection();
    setInterval(checkConnection, 30000); // Check connection every 30 seconds
    
    if (isOnline) {
        await loadCaregivers();
    }
}

// Start the app when page loads
window.addEventListener('load', initializeApp);