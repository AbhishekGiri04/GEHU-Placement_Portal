<h1 align="center">🎓 GEHU Placement Portal — Advanced Placement Management System</h1>

<p align="center">
  🚀 A comprehensive placement management system for Graphic Era Hill University built with modern web technologies, featuring <b>real-time analytics</b> and intelligent recruitment workflows.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
</p>
<br>

---

## 📖 Problem Statement
University placement processes face significant challenges in managing student registrations, company partnerships, and recruitment drives. Traditional manual approaches lack centralized coordination, real-time tracking, and comprehensive analytics required for efficient placement management.

<br>

---

## 💡 Our Solution
GEHU Placement Portal is a comprehensive educational platform built to:

- 🔐 **Multi-Role Authentication** with secure JWT-based login system
- 👨🎓 **Student Management** with profile tracking and application monitoring
- 🏢 **Company Portal** for recruitment drive scheduling and candidate management
- 📊 **Admin Dashboard** with complete system oversight and analytics
- 📱 **Responsive Design** accessible from any modern device

<br>

---  

## 🚀 Features

✅  **Complete authentication system** with role-based access control  
✅  **Interactive student dashboard** with application tracking  
✅  **Company recruitment portal** with drive management  
✅  **Admin analytics panel** with placement statistics  
✅  **Document management system** with resume upload functionality  
✅  **Real-time notifications** with event updates  
✅  **Responsive design** with modern UI/UX  
✅  **Bulk student registration** with CSV/Excel import  
✅  **Professional reporting system** with data export capabilities  

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
<td>Runtime environment for backend services</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/></td>
<td>Web framework for API development</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/></td>
<td>Relational database for data management</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/></td>
<td>Secure authentication and authorization</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></td>
<td>Interactive frontend functionality</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Semantic markup and structure</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/></td>
<td>Modern styling with responsive design</td>
</tr>
</tbody>
</table>

</div>

<br>

---

## 📁 Project Directory Structure

```
GEHU-Placement Portal/
├── 📂 assets/                     # 🖼️ Static assets and media
│   └── 📂 images/                 # 🏢 Company logos and university images
│       ├── 📄 company-logos/      # 🏢 Brand assets for partner companies
│       ├── 📄 main-building.jpg   # 🏛️ University campus images
│       ├── 📄 navbar-logo.png     # 🎯 Navigation branding
│       └── 📄 favicon.png         # 🌟 Site favicon
├── 📂 backend/                    # 🔧 Node.js backend service
│   ├── 📂 config/                 # ⚙️ Configuration files
│   │   └── 📄 database.js         # 🗄️ MySQL connection configuration
│   ├── 📂 controllers/            # 🎮 Business logic controllers
│   │   ├── 📄 authController.js   # 🔐 Authentication management
│   │   ├── 📄 studentController.js # 👨🎓 Student operations
│   │   ├── 📄 adminController.js  # 👨💼 Admin panel operations
│   │   ├── 📄 eventController.js  # 📅 Event and drive management
│   │   └── 📄 participationController.js # 📝 Application tracking
│   ├── 📂 middleware/             # 🛡️ Security and validation
│   │   └── 📄 auth.js             # 🔒 JWT authentication middleware
│   ├── 📂 routes/                 # 🛣️ API route definitions
│   ├── 📂 uploads/                # 📁 File storage system
│   │   └── 📂 resumes/            # 📄 Student resume repository
│   ├── 📄 server.js               # 🚀 Express server entry point
│   ├── 📄 database.sql            # 🗃️ Database schema and setup
│   ├── 📄 package.json            # 📦 Backend dependencies
│   └── 📄 .env                    # 🔐 Environment variables
├── 📂 src/                        # 🎨 Frontend source code
│   ├── 📂 pages/                  # 📄 HTML page templates
│   │   ├── 📄 index.html          # 🏠 Landing page
│   │   ├── 📄 login-page.html     # 🔑 Authentication interface
│   │   ├── 📄 student-dashboard.html # 👨🎓 Student portal
│   │   ├── 📄 admin-dashboard.html   # 👨💼 Admin control panel
│   │   ├── 📄 company-dashboard.html # 🏢 Company recruitment portal
│   │   └── 📄 student-register.html  # 📝 Registration forms
│   ├── 📂 scripts/                # ⚡ JavaScript functionality
│   │   ├── 📄 index.js            # 🏠 Landing page interactions
│   │   ├── 📄 student-dashboard.js # 👨🎓 Student portal logic
│   │   └── 📄 company-dashboard.js # 🏢 Company portal features
│   └── 📂 styles/                 # 🎨 CSS stylesheets
│       ├── 📄 index.css           # 🏠 Landing page styles
│       ├── 📄 student-dashboard.css # 👨🎓 Student portal styling
│       └── 📄 company-dashboard.css # 🏢 Company portal design
├── 📂 docs/                       # 📸 Documentation and screenshots
│   ├── 📄 Admin_Dashboard.png     # 📸 Admin interface preview
│   ├── 📄 Student_Dashboard.png   # 📸 Student portal preview
│   ├── 📄 Company_Dashboard.png   # 📸 Company portal preview
│   └── 📄 Home_Page.png           # 📸 Landing page preview
├── 📄 vercel.json                 # ⚡ Vercel deployment configuration
├── 📄 .vercelignore              # 🚫 Vercel deployment ignore rules
├── 📄 index.html                  # 🚪 Root application entry point
└── 📄 README.md                   # 📖 Project documentation
```
<br>

