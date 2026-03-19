// Company Dashboard JavaScript - Admin Style

// Navigation Functions
function showDashboard() {
    document.querySelectorAll('.main-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('dashboard').style.display = 'block';
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
    if (confirm('Are you sure you want to logout?')) {
        alert('Logging out... Redirecting to home page.');
        window.location.href = 'index.html';
    }
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Load initial data
    loadStudents();
    loadJobs();
    loadInterviews();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show dashboard by default
    showDashboard();
});

// Initialize Dashboard
function initDashboard() {
    console.log('GEHU Placement Portal - Company Dashboard initialized');
}

// Setup Event Listeners
function setupEventListeners() {
    // Add Job Button
    const addJobBtn = document.getElementById('add-job-btn');
    if (addJobBtn) {
        addJobBtn.addEventListener('click', function() {
            openJobModal();
        });
    }
    
    // Job Modal
    const jobModal = document.getElementById('job-modal');
    const closeModal = document.querySelector('.close');
    const cancelJob = document.getElementById('cancel-job');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            jobModal.classList.remove('active');
        });
    }
    
    if (cancelJob) {
        cancelJob.addEventListener('click', function() {
            jobModal.classList.remove('active');
        });
    }
    
    // Job Form Submission
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitJobForm();
        });
    }
    
    // Student Search
    const searchStudents = document.getElementById('search-students');
    if (searchStudents) {
        searchStudents.addEventListener('input', filterStudents);
    }
    
    // Student Filters
    const departmentFilter = document.getElementById('department-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', filterStudents);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterStudents);
    }
    
    // Generate Report Button
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === jobModal) {
            jobModal.classList.remove('active');
        }
    });
}

// Load Students Data
function loadStudents() {
    const students = [
        {
            id: 1,
            name: 'Rahul Sharma',
            department: 'Computer Science',
            cgpa: 8.9,
            appliedFor: 'Software Developer',
            status: 'applied'
        },
        {
            id: 2,
            name: 'Priya Patel',
            department: 'Electronics',
            cgpa: 9.2,
            appliedFor: 'Data Scientist',
            status: 'shortlisted'
        },
        {
            id: 3,
            name: 'Anjali Verma',
            department: 'Computer Science',
            cgpa: 9.5,
            appliedFor: 'UI/UX Designer',
            status: 'hired'
        },
        {
            id: 4,
            name: 'Rohan Mehta',
            department: 'Mechanical',
            cgpa: 8.7,
            appliedFor: 'Software Engineer',
            status: 'applied'
        },
        {
            id: 5,
            name: 'Neha Gupta',
            department: 'Computer Science',
            cgpa: 9.1,
            appliedFor: 'Data Analyst',
            status: 'shortlisted'
        },
        {
            id: 6,
            name: 'Arun Kumar',
            department: 'Civil',
            cgpa: 8.5,
            appliedFor: 'UI/UX Designer',
            status: 'rejected'
        }
    ];
    
    displayStudents(students);
}

