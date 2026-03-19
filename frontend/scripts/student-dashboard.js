// Student Dashboard JavaScript - Admin Style

// Navigation Functions
function showDashboard() {
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('home').style.display = 'block';
}

function showSection(sectionId) {
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function updateSidebarActive(clickedElement) {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });
    clickedElement.classList.add('active');
}



// Logout Function
function logoutUser() {
    window.location.href = 'index.html';
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Force profile percentage update
    const profilePercent = document.getElementById('profilePercent');
    if (profilePercent && profilePercent.textContent === '0%') {
        profilePercent.textContent = '93%';
    }
    
    // Initialize notification click handler
    const notificationIcon = document.getElementById('notificationIcon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            alert('Notifications: You have 3 new updates!');
        });
    }
    
    // Initialize resume upload
    const resumeUpload = document.getElementById('resumeUpload');
    const selectResumeBtn = document.getElementById('selectResumeBtn');
    
    if (selectResumeBtn && resumeUpload) {
        selectResumeBtn.addEventListener('click', function() {
            resumeUpload.click();
        });
        
        resumeUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const uploadArea = document.getElementById('uploadArea');
                const previewArea = document.getElementById('resumePreviewArea');
                const fileName = document.getElementById('resumeFileName');
                const fileSize = document.getElementById('resumeFileSize');
                const lastUpdated = document.getElementById('resumeLastUpdated');
                
                if (uploadArea && previewArea && fileName && fileSize && lastUpdated) {
                    uploadArea.style.display = 'none';
                    previewArea.style.display = 'block';
                    fileName.textContent = file.name;
                    fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
                    lastUpdated.textContent = new Date().toLocaleDateString();
                    showNotification('Resume uploaded successfully', 'success');
                }
            }
        });
    }
    
    // Initialize download and delete buttons
    const downloadBtn = document.getElementById('downloadResumeBtn');
    const deleteBtn = document.getElementById('deleteResumeBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            showNotification('Resume download started', 'success');
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your resume?')) {
                const uploadArea = document.getElementById('uploadArea');
                const previewArea = document.getElementById('resumePreviewArea');
                const resumeUpload = document.getElementById('resumeUpload');
                
                if (uploadArea && previewArea && resumeUpload) {
                    uploadArea.style.display = 'block';
                    previewArea.style.display = 'none';
                    resumeUpload.value = '';
                    showNotification('Resume deleted successfully', 'success');
                }
            }
        });
    }
    
    // Initialize edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            toggleEditProfile();
        });
    }
    
    // Initialize events section
    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function() {
            addDemoEvents();
        });
    }
    
    // Initialize export CSV button
    const exportCsvBtn = document.getElementById('exportCsv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            exportRecordsToCSV();
        });
    }
    
    // Load past records
    loadPastRecords();
    
    // Show dashboard by default
    showDashboard();
});

// Demo Events Function
function addDemoEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsEmpty = document.getElementById('eventsEmpty');
    
    if (!eventsGrid || !eventsEmpty) return;
    
    const demoEvents = [
        {
            company: 'Google',
            role: 'SDE Intern',
            date: '12 Oct 2025',
            package: '₹15 LPA',
            status: 'Registration Open',
            deadline: '10 Oct 2025',
            eligibility: 'B.Tech CSE/IT, CGPA 8.0+'
        },
        {
            company: 'Microsoft',
            role: 'Software Engineer',
            date: '25 Oct 2025',
            package: '₹18 LPA',
            status: 'Upcoming',
            deadline: '20 Oct 2025',
            eligibility: 'B.Tech All Branches, CGPA 7.5+'
        },
        {
            company: 'Amazon',
            role: 'SDE-1',
            date: '30 Oct 2025',
            package: '₹16 LPA',
            status: 'Registration Open',
            deadline: '28 Oct 2025',
            eligibility: 'B.Tech CSE/ECE, CGPA 8.5+'
        },
        {
            company: 'TCS',
            role: 'Software Analyst',
            date: '15 Nov 2025',
            package: '₹3.5 LPA',
            status: 'Registration Open',
            deadline: '12 Nov 2025',
            eligibility: 'All Branches, CGPA 6.0+'
        }
    ];
    
    eventsGrid.innerHTML = '';
    
    demoEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card card hover-scale';
        
        const statusColor = event.status === 'Registration Open' ? '#10b981' : '#f59e0b';
        
        eventCard.innerHTML = `
            <div class="event-header">
                <div class="company-info">
                    <div class="company-logo">
                        <span class="material-symbols-outlined">business</span>
                    </div>
                    <div>
                        <h4>${event.company}</h4>
                        <p class="role">${event.role}</p>
                    </div>
                </div>
                <span class="status-badge" style="background: ${statusColor}; color: white;">${event.status}</span>
            </div>
            <div class="event-details">
                <div class="detail-item">
                    <span class="material-symbols-outlined">event</span>
                    <span>Drive Date: ${event.date}</span>
                </div>
                <div class="detail-item">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>Deadline: ${event.deadline}</span>
                </div>
                <div class="detail-item">
                    <span class="material-symbols-outlined">payments</span>
                    <span>Package: ${event.package}</span>
                </div>
                <div class="detail-item">
                    <span class="material-symbols-outlined">school</span>
                    <span>Eligibility: ${event.eligibility}</span>
                </div>
            </div>
            <div class="event-actions">
                <button class="btn btn-primary" onclick="applyToDrive('${event.company}')">Apply Now</button>
                <button class="btn btn-outline" onclick="viewDriveDetails('${event.company}')">View Details</button>
            </div>
        `;
        
        eventsGrid.appendChild(eventCard);
    });
    
    eventsEmpty.style.display = 'none';
}

