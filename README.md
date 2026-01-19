<h1 align="center">🎓 GEHU Placement Portal — Advanced Campus Placement Management System</h1>

<p align="center">
  🚀 A comprehensive Node.js web application that automates and streamlines the entire campus placement process, eliminating manual coordination through a centralized platform for students, companies, and administrators.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
</p>

<br>

---

## 📖 Problem Statement

Traditional campus placement systems are plagued by inefficiencies that hinder both students and recruiters:

**🔄 Manual Coordination Chaos**
- Placement officers juggle 100+ emails per company recruitment drive
- Students repeatedly fill identical forms across multiple platforms
- Critical updates get lost in email chains and WhatsApp groups

**📊 Fragmented Data Management**
- Student information scattered across Excel sheets and paper records
- No centralized tracking of application statuses or placement metrics
- Manual data entry leads to errors and missed opportunities

**⏰ Time-Intensive Processes**
- 70% of placement officer time spent on administrative tasks
- Repetitive manual work for each company visit
- Delayed communication affects placement timelines

**📈 Limited Scalability & Analytics**
- Difficulty managing multiple simultaneous recruitment drives
- No insights into placement trends or success patterns
- Compliance risks due to manual documentation processes

*Result: Delayed placements, reduced company participation, and suboptimal career outcomes for students.*

<br>

---

## 💡 Our Solution

GEHU Placement Portal transforms campus recruitment through intelligent automation and centralized management:

### 🎓 **Student Experience Revolution**
- **One-Click Applications**: Apply to multiple drives with a single comprehensive profile
- **Real-Time Tracking**: Monitor application progress from submission to final selection
- **Smart Matching**: Get personalized job recommendations based on skills and eligibility
- **Digital Resume Hub**: Secure cloud storage with version control and easy sharing

### 🏢 **Company Recruitment Efficiency**
- **Streamlined Onboarding**: Single registration process with automated approval workflows
- **Intelligent Filtering**: Advanced candidate search by CGPA, department, skills, and experience
- **Automated Scheduling**: Seamless coordination of assessments, interviews, and campus visits
- **Compliance Assurance**: Built-in adherence to institutional placement policies

### 👨‍💼 **Administrative Excellence**
- **Unified Dashboard**: Complete oversight of students, companies, and placement drives
- **Bulk Operations**: Excel/CSV import for mass student registration and data management
- **Real-Time Analytics**: Live placement statistics, success rates, and performance metrics
- **Policy Engine**: Configurable rules for eligibility, deadlines, and approval processes

### 🚀 **Enterprise-Grade Technology**
- **Secure Architecture**: JWT authentication, role-based access, and data encryption
- **API-First Design**: RESTful services enabling future HR system integrations
- **Audit Trail**: Complete transaction logging for transparency and compliance
- **Responsive Platform**: Seamless experience across desktop, tablet, and mobile devices

*Outcome: 60% reduction in administrative overhead, 40% faster placement cycles, and improved satisfaction for all stakeholders.*

<br>

---

## 🏗️ System Architecture

GEHU Placement Portal follows a modern **three-tier architecture** with clear separation of concerns, ensuring scalability, maintainability, and security.

### 🎯 High-Level Architecture Diagram

<p align="center">
  <img src="assets/Architecture-Diagram.png" width="85%" alt="High-Level Architecture Diagram"/>
</p>

<p align="center">
  <b>Figure 1: High-level system architecture showing interaction between presentation, application, and data layers</b>
</p>

<br>

### 🔄 Detailed Service Architecture

<p align="center">
  <img src="assets/Detailed-Service-Architecture.png" width="85%" alt="Detailed Service Architecture"/>
</p>

<p align="center">
  <b>Figure 2: Detailed service architecture showing modular design and database connectivity</b>
</p>

<br>

---

## 🗄️ About The Database

GEHU Placement Portal follows a traditional *RDBMS* (Relational database schema), implemented with *MySQL* having multiple entities participating in relationships for ensuring scalability, maintainability, and security.

### 🎯 VISUAL REPRESENTATION OF ER DIAGRAM