// Display Students in Table
function displayStudents(students) {
    const tableBody = document.getElementById('students-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        
        // Status badge class
        let statusClass = '';
        let statusText = '';
        
        switch(student.status) {
            case 'applied':
                statusClass = 'status-applied';
                statusText = 'Applied';
                break;
            case 'shortlisted':
                statusClass = 'status-shortlisted';
                statusText = 'Shortlisted';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            case 'hired':
                statusClass = 'status-hired';
                statusText = 'Hired';
                break;
        }
        
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.cgpa}</td>
            <td>${student.appliedFor}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-outline" data-id="${student.id}" onclick="viewStudent(${student.id})">View</button>
                    <button class="btn btn-primary" data-id="${student.id}" onclick="shortlistStudent(${student.id})">Shortlist</button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filter Students
function filterStudents() {
    const searchTerm = document.getElementById('search-students').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    console.log(`Filtering students: Search=${searchTerm}, Department=${departmentFilter}, Status=${statusFilter}`);
    
    // Reload students with filters applied (simulated)
    loadStudents();
}

// View Student
function viewStudent(studentId) {
    alert(`Viewing student with ID: ${studentId}`);
}

// Shortlist Student
function shortlistStudent(studentId) {
    alert(`Shortlisting student with ID: ${studentId}`);
}

// Load Jobs Data
function loadJobs() {
    const jobs = [
        {
            id: 1,
            title: 'Software Developer',
            department: 'Computer Science',
            location: 'Bangalore',
            salary: 12,
            description: 'We are looking for a skilled software developer to join our team...',
            requirements: 'B.Tech in CSE, strong programming skills in Java/Python',
            applicants: 45,
            status: 'active'
        },
        {
            id: 2,
            title: 'Data Scientist',
            department: 'Computer Science',
            location: 'Hyderabad',
            salary: 14,
            description: 'Join our data science team to work on cutting-edge AI projects...',
            requirements: 'B.Tech in CSE/IT, knowledge of ML algorithms, Python/R',
            applicants: 32,
            status: 'active'
        },
        {
            id: 3,
            title: 'UI/UX Designer',
            department: 'Computer Science',
            location: 'Remote',
            salary: 10,
            description: 'We need a creative UI/UX designer to improve our product interfaces...',
            requirements: 'Degree in Design or related field, proficiency in Figma/Adobe XD',
            applicants: 28,
            status: 'active'
        },
        {
            id: 4,
            title: 'Mechanical Engineer',
            department: 'Mechanical',
            location: 'Pune',
            salary: 8,
            description: 'Looking for mechanical engineers for our manufacturing division...',
            requirements: 'B.Tech in Mechanical Engineering, CAD knowledge',
            applicants: 18,
            status: 'active'
        }
    ];
    
    displayJobs(jobs);
}

// Display Jobs
function displayJobs(jobs) {
    const jobsContainer = document.getElementById('jobs-container');
    if (!jobsContainer) return;
    
    jobsContainer.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card card hover-scale';
        
        jobCard.innerHTML = `
            <div class="job-header">
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-department">${job.department}</p>
                </div>
                <div class="job-actions">
                    <button class="btn btn-outline" onclick="editJob(${job.id})">Edit</button>
                    <button class="btn btn-primary" onclick="deleteJob(${job.id})">Delete</button>
                </div>
            </div>
            <div class="job-details">
                <div class="job-detail">
                    <span class="material-symbols-outlined">location_on</span>
                    <span>${job.location}</span>
                </div>
                <div class="job-detail">
                    <span class="material-symbols-outlined">payments</span>
                    <span>₹${job.salary} LPA</span>
                </div>
                <div class="job-detail">
                    <span class="material-symbols-outlined">description</span>
                    <span>${job.description.substring(0, 100)}...</span>
                </div>
            </div>
            <div class="job-footer">
                <div class="applicants-count">
                    <span class="material-symbols-outlined">group</span>
                    <span>${job.applicants} Applicants</span>
                </div>
                <button class="btn btn-primary" onclick="viewJobApplicants(${job.id})">View Applicants</button>
            </div>
        `;
        
        jobsContainer.appendChild(jobCard);
    });
}

// Open Job Modal
function openJobModal() {
    const jobModal = document.getElementById('job-modal');
    if (jobModal) {
        jobModal.classList.add('active');
    }
}

// Submit Job Form
function submitJobForm() {
    const jobTitle = document.getElementById('job-title').value;
    const jobDepartment = document.getElementById('job-department').value;
    const jobLocation = document.getElementById('job-location').value;
    const jobSalary = document.getElementById('job-salary').value;
    const jobDescription = document.getElementById('job-description').value;
    const jobRequirements = document.getElementById('job-requirements').value;
    
    console.log('Submitting job:', {
        title: jobTitle,
        department: jobDepartment,
        location: jobLocation,
        salary: jobSalary,
        description: jobDescription,
        requirements: jobRequirements
    });
    
    alert('Job posted successfully!');
    
    // Close modal
    const jobModal = document.getElementById('job-modal');
    jobModal.classList.remove('active');
    
    // Reset form
    document.getElementById('job-form').reset();
    
    // Reload jobs to show the new one
    loadJobs();
}

// Edit Job
function editJob(jobId) {
    alert(`Editing job with ID: ${jobId}`);
}

// Delete Job
function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job posting?')) {
        alert(`Deleting job with ID: ${jobId}`);
    }
}

// View Job Applicants
function viewJobApplicants(jobId) {
    alert(`Viewing applicants for job ID: ${jobId}`);
    showSection('students');
}

