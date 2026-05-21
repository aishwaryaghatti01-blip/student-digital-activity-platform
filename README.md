# Centralized Student Digital Activity Platform

A comprehensive web application for managing student activities, assignments, grades, and academic progress in a centralized digital environment.

## 🎯 Features

- 👤 **User Management**: Student, Teacher, and Admin roles with authentication
- 📚 **Course Management**: Create and manage courses with enrollment
- 📋 **Activity Tracking**: Assignments, quizzes, projects, and submissions
- 📊 **Progress Dashboard**: Real-time analytics and performance tracking
- 📈 **Grade Management**: Automated grading and detailed performance reports
- 🔔 **Notifications**: Real-time alerts for deadlines and updates
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Mongoose** for ODM

### Frontend
- **React.js** with Hooks
- **Tailwind CSS** for styling
- **Redux** for state management
- **Axios** for API calls

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
student-digital-activity-platform/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── docker-compose.yml
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- MongoDB
- Docker (optional)

### Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/aishwaryaghatti01-blip/student-digital-activity-platform.git
   cd student-digital-activity-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Docker Setup (Alternative)**
   ```bash
   docker-compose up
   ```

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Student, Teacher, Admin)

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (teacher)
- `POST /api/courses/:id/enroll` - Enroll in course

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity (teacher)
- `POST /api/activities/:id/submit` - Submit activity

### Grades
- `GET /api/grades` - Get user grades
- `POST /api/grades` - Add grade (teacher)

### Dashboard
- `GET /api/dashboard/student` - Student stats
- `GET /api/dashboard/teacher` - Teacher stats

## 📄 License

MIT License

## 👤 Author

Aishwarya Ghatti