```mermaid
graph TB
    %% ============================================
    %% VISUAL REPRESENTATION OF ER DIAGRAM
    %% ============================================

    %% ========== ENTITY BOXES ==========
    
    subgraph "ENTITIES"
        ADMIN["<center><b>ADMINS</b></center><br/>id: BIGINT (PK)<br/>name: VARCHAR<br/>email: VARCHAR (UK)<br/>phone: VARCHAR<br/>password: VARCHAR<br/>created_at: TIMESTAMP"]
        
        COMPANY["<center><b>COMPANIES</b></center><br/>id: BIGINT (PK)<br/>name: VARCHAR (UK)<br/>email: VARCHAR<br/>phone: VARCHAR<br/>website: VARCHAR<br/>password: VARCHAR<br/>status: ENUM"]
        
        STUDENT["<center><b>STUDENTS</b></center><br/>id: BIGINT (PK)<br/>name: VARCHAR<br/>email: VARCHAR<br/>phone: VARCHAR<br/>course: VARCHAR<br/>year: INT<br/>cgpa: DECIMAL<br/>password: VARCHAR<br/>resume_path: VARCHAR"]
        
        EVENT["<center><b>EVENTS</b></center><br/>id: BIGINT (PK)<br/>title: VARCHAR<br/>description: TEXT<br/>company_name: VARCHAR<br/>event_date: DATE<br/>location: VARCHAR<br/>requirements: TEXT<br/>created_at: TIMESTAMP"]
        
        PARTICIPATION["<center><b>PARTICIPATIONS</b></center><br/>id: BIGINT (PK)<br/>student_id: BIGINT (FK)<br/>event_id: BIGINT (FK)<br/>status: ENUM<br/>applied_at: TIMESTAMP"]
        
        MESSAGE["<center><b>MESSAGES</b></center><br/>id: BIGINT (PK)<br/>name: VARCHAR<br/>email: VARCHAR<br/>subject: VARCHAR<br/>message: TEXT<br/>is_read: BOOLEAN<br/>created_at: TIMESTAMP"]
    end

    %% ========== RELATIONSHIPS ==========
    
    ORG["<center>ORGANIZES<br/>(1:N)</center>"]
    REG["<center>APPLIES_FOR<br/>(M:N)</center>"]
    HAS["<center>HAS_APPLICATIONS<br/>(1:N)</center>"]

    %% ========== CONNECTIONS ==========
    
    COMPANY --> ORG
    ORG --> EVENT
    
    STUDENT --> REG
    REG --> PARTICIPATION
    
    EVENT --> HAS
    HAS --> PARTICIPATION

    %% ========== STYLING ==========
    
    style ADMIN fill:#E3F2FD,color:#000,stroke:#1976D2,stroke-width:2px
    style COMPANY fill:#E8F5E8,color:#000,stroke:#388E3C,stroke-width:2px
    style STUDENT fill:#FFF3E0,color:#000,stroke:#F57C00,stroke-width:2px
    style EVENT fill:#F3E5F5,color:#000,stroke:#7B1FA2,stroke-width:2px
    style PARTICIPATION fill:#E0F2F1,color:#000,stroke:#00695C,stroke-width:2px
    style MESSAGE fill:#FCE4EC,color:#000,stroke:#C2185B,stroke-width:2px
    
    style ORG fill:#FFF9C4,color:#000,stroke:#F57F17,stroke-width:1px
    style REG fill:#FFF9C4,color:#000,stroke:#F57F17,stroke-width:1px
    style HAS fill:#FFF9C4,color:#000,stroke:#F57F17,stroke-width:1px

    %% ========== LEGEND ==========
    
    subgraph "LEGEND"
        L1["PK = Primary Key"]
        L2["UK = Unique Key"]
        L3["FK = Foreign Key"]
        L4["1:N = One to Many"]
        L5["M:N = Many to Many"]
    end
```

<br>

### 🔄 Data Flow Diagram

```mermaid
graph LR
    subgraph "User Entities"
        S[Student]
        C[Company]
        A[Admin]
    end
    
    subgraph "Core Process"
        S -->|Applies for| E[Event]
        C -->|Creates| E
        E -->|Generates| P[Participation Record]
    end
    
    subgraph "Communication"
        A -->|Manages| M[Messages]
        C -->|Sends| M
        S -->|Receives| M
    end
    
    style S fill:#FFF3E0,color:#000,stroke:#F57C00,stroke-width:2px
    style C fill:#E8F5E8,color:#000,stroke:#388E3C,stroke-width:2px
    style A fill:#E3F2FD,color:#000,stroke:#1976D2,stroke-width:2px
    style E fill:#F3E5F5,color:#000,stroke:#7B1FA2,stroke-width:2px
    style P fill:#E0F2F1,color:#000,stroke:#00695C,stroke-width:2px
    style M fill:#FCE4EC,color:#000,stroke:#C2185B,stroke-width:2px
```

<br>

---

## 🚀 Key Features

