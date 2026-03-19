<h1 align="center">🎓 GEHU Placement Portal</h1>

<p align="center">
  A production-ready full-stack campus placement management system built with Node.js, Express, PostgreSQL, and Vanilla JS — connecting students, companies, and administrators on a single platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white"/>
</p>

---

## 📖 Problem Statement

Traditional campus placement systems are plagued by inefficiencies:

- Placement officers juggle 100+ emails per recruitment drive
- Student data scattered across Excel sheets and paper records
- No centralized tracking of application statuses or placement metrics
- Manual coordination leads to errors and missed opportunities

**Result:** Delayed placements, reduced company participation, and suboptimal career outcomes.

---

## 💡 Solution

GEHU Placement Portal provides a centralized, automated platform with three role-based portals:

- **Students** — apply to drives, track applications, upload resumes, view announcements
- **Companies** — create drives, manage applicants, update selection status
- **Admins** — manage all users, events, analytics, announcements, and messages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js v4 |
| Database | PostgreSQL 18 (hosted on Render) |
| ORM/Driver | pg (node-postgres) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer (PDF only, 5MB limit) |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, express-rate-limit, CORS |
| Frontend | Vanilla HTML5 + CSS3 + JavaScript (no frameworks) |
| Deployment | Render (backend + database) |

---

## ✨ Features

### Student Portal
- Login with admission number + password
- View dashboard stats (applied, selected, pending, available drives)
- Browse and apply to placement drives (CGPA + department eligibility check)
- Track all applications with status (REGISTERED → SELECTED/REJECTED)
- Withdraw applications (blocked if SELECTED/COMPLETED)
- Upload resume (PDF, max 5MB) or save Google Drive link
- View placement analytics with status breakdown bars
- Read announcements from placement cell
- Send messages to admin, view replies
- Update contact info and change password

### Company Portal
- Login with company ID or HR email
- Dashboard with drive stats and recent applicants
- Create, edit, delete placement drives
- View applicants per drive sorted by CGPA
- Update applicant status (REGISTERED/ATTEMPTED/SELECTED/REJECTED etc.)
- Filter applicants by CGPA, department, status
- Send messages to admin

### Admin Portal
- Login with email or admin ID
- Dashboard with 6 KPI stats + recent activity + top companies
- Full CRUD for students (search, filter by dept/batch/CGPA)
- Full CRUD for companies
- Full CRUD for events (linked to company by FK)
- Placement analytics by department and by company
- Announcements — create, edit, delete (visible to all students)
- Messages — view all, mark read, reply (stored in DB), delete
- Edit profile and change password

### Security
- JWT authentication with 24h expiry
- Role-based access control (student / company / admin)
- Rate limiting: 10 login attempts per 15 minutes
- Helmet security headers
- CORS restricted to allowed origins
- PDF-only file upload with extension + mimetype validation
- bcrypt password hashing (cost factor 10)
- Password reset via email token (1 hour expiry)

---

## 🗄️ Database Schema

PostgreSQL 18 on Render. 7 tables with proper foreign keys, indexes, and `updated_at` triggers.

```
admins          — admin_id (PK), admin_name, email_address, password, ...
students        — student_admission_number (PK), name, dept, cgpa, password, ...
companies       — company_id (PK), company_name, hr_email, password, ...
events          — event_id (PK), company_id (FK→companies), job_role, status, ...
participation   — (student_admission_number, event_id) composite PK, status, ...
messages        — id (PK), sender_name, subject, message, reply, status, ...
announcements   — id (PK), title, content, created_by, ...
```

**Foreign Keys:**
- `events.company_id` → `companies.company_id` ON DELETE CASCADE
- `participation.student_admission_number` → `students` ON DELETE CASCADE
- `participation.event_id` → `events` ON DELETE CASCADE

**Indexes:** department+cgpa, batch, company+status, event dates, participation lookups, message status, announcement date

---

## 📁 Project Structure