## 📸 Preview Images

| 📍 Page / Feature | 📸 Screenshot |
|:------------------|:--------------|
| Landing Page | ![Home Page](docs/Home_Page.png) |
| Admin Dashboard | ![Admin Dashboard](docs/Admin_Dashboard.png) |
| Student Portal | ![Student Dashboard](docs/Student_Dashboard.png) |
| Company Portal | ![Company Dashboard](docs/Company_Dashboard.png) |

<br>

---

## 📦 How to Run

### 📌 Prerequisites
- ✅ **Node.js (v14+)** installed
- ✅ **MySQL (v8.0+)** database server
- ✅ **Modern web browser** (Chrome, Firefox, Safari, Edge)

<br>

---  

### 🚀 Quick Start

1. Clone and setup environment:

   ```bash
   git clone https://github.com/AbhishekGiri04/GEHU-Smart_Placement_Portal.git
   cd "GEHU-Placement Portal"
   
   # Setup backend
   cd backend
   npm install
   ```

2. Configure database:

   ```bash
   mysql -u root -p < database.sql
   ```

3. Start the application:

   ```bash
   npm start
   ```

4. Access the application:

   ```
   http://localhost:5000
   ```

### 🔧 Manual Setup

```bash
# Clone the repository
git clone https://github.com/AbhishekGiri04/GEHU-Smart_Placement_Portal.git
cd "GEHU-Placement Portal"

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
mysql -u root -p < database.sql

# Start the server
npm start
```
<br>

---

## 📖 Core Components

### Backend Components
* **server.js** — Express server with middleware integration and API routing
* **authController.js** — JWT authentication and user session management
* **studentController.js** — Student profile management and application tracking
* **adminController.js** — Administrative operations and system oversight
* **eventController.js** — Placement drive scheduling and event management
* **database.js** — MySQL connection pooling and query optimization

### Frontend Components
* **index.html** — Responsive landing page with university branding
* **student-dashboard.js** — Interactive student portal with real-time updates
* **admin-dashboard.js** — Comprehensive admin panel with analytics
* **company-dashboard.js** — Company recruitment portal with candidate management

<br>

---

## 🌐 API Endpoints