// Load Interviews Data
function loadInterviews() {
    const interviews = [
        {
            id: 1,
            candidate: 'Rohan Mehta',
            position: 'Software Engineer',
            date: '2023-03-15',
            time: '10:00 AM - 11:30 AM',
            type: 'Technical'
        },
        {
            id: 2,
            candidate: 'Neha Gupta',
            position: 'Data Scientist',
            date: '2023-03-16',
            time: '2:00 PM - 3:30 PM',
            type: 'Technical'
        },
        {
            id: 3,
            candidate: 'Arun Kumar',
            position: 'UI/UX Designer',
            date: '2023-03-18',
            time: '11:00 AM - 12:00 PM',
            type: 'Design Review'
        }
    ];
    
    displayInterviews(interviews);
}

// Display Interviews
function displayInterviews(interviews) {
    const interviewsList = document.getElementById('interviews-list');
    if (!interviewsList) return;
    
    interviewsList.innerHTML = '';
    
    interviews.forEach(interview => {
        const interviewItem = document.createElement('div');
        interviewItem.className = 'interview-item';
        
        // Format date for display
        const interviewDate = new Date(interview.date);
        const day = interviewDate.getDate();
        const month = interviewDate.toLocaleString('en-US', { month: 'short' });
        
        interviewItem.innerHTML = `
            <div class="interview-time">
                <div class="time">${interview.time.split(' - ')[0]}</div>
                <div class="date">${day} ${month}</div>
            </div>
            <div class="interview-info">
                <h4>${interview.position}</h4>
                <p><strong>Candidate:</strong> ${interview.candidate}</p>
                <p><strong>Type:</strong> ${interview.type}</p>
                <div class="interview-actions">
                    <button class="btn btn-outline" onclick="rescheduleInterview(${interview.id})">Reschedule</button>
                    <button class="btn btn-primary" onclick="cancelInterview(${interview.id})">Cancel</button>
                </div>
            </div>
        `;
        
        interviewsList.appendChild(interviewItem);
    });
}

// Reschedule Interview
function rescheduleInterview(interviewId) {
    alert(`Rescheduling interview with ID: ${interviewId}`);
}

// Cancel Interview
function cancelInterview(interviewId) {
    if (confirm('Are you sure you want to cancel this interview?')) {
        alert(`Canceling interview with ID: ${interviewId}`);
    }
}

// Generate Report
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const timePeriod = document.getElementById('time-period').value;
    
    alert(`Generating ${reportType} report for ${timePeriod}`);
}

// Utility function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Company Profile Functions
function editProfile() {
    alert('Edit Profile functionality will be implemented soon!');
}

// Applicant Management Functions
function downloadResumes() {
    alert('Downloading all resumes as ZIP file...');
}

function exportApplicants() {
    alert('Exporting applicant data to Excel...');
}

function shortlistCandidate(candidateId) {
    alert(`Shortlisting candidate: ${candidateId}`);
}

function rejectCandidate(candidateId) {
    if (confirm(`Are you sure you want to reject candidate: ${candidateId}?`)) {
        alert(`Candidate ${candidateId} has been rejected.`);
    }
}

function selectCandidate(candidateId) {
    alert(`Candidate ${candidateId} has been selected!`);
}

// Recruitment Process Functions
function createNewProcess() {
    alert('Creating new recruitment process...');
}

function viewStageDetails(stage) {
    alert(`Viewing details for ${stage} stage`);
}

function updateStage(stage) {
    alert(`Updating ${stage} stage status`);
}

function scheduleInterview(type) {
    alert(`Scheduling ${type} interview`);
}

function sendOfferLetters() {
    alert('Sending offer letters to selected candidates...');
}

// Drive Scheduling Functions
function requestDriveDate() {
    alert('Requesting new drive date...');
}

// Notifications Functions
function markAllRead() {
    alert('All notifications marked as read.');
}

function filterNotifications(type) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    alert(`Filtering notifications by: ${type}`);
}

// Documents Functions
function uploadDocument() {
    alert('Upload document functionality will be implemented soon!');
}

function viewCategory(category) {
    alert(`Viewing ${category} documents`);
}

// Additional utility functions
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
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
});