```
GEHU-Placement_Portal/
├── assets/
│   └── images/                    # Logos, favicon, architecture diagrams
├── backend/
│   ├── config/
│   │   └── database.js            # PostgreSQL pool + execute() wrapper
│   ├── controllers/
│   │   ├── adminController.js     # Students, companies, events, analytics, messages, announcements
│   │   ├── authController.js      # Login, register, forgot/reset password
│   │   ├── companyController.js   # Company profile, drives, applicants, messages
│   │   ├── eventController.js     # Public event browsing endpoints
│   │   ├── messageController.js   # Message CRUD
│   │   ├── participationController.js  # Participation records
│   │   └── studentController.js   # Profile, applications, resume, dashboard
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   └── roleMiddleware.js      # Role-based access guard
│   ├── routes/
│   │   ├── admin.js               # 22 admin routes
│   │   ├── announcements.js       # Public GET announcements
│   │   ├── auth.js                # 8 auth routes
│   │   ├── companies.js           # 11 company routes
│   │   ├── events.js              # 4 public event routes
│   │   ├── messages.js            # 4 message routes
│   │   └── students.js            # 9 student routes
│   ├── uploads/
│   │   └── resumes/               # Uploaded PDF resumes
│   ├── utils/
│   │   └── emailService.js        # Nodemailer with graceful fallback
│   ├── .env                       # Environment variables (not committed)
│   ├── database.sql               # PostgreSQL schema + sample data
│   ├── package.json
│   └── server.js                  # Express app entry point
├── docs/
│   ├── Admin_Dashboard.png
│   ├── Company_Dashboard.png
│   ├── Home_Page.png
│   └── Student_Dashboard.png
├── src/
│   ├── pages/
│   │   ├── admin-dashboard.html
│   │   ├── company-dashboard.html
│   │   ├── login-page.html
│   │   ├── reset-password.html
│   │   ├── student-dashboard.html
│   │   ├── student-register.html
│   │   ├── company-register.html
│   │   └── index.html
│   ├── scripts/
│   │   ├── api.js                 # Central fetch wrapper (Bearer token, 401 redirect)
│   │   ├── auth.js                # Login, logout, requireAuth, getUser, showToast
│   │   ├── admin.js               # All admin dashboard logic
│   │   ├── company.js             # All company dashboard logic
│   │   └── student.js             # All student dashboard logic
│   └── styles/
│       ├── student-dashboard.css
│       ├── company-dashboard.css
│       └── index.css
├── .gitignore
├── .vercelignore
├── index.html                     # Root entry — redirects to src/pages/index.html
├── LICENSE
├── README.md
├── run.sh                         # One-command local startup script
└── vercel.json                    # Render/Vercel deployment config
```

---

## 🌐 API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/students/login` | Student login |
| POST | `/students/register` | Student registration |
| POST | `/admins/login` | Admin login |
| POST | `/companies/login` | Company login |
| POST | `/companies/register` | Company registration |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |
| POST | `/logout` | Logout |

### Students — `/api/students` *(auth: student)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Stats + recent apps + upcoming drives |
| GET | `/profile` | Full student profile |
| PUT | `/profile` | Update mobile, email, address, backlogs |
| PUT | `/change-password` | Change password |
| POST | `/resume/upload` | Upload PDF resume (max 5MB) |
| PUT | `/resume/link` | Save Google Drive resume URL |
| GET | `/applications` | All applications with company + status |
| POST | `/apply/:eventId` | Apply to a drive (eligibility checked) |
| DELETE | `/withdraw/:eventId` | Withdraw application |

### Events — `/api/events` *(public)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | All events (filterable by status, search) |
| GET | `/upcoming` | Open upcoming drives |
| GET | `/:id` | Single event with company details |
| GET | `/company/:companyId` | Events by company |

### Companies — `/api/companies` *(auth: company)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Stats + recent applicants |
| GET/PUT | `/profile` | View/update company profile |
| PUT | `/change-password` | Change password |
| GET | `/events` | My drives with applicant count |
| POST | `/events` | Create new drive |
| PUT | `/events/:id` | Edit drive (ownership checked) |
| DELETE | `/events/:id` | Delete drive (ownership checked) |
| GET | `/events/:eventId/applicants` | Applicants for a drive |
| PUT | `/events/:eventId/applicants/:num` | Update applicant status |
| GET | `/applicants` | All applicants (filterable) |
| POST | `/messages` | Send message to admin |

### Admin — `/api/admin` *(auth: admin)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | 6 KPI stats + recent activity + top companies |
| GET | `/analytics` | By dept, by company, monthly trend |
| GET/PUT | `/profile` | View/update admin profile |
| PUT | `/change-password` | Change password |
| GET/POST | `/students` | List (paginated, filterable) / Add |
| PUT/DELETE | `/students/:id` | Edit / Delete student |
| GET/POST | `/companies` | List / Add company |
| PUT/DELETE | `/companies/:id` | Edit / Delete company |
| GET/POST | `/events` | List / Create event |
| PUT/DELETE | `/events/:id` | Edit / Delete event |
| GET | `/messages` | All messages (paginated, filterable) |
| PUT | `/messages/:id/read` | Mark as read |
| POST | `/messages/:id/reply` | Reply to message |
| DELETE | `/messages/:id` | Delete message |
| GET/POST | `/announcements` | List / Create announcement |
| PUT/DELETE | `/announcements/:id` | Edit / Delete announcement |

### Public — `/api/announcements`, `/api/messages/send`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/announcements` | All announcements (no auth) |
| POST | `/api/messages/send` | Send message (no auth required) |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js v18+
- PostgreSQL (local) **or** a Render PostgreSQL instance