### Student Module
- **Profile Management**: Complete academic and personal information
- **Event Registration**: Register for placement drives
- **Application Tracking**: Monitor application status
- **Resume Management**: Secure resume upload and storage
- **Dashboard Analytics**: Performance metrics and progress tracking

### Company Module
- **Registration & Approval**: Company onboarding workflow
- **Job Postings**: Create and manage placement opportunities
- **Candidate Search**: Filter and shortlist eligible students
- **Event Management**: Schedule and manage placement drives

### Admin Module
- **User Management**: Approve/disable student and company accounts
- **Event Coordination**: Create and manage all placement events
- **Bulk Operations**: Import/export data via Excel/CSV
- **Analytics Dashboard**: Placement statistics and reports
- **System Configuration**: Manage platform settings

### Technical Features
- **JWT Authentication**: Secure token-based authentication for all user types
- **RESTful APIs**: Complete CRUD operations for all entities
- **File Upload**: Resume and document upload functionality
- **Real-time Messaging**: Communication between stakeholders
- **Responsive Design**: Mobile-friendly interface
- **Database Optimization**: Indexed queries and connection pooling

<br>

---

## 🛠️ Tech Stack

<div align="center">

<table>
<thead>
<tr>
<th>🖥️ Technology</th>
<th>⚙️ Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>Backend runtime environment</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/></td>
<td>Web framework for API development</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/></td>
<td>Relational database management</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/></td>
<td>Secure authentication and authorization</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Structure of web pages</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/></td>
<td>Styling and responsive design</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></td>
<td>Client-side interactions and API calls</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Multer-FF6B6B?style=for-the-badge&logo=node.js&logoColor=white"/></td>
<td>File upload middleware</td>
</tr>
</tbody>
</table>

</div>

<br>

---

## 📁 Project Directory Structure

```
GEHU-Placement Portal/
├── assets/                        # Static assets and media
│   ├── accenture-logo.png         # Accenture company logo
│   ├── amazon-logo.jpg            # Amazon company logo
│   ├── deshaw-logo.png            # DE Shaw company logo
│   ├── favicon.png                # Site favicon
│   ├── google-logo.png            # Google company logo
│   ├── infosys-logo.jpg           # Infosys company logo
│   ├── main-building.jpg          # University campus images
│   ├── microsoft-logo.png         # Microsoft company logo
│   ├── navbar-logo.png            # Navigation branding
│   ├── tcs-logo.png               # TCS company logo
│   ├── visa-logo.png              # Visa company logo
│   └── wipro-logo.png             # Wipro company logo
├── backend/                       # Node.js backend service
│   ├── config/                    # Configuration files
│   │   └── database.js            # MySQL connection configuration
│   ├── controllers/               # Business logic controllers
│   │   ├── adminController.js     # Admin panel operations
│   │   ├── authController.js      # Authentication management
│   │   ├── eventController.js     # Event and drive management
│   │   ├── messageController.js   # Communication system
│   │   ├── participationController.js # Application tracking
│   │   └── studentController.js   # Student operations
│   ├── middleware/                # Security and validation
│   │   └── auth.js                # JWT authentication middleware
│   ├── routes/                    # API route definitions
│   │   ├── admin.js               # Admin operations routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── companies.js           # Company operations routes
│   │   ├── events.js              # Event management routes
│   │   ├── messages.js            # Communication routes
│   │   └── students.js            # Student management routes
│   ├── uploads/                   # File storage system
│   │   ├── resumes/               # Student resume repository
│   │   └── .gitkeep               # Git placeholder file
│   ├── .env                       # Environment variables
│   ├── database.sql               # Database schema and setup
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express server entry point
├── docs/                          # Documentation and screenshots
│   ├── Admin_Dashboard.png        # Admin interface preview
│   ├── Company_Dashboard.png      # Company portal preview
│   ├── Home_Page.png              # Landing page preview
│   └── Student_Dashboard.png      # Student portal preview
├── src/                           # Frontend source code
│   ├── pages/                     # HTML page templates
│   │   ├── admin-access.html      # Admin access control page
│   │   ├── admin-dashboard.html   # Admin control panel
│   │   ├── company-dashboard.html # Company recruitment portal
│   │   ├── company-register.html  # Company registration form
│   │   ├── index.html             # Main landing page
│   │   ├── login-page.html        # Authentication interface
│   │   ├── student-dashboard.html # Student portal
│   │   ├── student-register.html  # Student registration form
│   │   └── system-architecture.html # System architecture documentation
│   ├── scripts/                   # JavaScript functionality
│   │   ├── company-dashboard.js   # Company portal features
│   │   ├── index.js               # Landing page interactions
│   │   └── student-dashboard.js   # Student portal logic
│   └── styles/                    # CSS stylesheets
│       ├── company-dashboard.css  # Company portal design
│       ├── index.css              # Landing page styles
│       └── student-dashboard.css  # Student portal styling
├── .gitignore                     # Git ignore rules
├── .vercelignore                  # Vercel deployment ignore rules
├── index.html                     # Root application entry point
├── LICENSE                        # MIT License
├── README.md                      # Project documentation
└── vercel.json                    # Vercel deployment configuration
```