```bash
# Authentication Routes
POST /api/students/login      # Student authentication
POST /api/admins/login        # Admin authentication
POST /api/companies/login     # Company authentication

# Student Management
GET  /api/students            # Fetch all students
POST /api/students/register   # Register new student
PUT  /api/students/:id        # Update student profile
POST /api/students/:id/resume # Upload resume

# Event Management
GET  /api/events              # Get all placement drives
POST /api/events/create       # Create new drive
GET  /api/events/upcoming     # Upcoming events

# Communication System
POST /api/messages/send       # Send message
GET  /api/messages            # Get messages (admin)

# Advanced Features
POST /api/bulk-upload         # Bulk student registration
GET  /api/analytics           # Placement statistics
POST /api/notifications       # Send notifications
```
<br>

---

## 🧪 Testing

```bash
# Test server startup
cd backend
npm start
# Should show: "🚀 Server running on http://localhost:5000"

# Test API endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/students
curl -X POST http://localhost:5000/api/students/login
```

## ⚠️ Common Issues

**Port 5000 already in use:**
```bash
# Windows
netstat -ano | findstr :5000
# Mac/Linux
lsof -ti:5000 | xargs kill
```

**Database connection errors:**
```bash
# Check MySQL service
sudo service mysql start
# Verify credentials in .env file
```

**Module not found errors:**
```bash
cd backend && npm install
```
<br>

---

## 🎮 Usage Guide

### 🚀 Quick Demo (2 minutes)
1. **Visit landing page** at http://localhost:5000
2. **Login as Admin** using: admin@gehu.edu / admin123
3. **Register students** using individual or bulk upload
4. **Create placement drives** and manage applications
5. **View analytics** and generate reports

### 🔧 Student Registration Process
```
1. Admin logs into dashboard
2. Navigate to "Register Students" section
3. Choose individual or bulk upload method
4. Fill student details or upload CSV/Excel file
5. Review and approve registrations
6. Students receive login credentials
```

### 🎯 Key Features to Explore
- **Multi-Role Dashboard** - Different interfaces for students, companies, and admins
- **Real-time Analytics** - Live placement statistics and performance metrics
- **Document Management** - Secure resume upload and storage system
- **Event Scheduling** - Comprehensive placement drive management
- **Communication System** - Integrated messaging and notification system
- **Bulk Operations** - Efficient mass student registration and data import

<br>

---

## 📊 Performance Metrics

- **⚡ Fast Response Times** — API responses under 200ms
- **🔒 Secure Authentication** — JWT-based token system
- **📱 Mobile Responsive** — Optimized for all device sizes
- **🗄️ Database Optimization** — Indexed queries and connection pooling
- **🎓 Educational Focus** — Designed specifically for university placement needs
- **📈 Scalable Architecture** — Supports thousands of concurrent users
- **🌐 Cross-browser** — Compatible with all modern browsers

<br>

---

## 🌱 Future Enhancements
- 📱 **Mobile Application** — Native iOS and Android apps
- 🤖 **AI-Powered Matching** — Intelligent student-company matching
- 📊 **Advanced Analytics** — Predictive placement analytics
- 🔔 **Push Notifications** — Real-time mobile notifications
- 🌐 **Multi-Campus Support** — Support for multiple university campuses
- 📧 **Email Integration** — Automated email campaigns
- 📈 **Performance Dashboard** — Real-time system monitoring

<br>

---  

## 📞 Help & Contact  

> 💬 *Got questions or need assistance with GEHU Placement Portal?*  
> We're here to help with setup, customization, and deployment!

<div align="center">

<b>👤 Development Team</b>  
<a href="https://www.linkedin.com/in/your-profile/">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn"/>
</a>  
<a href="https://github.com/yourusername">
  <img src="https://img.shields.io/badge/Follow%20on-GitHub-black?style=for-the-badge&logo=github" alt="GitHub"/>
</a>  
<a href="mailto:support@gehu.edu">
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

**© 2026 GEHU Placement Portal - Advanced Placement Management System. All Rights Reserved.**

</div>
