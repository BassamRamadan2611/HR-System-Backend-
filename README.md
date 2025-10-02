# 🏢 HRMS Backend API

A complete **Human Resource Management System (HRMS)** backend built with **Node.js, Express, and SQL Server**.  
This backend provides **RESTful APIs** for employee management, attendance tracking, leave management, and authentication.

---

## ✨ Features

✅ **Employee Management** – Complete CRUD operations for employees  
✅ **Department Management** – Organize employees by departments  
✅ **Attendance System** – Track employee check-ins, check-outs, and working hours  
✅ **Leave Management** – Handle leave requests and approvals  
✅ **User Authentication** – Secure JWT-based authentication  
✅ **Role-based Access Control** – Different permissions for employees, managers, and admins  

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** SQL Server  
- **Authentication:** JWT (JSON Web Tokens)  
- **Security:** bcryptjs, CORS  
- **API Documentation:** Swagger / OpenAPI 3.0  

---

## 📦 Installation

### 🔹 Prerequisites
- Node.js (v14 or higher)  
- SQL Server (2019 or higher)  
- npm or yarn  

### 🔹 Setup
```bash
# Clone the repository
git clone https://github.com/your-username/hrms-backend.git
cd hrms-backend

# Install dependencies
npm install





Environment Variables

Create a .env file in the root directory:

PORT=5000
DB_SERVER=localhost
DB_USER=your_sql_server_username
DB_PASSWORD=your_sql_server_password
DB_NAME=hrms_database
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

🔹 Database Setup

Create database: hrms_database

Run the provided SQL scripts to create tables

🔹 Run the Application
# Development mode
npm run dev

# Production mode
npm start

📖 API Documentation

Swagger is available at:
👉 http://localhost:5000/api-docs

Base URL:

http://localhost:5000
