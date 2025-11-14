# Caregiver Time Tracking App - Design Document

## Project Overview

A mobile-friendly web application for tracking caregiver hours at home, designed for family use with bilingual support (English/Chinese) and accessibility features.

## Requirements

### Functional Requirements

#### Core Features
1. **Time Tracking**
   - Clock in/out functionality for caregivers
   - Manual time entry and editing capabilities
   - Delete/modify existing time entries
   - Support for multiple caregivers

2. **Hour Management**
   - Set monthly hour allocations per caregiver
   - Track hours worked vs. allocated
   - Display remaining hours for current month
   - Monthly reset functionality

3. **User Interface**
   - **Mobile-first design** - optimized for phones and tablets
   - **Bilingual support** - English and Chinese (Traditional/Simplified)
   - **Large fonts and buttons** for accessibility
   - **Touch-friendly interface** with generous tap targets

4. **Data Management**
   - Add/edit/remove caregiver profiles
   - Export time data for payroll
   - Data persistence across sessions

#### User Stories
- As a family member, I want to quickly clock in a caregiver when they arrive
- As a family member, I want to clock out a caregiver when they leave
- As a family member, I want to edit time entries if I forget to clock in/out
- As a family member, I want to see how many hours each caregiver has worked this month
- As a family member, I want to set monthly hour limits for each caregiver
- As a family member, I want to switch between English and Chinese interface
- As a family member, I want large buttons that are easy to tap on mobile

### Non-Functional Requirements

#### Performance
- Fast loading on mobile devices
- Offline capability for basic functions
- Responsive design (works on all screen sizes)

#### Accessibility
- Large font sizes (minimum 18px for body text)
- High contrast colors
- Touch targets minimum 44px
- Screen reader compatible

#### Internationalization
- English and Chinese language support
- Easy language switching
- Proper Chinese character display
- Date/time formatting per locale

#### Security & Privacy
- Family-only access (no external user authentication)
- Local data storage (no external servers required)
- Data export capabilities

## Technical Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla or React)
- **Data Storage**: localStorage (browser-based)
- **Styling**: CSS Grid/Flexbox for responsive design
- **Icons**: Font Awesome or similar for intuitive UI
- **Deployment**: GitHub Pages (static hosting)

### Data Structure

#### Caregivers
```javascript
{
  id: "uuid",
  name: "Caregiver Name",
  nameZh: "护工姓名",
  monthlyHours: 160,
  hourlyRate: 25.00,
  isActive: true,
  createdAt: "2025-11-13T10:00:00Z"
}
```

#### Time Entries
```javascript
{
  id: "uuid",
  caregiverId: "uuid",
  clockIn: "2025-11-13T08:00:00Z",
  clockOut: "2025-11-13T16:00:00Z",
  totalHours: 8.0,
  notes: "Regular shift",
  editedBy: "family_member",
  createdAt: "2025-11-13T08:00:00Z",
  modifiedAt: "2025-11-13T08:05:00Z"
}
```

#### Monthly Allocations
```javascript
{
  id: "uuid",
  caregiverId: "uuid",
  month: "2025-11",
  allocatedHours: 160,
  workedHours: 45.5,
  remainingHours: 114.5
}
```

### User Interface Design

#### Mobile-First Approach
- **Viewport**: Mobile devices (320px-768px)
- **Navigation**: Single page application with sections
- **Buttons**: Minimum 60px height for touch targets
- **Fonts**: 
  - Headers: 24px-32px
  - Body text: 18px-20px
  - Small text: 16px minimum

#### Language Support
```javascript
const translations = {
  en: {
    clockIn: "Clock In",
    clockOut: "Clock Out",
    hoursWorked: "Hours Worked",
    hoursRemaining: "Hours Remaining",
    // ... more translations
  },
  zh: {
    clockIn: "上班打卡",
    clockOut: "下班打卡",
    hoursWorked: "已工作小时",
    hoursRemaining: "剩余小时",
    // ... more translations
  }
}
```

#### Color Scheme
- **Primary**: #2196F3 (Material Blue)
- **Secondary**: #4CAF50 (Material Green)
- **Warning**: #FF9800 (Material Orange)
- **Error**: #F44336 (Material Red)
- **Background**: #FAFAFA (Light Gray)
- **Text**: #212121 (Dark Gray)

### Features Breakdown

#### 1. Dashboard View
- Current date/time display
- List of active caregivers
- Quick action buttons
- Monthly summary cards

#### 2. Caregiver Management
- Add new caregiver form
- Edit existing caregiver details
- Set monthly hour allocations
- Activate/deactivate caregivers

#### 3. Time Entry Interface
- Large clock in/out buttons per caregiver
- Current status display (clocked in/out)
- Manual time entry form
- Time entry history list

#### 4. Reporting Dashboard
- Monthly hours summary
- Individual caregiver reports
- Export functionality (CSV/PDF)
- Visual progress indicators

#### 5. Settings & Administration
- Language preference toggle
- Data backup/restore
- Monthly reset functionality
- App configuration

## Implementation Plan

### Phase 1: Core Functionality (Week 1)
- Basic HTML structure and mobile CSS
- localStorage data management
- Simple clock in/out functionality
- Basic caregiver management

### Phase 2: Enhanced Features (Week 2)
- Bilingual support implementation
- Time entry editing capabilities
- Monthly hour tracking
- Responsive design refinement

### Phase 3: Polish & Deploy (Week 3)
- UI/UX improvements
- Large font implementation
- Testing on various devices
- GitHub Pages deployment

## Testing Strategy

### Device Testing
- iPhone (Safari, Chrome)
- Android (Chrome, Samsung Browser)
- iPad (Safari)
- Desktop (Chrome, Firefox, Edge)

### Language Testing
- English interface functionality
- Chinese character display
- Language switching
- Date/time localization

### Accessibility Testing
- Touch target sizes
- Font readability
- Color contrast ratios
- Screen reader compatibility

## Deployment

### Hosting
- **Platform**: GitHub Pages
- **Domain**: https://parryying.github.io/caregiver
- **SSL**: Automatic HTTPS
- **Updates**: Git push to deploy

### Browser Support
- **Mobile**: iOS Safari 12+, Chrome 80+
- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+
- **Progressive Enhancement**: Core features work on older browsers

## Future Enhancements

### Potential Features
- Push notifications for shift reminders
- GPS location verification
- Photo capture for shift verification
- Integration with payroll systems
- Advanced reporting and analytics
- Multi-family support
- Backup to cloud storage

### Technology Upgrades
- Progressive Web App (PWA) capabilities
- Offline functionality
- Backend API for multi-device sync
- Mobile app versions (iOS/Android)

## Success Metrics

- **Usability**: Family members can clock in/out caregivers in under 10 seconds
- **Accessibility**: All text readable on mobile devices without zooming
- **Language**: Seamless switching between English and Chinese
- **Reliability**: 99% uptime, data persistence across sessions
- **Performance**: Page loads in under 2 seconds on mobile

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Next Review**: December 13, 2025