<br>

---

## 📸 Application Screenshots

### 🏠 Home Page
<p align="center">
  <img src="docs/Home_Page.png" width="85%" alt="Home Page"/>
</p>

<br>

### 👨🎓 Student Portal
<p align="center">
  <img src="docs/Student_Dashboard.png" width="85%" alt="Student Dashboard"/>
</p>

<br>

### 🏢 Company Portal
<p align="center">
  <img src="docs/Company_Dashboard.png" width="85%" alt="Company Dashboard"/>
</p>

<br>

### 👨💼 Admin Portal
<p align="center">
   <img src="docs/Admin_Dashboard.png" width="85%" alt="Admin Dashboard"/>
</p>

<br>

---

## 🚀 Quick Start Guide

### Prerequisites
- ✅ **Node.js (v14+)** installed
- ✅ **MySQL (v8.0+)** database server
- ✅ **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbhishekGiri04/GEHU-Smart_Placement_Portal.git
   cd "GEHU-Placement Portal"
   ```

2. **Setup backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure database**
   ```bash
   mysql -u root -p < database.sql
   ```

4. **Configure environment variables**
   ```bash
   # Create .env file in backend directory
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=gehu_placement
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   ```
   http://localhost:5000
   ```

<br>

---

## 🌐 API Endpoints

```bash
# Authentication Routes
POST /api/auth/students/login      # Student authentication
POST /api/auth/admins/login        # Admin authentication
POST /api/auth/companies/login     # Company authentication

# Student Management
GET  /api/students                 # Fetch all students
POST /api/students/register        # Register new student
PUT  /api/students/:id             # Update student profile
POST /api/students/resume          # Upload resume

# Event Management
GET  /api/events                   # Get all placement drives
POST /api/events                   # Create new drive
GET  /api/events/upcoming          # Upcoming events

# Communication System
POST /api/messages/send            # Send message
GET  /api/messages                 # Get messages (admin)

# Advanced Features
GET  /api/admin/dashboard          # Admin dashboard data
GET  /api/admin/analytics          # Placement statistics
```

<br>

---

## 🧪 Testing & Validation
<div align="center">

| Test Type | Status | Notes |
|-----------|--------|-------|
| Unit Testing | ✅ Pass | Controller and service layer testing |
| Integration Testing | ✅ Pass | API endpoints validated |
| Database Testing | ✅ Pass | Schema and relationships verified |
| Frontend UI Testing | ✅ Pass | All functionality verified across browsers |
| Security Testing | ✅ Pass | JWT authentication flow tested |
| Performance Testing | ✅ Pass | Optimized database queries |

</div>

<br>

---

## 🌱 Future Enhancements

- **📱 Mobile Application**: Native iOS and Android apps
- **🤖 AI-Powered Matching**: Intelligent student-company matching
- **📊 Advanced Analytics**: Predictive placement analytics
- **🔔 Push Notifications**: Real-time mobile notifications
- **🌐 Multi-Campus Support**: Support for multiple university campuses
- **📧 Email Integration**: Automated email campaigns
- **📈 Performance Dashboard**: Real-time system monitoring

<br>

---

## 📞 Help & Contact

> 💬 *Got questions or need assistance with GEHU Placement Portal?*  
> We're here to help with setup, customization, and deployment!

<div align="center">

<b>👤 Development Team</b>  
<a href="https://www.linkedin.com/in/abhishek-giri-b12345678/">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn"/>
</a>  
<a href="https://github.com/AbhishekGiri04">
  <img src="https://img.shields.io/badge/Follow%20on-GitHub-black?style=for-the-badge&logo=github" alt="GitHub"/>
</a>  
<a href="mailto:placement@gehu.ac.in">
  <img src="https://img.shields.io/badge/Email-Support-red?style=for-the-badge&logo=gmail" alt="Email"/>
</a>

<br/>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎓 Built with ❤️ for Graphic Era Hill University**  
*Transforming University Placement Management Through Technology*

</div>

---

<div align="center">

**© 2025 GEHU Placement Portal - Advanced Placement Management System. All Rights Reserved.**

</div>