// Event Functions
function registerForDrive(company) {
    showNotification(`Registration for ${company} drive completed`, 'success');
}

function viewDriveDetails(company) {
    alert(`Viewing details for ${company} placement drive.`);
}

// Export Records Function
function exportRecordsToCSV() {
    const csvContent = "data:text/csv;charset=utf-8,Company,Role,Date,Status,Remarks\nGoogle,SDE Intern,12 Oct 2025,Applied,Waiting for response\nMicrosoft,Software Engineer,25 Oct 2025,Shortlisted,Interview scheduled\nAmazon,SDE-1,30 Oct 2025,Registered,Drive upcoming";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "placement_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Search and Filter Functions
function searchEvents() {
    // Implementation for event search
    console.log('Searching events...');
}

function filterEvents() {
    // Implementation for event filtering
    console.log('Filtering events...');
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Animation Functions
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Resource Functions
function startAptitudeTest() {
    showNotification('Opening aptitude test practice', 'info');
}

function viewCodingProblems() {
    showNotification('Loading coding problems', 'info');
}

function watchInterviewVideos() {
    showNotification('Opening interview preparation videos', 'info');
}

function takeMockTest() {
    showNotification('Starting mock assessment', 'info');
}

// Events Functions
function searchDrives() {
    const searchTerm = document.getElementById('driveSearch').value;
    alert(`Searching for: ${searchTerm}`);
}

function sortDrives() {
    const sortBy = document.getElementById('driveSort').value;
    alert(`Sorting by: ${sortBy}`);
}

function applyToDrive(company) {
    showNotification(`Application submitted to ${company}`, 'success');
}

function viewDriveDetails(company) {
    showNotification(`Opening ${company} drive details`, 'info');
}

// Past Records Functions
function loadPastRecords() {
    const recordsBody = document.getElementById('recordsBody');
    if (!recordsBody) return;
    
    const records = [
        { company: 'Google', role: 'SDE Intern', date: '15 Sep 2025', status: 'Applied', remarks: 'Waiting for response' },
        { company: 'Microsoft', role: 'Software Engineer', date: '20 Sep 2025', status: 'Shortlisted', remarks: 'Interview scheduled' },
        { company: 'Amazon', role: 'SDE-1', date: '25 Sep 2025', status: 'Rejected', remarks: 'Did not meet criteria' },
        { company: 'TCS', role: 'Software Analyst', date: '30 Sep 2025', status: 'Selected', remarks: 'Offer received' }
    ];
    
    recordsBody.innerHTML = records.map(record => `
        <tr>
            <td>${record.company}</td>
            <td>${record.role}</td>
            <td>${record.date}</td>
            <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
            <td>${record.remarks}</td>
        </tr>
    `).join('');
}

// Application Functions
function viewApplication(company) {
    alert(`Viewing application details for ${company}`);
}

function uploadTestLink(company) {
    const link = prompt(`Enter test link for ${company}:`);
    if (link) alert(`Test link uploaded for ${company}`);
}

function withdrawApplication(company) {
    if (confirm(`Withdraw application from ${company}?`)) {
        alert(`Application withdrawn from ${company}`);
    }
}

function exportApplications() {
    alert('Exporting applications to CSV...');
}

// Analytics Functions
function generateAnalytics() {
    alert('Generating placement analytics report...');
}

// Messages Functions
function composeMessage() {
    alert('Opening message composer...');
}

// Settings Functions
function updateAccountInfo() {
    alert('Account information updated successfully!');
}

function changePassword() {
    alert('Password changed successfully!');
}

function saveNotificationPreferences() {
    alert('Notification preferences saved!');
}

// Initialize animations on load
window.addEventListener('load', function() {
    // Animate stats values
    const statsValues = document.querySelectorAll('.stats-value');
    statsValues.forEach(element => {
        const value = parseInt(element.textContent);
        if (!isNaN(value) && value > 0) {
            animateValue(element, 0, value, 1000);
        }
    });
    
    // Update progress bars
    const progressBars = document.querySelectorAll('.progress-bar-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
    
    // Add event listeners for search and sort
    const driveSearch = document.getElementById('driveSearch');
    const driveSort = document.getElementById('driveSort');
    
    if (driveSearch) {
        driveSearch.addEventListener('input', searchDrives);
    }
    
    if (driveSort) {
        driveSort.addEventListener('change', sortDrives);
    }
});
// Application Management Functions
function viewApplication(company) {
    showNotification(`Opening ${company} application details`, 'info');
}

function uploadTestLink(company) {
    const link = prompt(`Enter assessment link for ${company}:`);
    if (link) {
        showNotification(`Assessment link saved for ${company}`, 'success');
    }
}

function withdrawApplication(company) {
    if (confirm(`Are you sure you want to withdraw your application from ${company}?`)) {
        showNotification(`Application withdrawn from ${company}`, 'info');
    }
}

function exportApplications() {
    const csvContent = "data:text/csv;charset=utf-8,Company,Role,Date,Status,Package\nTCS,Software Analyst,12 Oct 2025,Shortlisted,₹3.5 LPA\nInfosys,System Engineer,10 Oct 2025,Applied,₹4.0 LPA\nWipro,Data Analyst,05 Oct 2025,Not Selected,₹4.5 LPA";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Messages Functions
function composeMessage() {
    alert('Compose message functionality will be implemented soon!');
}

// Analytics Functions
function generateAnalytics() {
    console.log('Generating placement analytics...');
}

// Settings Functions
function updateAccountInfo() {
    alert('Account information updated successfully!');
}

function changePassword() {
    alert('Password changed successfully!');
}

function saveNotificationPreferences() {
    alert('Notification preferences saved!');
}
// Navigation Dropdown Functions
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    const profilePanel = document.getElementById('profilePanel');
    
    // Close profile panel if open
    if (profilePanel) profilePanel.style.display = 'none';
    
    // Toggle notifications panel
    if (panel) {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }
}

function toggleProfileMenu() {
    const panel = document.getElementById('profilePanel');
    const notificationPanel = document.getElementById('notificationPanel');
    
    // Close notification panel if open
    if (notificationPanel) notificationPanel.style.display = 'none';
    
    // Toggle profile panel
    if (panel) {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const notificationPanel = document.getElementById('notificationPanel');
    const profilePanel = document.getElementById('profilePanel');
    
    if (!event.target.closest('.notification-dropdown') && notificationPanel) {
        notificationPanel.style.display = 'none';
    }
    
    if (!event.target.closest('.profile-dropdown') && profilePanel) {
        profilePanel.style.display = 'none';
    }
});

// Edit Profile Functions
function toggleEditProfile() {
    const profileSection = document.getElementById('profile');
    const isEditing = profileSection.classList.contains('editing');
    
    if (isEditing) {
        saveProfile();
    } else {
        enableEditMode();
    }
}

function enableEditMode() {
    const profileSection = document.getElementById('profile');
    const editBtn = document.getElementById('editProfileBtn');
    
    profileSection.classList.add('editing');
    editBtn.textContent = 'Save Profile';
    editBtn.classList.remove('btn-primary');
    editBtn.classList.add('btn-success');
    
    // Convert spans to input fields
    const editableFields = [
        { selector: '.info-group:nth-child(1) span', key: 'fatherName' },
        { selector: '.info-group:nth-child(2) span', key: 'motherName' },
        { selector: '.info-group:nth-child(3) span', key: 'dob' },
        { selector: '.info-group:nth-child(4) span', key: 'email' }
    ];
    
    editableFields.forEach(field => {
        const element = document.querySelector(`#profile ${field.selector}`);
        if (element) {
            const currentValue = element.textContent;
            const inputType = field.key === 'dob' ? 'date' : field.key === 'email' ? 'email' : 'text';
            element.innerHTML = `<input type="${inputType}" value="${currentValue}" class="edit-input" data-field="${field.key}">`;
        }
    });
    
    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.onclick = cancelEdit;
    editBtn.parentNode.appendChild(cancelBtn);
}

function saveProfile() {
    const profileSection = document.getElementById('profile');
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = editBtn.parentNode.querySelector('.btn-outline');
    
    // Get all input values
    const inputs = profileSection.querySelectorAll('.edit-input');
    const updatedData = {};
    
    inputs.forEach(input => {
        updatedData[input.dataset.field] = input.value;
        // Replace input with span
        const span = document.createElement('span');
        span.textContent = input.value;
        input.parentNode.replaceChild(span, input);
    });
    
    // Reset button state
    profileSection.classList.remove('editing');
    editBtn.textContent = 'Edit Profile';
    editBtn.classList.remove('btn-success');
    editBtn.classList.add('btn-primary');
    
    // Remove cancel button
    if (cancelBtn) cancelBtn.remove();
    
    // Show success message
    showNotification('Profile updated successfully!', 'success');
}

function cancelEdit() {
    const profileSection = document.getElementById('profile');
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = editBtn.parentNode.querySelector('.btn-outline');
    
    // Restore original values
    const inputs = profileSection.querySelectorAll('.edit-input');
    inputs.forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.defaultValue || input.value;
        input.parentNode.replaceChild(span, input);
    });
    
    // Reset button state
    profileSection.classList.remove('editing');
    editBtn.textContent = 'Edit Profile';
    editBtn.classList.remove('btn-success');
    editBtn.classList.add('btn-primary');
    
    // Remove cancel button
    if (cancelBtn) cancelBtn.remove();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}