### 1. Clone
```bash
git clone https://github.com/AbhishekGiri04/GEHU-Smart_Placement_Portal.git
cd GEHU-Placement_Portal
```

### 2. Configure environment
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_strong_secret_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Install dependencies
```bash
cd backend
npm install
```

### 4. Import database schema
```bash
psql "$DATABASE_URL" -f database.sql
```

### 5. Start
```bash
npm start
# or use the startup script from project root:
bash run.sh
```

### 6. Open
```
http://localhost:5000
```

---

## 🔑 Sample Login Credentials

| Role | ID / Email | Password |
|---|---|---|
| Student | `2318169` | `gehu@123` |
| Student | `2318699` | `gehu@123` |
| Admin | `admin@gehu.edu` | `admin123` |
| Admin | `tpo@gehu.edu` | `admin123` |
| Company | `TCS001` | `comp@123` |
| Company | `INF001` | `comp@123` |
| Company | `AMZ001` | `comp@123` |

---

## ☁️ Deployment (Render)

### Database
1. Create a PostgreSQL instance on [Render](https://render.com)
2. Copy the **External Database URL**
3. Run schema: `psql "your_external_url" -f backend/database.sql`

### Backend Web Service
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add environment variables:
   ```
   DATABASE_URL = <your render postgres external url>
   JWT_SECRET   = <strong random string>
   NODE_ENV     = production
   FRONTEND_URL = https://your-app.onrender.com
   PORT         = 5000
   ```

---

## 📸 Screenshots

### Home Page
<p align="center"><img src="docs/Home_Page.png" width="85%" alt="Home Page"/></p>

### Student Portal
<p align="center"><img src="docs/Student_Dashboard.png" width="85%" alt="Student Dashboard"/></p>

### Company Portal
<p align="center"><img src="docs/Company_Dashboard.png" width="85%" alt="Company Dashboard"/></p>

### Admin Portal
<p align="center"><img src="docs/Admin_Dashboard.png" width="85%" alt="Admin Dashboard"/></p>

---

## 🗺️ ER Diagram

```mermaid
erDiagram
    ADMINS {
        bigserial admin_id PK
        varchar admin_name
        varchar email_address UK
        varchar password
        timestamptz created_at
    }
    STUDENTS {
        varchar student_admission_number PK
        varchar student_first_name
        varchar student_last_name
        varchar department
        double cgpa
        varchar password
        timestamptz created_at
    }
    COMPANIES {
        varchar company_id PK
        varchar company_name UK
        varchar hr_email UK
        varchar password
        timestamptz created_at
    }
    EVENTS {
        bigserial event_id PK
        varchar company_id FK
        varchar event_name
        varchar job_role
        double expected_cgpa
        varchar status
        timestamptz registration_end
    }
    PARTICIPATION {
        varchar student_admission_number FK
        bigint event_id FK
        varchar participation_status
        timestamptz created_at
    }
    MESSAGES {
        bigserial id PK
        varchar sender_name
        varchar sender_email
        text message
        text reply
        varchar status
    }
    ANNOUNCEMENTS {
        bigserial id PK
        varchar title
        text content
        varchar created_by
        timestamptz created_at
    }

    COMPANIES ||--o{ EVENTS : "creates"
    STUDENTS ||--o{ PARTICIPATION : "applies"
    EVENTS ||--o{ PARTICIPATION : "receives"
```

---

## 🌱 Future Enhancements

- **📱 Mobile App** — React Native iOS/Android
- **🤖 AI Matching** — Smart student-company recommendations
- **📊 Advanced Analytics** — Predictive placement trends
- **🔔 Push Notifications** — Real-time browser notifications
- **📧 Email Campaigns** — Automated drive reminders
- **🌐 Multi-Campus** — Support multiple university branches
- **📤 Bulk Import** — CSV/Excel student registration

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**👤 Developer**

<a href="https://www.linkedin.com/in/abhishek-giri04/">
  <img src="https://img.shields.io/badge/LinkedIn-Abhishek_Giri-blue?style=for-the-badge&logo=linkedin"/>
</a>
&nbsp;
<a href="https://github.com/AbhishekGiri04">
  <img src="https://img.shields.io/badge/GitHub-AbhishekGiri04-black?style=for-the-badge&logo=github"/>
</a>
&nbsp;
<a href="mailto:abhishekgiri1978@gmail.com">
  <img src="https://img.shields.io/badge/Email-abhishekgiri1978@gmail.com-red?style=for-the-badge&logo=gmail"/>
</a>

<br><br>

**🎓 Built for Graphic Era Hill University**

*© 2026 GEHU Placement Portal. All Rights Reserved.*

</div>
