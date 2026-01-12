# 🎓 GEHU Placement Portal - Backend API

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
mysql -u root -p < database.sql
```

### 3. Configure Environment
Update `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_portal
```

### 4. Start Server
```bash
# Development
npm run dev

# Production  
npm start
```

## 📡 API Endpoints

### 🔐 Authentication
```http
POST /api/students/login      # Student login
POST /api/admins/login        # Admin login  
POST /api/students/register   # Student registration
```

### 🎓 Students
```http
GET    /api/students                    # Get all students
GET    /api/students/:id                # Get student by ID
PUT    /api/students/:id                # Update student
DELETE /api/students/:id                # Delete student
POST   /api/students/:id/resume         # Upload resume
POST   /api/students/:id/resume-drive-link # Update Google Drive link
GET    /api/students/filter             # Filter students
```

### 👨💼 Admins
```http
GET    /api/admins                      # Get all admins
GET    /api/admins/:id                  # Get admin profile
POST   /api/admins/create               # Create admin
PUT    /api/admins/:id/update           # Update admin
POST   /api/admins/:id/change-password  # Change password
GET    /api/admins/dashboard/stats      # Dashboard statistics
```

### 📅 Events
```http
GET    /api/events                      # Get all events
GET    /api/events/upcoming             # Get upcoming events
GET    /api/events/:id                  # Get event by ID
POST   /api/events/create               # Create event
PUT    /api/events/:id                  # Update event
DELETE /api/events/:id                  # Delete event
```

### 📝 Participation
```http
POST   /api/participation/register      # Register for event
GET    /api/participation/student/:id   # Get student applications
GET    /api/participation/event/:id     # Get event participants
PUT    /api/participation/:studentId/:eventId # Update status
```

## 🔑 Default Credentials

### Admin
- **Email:** admin@gehu.edu
- **Password:** admin123

### Students
- **ID:** 2318169 (Abhishek Giri)
- **Password:** gehu@123

## 📊 Database Tables

- **admins** - System administrators
- **students** - Student profiles with academic details
- **companies** - Company information
- **events** - Placement drives and job postings
- **participation** - Student applications to events
- **messages** - Communication system

## 🛠️ Features

✅ **JWT Authentication**
✅ **File Upload (Resume)**
✅ **Google Drive Integration**
✅ **Advanced Filtering**
✅ **Real-time Applications**
✅ **Dashboard Analytics**
✅ **Error Handling**
✅ **Input Validation**

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use PM2 for process management
3. Setup Nginx reverse proxy
4. Configure SSL certificates
5. Setup database backups

Server will run on: **http://localhost:5000**