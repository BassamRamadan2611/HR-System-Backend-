# HRMS Backend API

A complete Human Resource Management System backend built with Node.js, Express, and SQL Server. Provides RESTful APIs for employee management, attendance tracking, leave management, and authentication.

## Features

- **Employee Management** - Complete CRUD operations for employees
- **Department Management** - Organize employees by departments
- **Attendance System** - Track employee check-ins, check-outs, and working hours
- **Leave Management** - Handle leave requests and approvals
- **User Authentication** - JWT-based secure authentication
- **Role-based Access Control** - Different permissions for employees, managers, and admins

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Security**: bcryptjs, CORS

## Prerequisites

- Node.js (v14 or higher)
- SQL Server (2019 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/hrms-backend.git
cd hrms-backend
Install dependencies

bash
npm install
Environment Configuration
Create a .env file:

env
PORT=5000
DB_SERVER=localhost
DB_USER=your_sql_server_username
DB_PASSWORD=your_sql_server_password
DB_NAME=hrms_database
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
Database Setup

Create database: hrms_database

Run the provided SQL scripts to create tables

Start the application

bash
# Development
npm run dev

# Production
npm start
API Documentation
Live Swagger documentation available at: http://localhost:5000/api-docs

Base URL
text
http://localhost:5000
API Endpoints
Authentication
Method	Endpoint	Description	Access
POST	/api/auth/login	Login and get JWT token	Public
POST	/api/auth/register	Register new user	Admin only
GET	/api/auth/users	Get all users	Admin only
PUT	/api/auth/users/{id}	Update user	Admin only
DELETE	/api/auth/users/{id}	Delete user	Admin only
GET	/api/auth/profile	Get user profile	Authenticated
PUT	/api/auth/profile	Update user profile	Authenticated
POST	/api/auth/change-password	Change password	Authenticated
Employees
Method	Endpoint	Description	Access
GET	/api/employees	Get all employees	Authenticated
POST	/api/employees	Add new employee	Admin
GET	/api/employees/{id}	Get employee by ID	Authenticated
PUT	/api/employees/{id}	Update employee	Admin/Manager
DELETE	/api/employees/{id}	Delete employee	Admin
GET	/api/employees/department/{departmentId}	Get employees by department	Authenticated
GET	/api/employees/department/{departmentId}/manager/{managerId}	Get employees by dept & manager	Manager
GET	/api/employees/department/{departmentId}/managers	Get managers in department	Authenticated
Departments
Method	Endpoint	Description	Access
GET	/api/departments	Get all departments	Authenticated
POST	/api/departments	Add new department	Admin
GET	/api/departments/{id}	Get department by ID	Authenticated
PUT	/api/departments/{id}	Update department	Admin
DELETE	/api/departments/{id}	Delete department	Admin
Attendance
Method	Endpoint	Description	Access
GET	/api/attendance	Get all attendance records	Manager/Admin
GET	/api/attendance/{id}	Get attendance by ID	Authenticated
PUT	/api/attendance/{id}	Update attendance status	Admin only
DELETE	/api/attendance/{id}	Delete attendance record	Admin only
POST	/api/attendance/checkin	Employee check-in	Employee
POST	/api/attendance/checkout	Employee check-out	Employee
Attendance Requests
Method	Endpoint	Description	Access
GET	/attendance-requests/types	Get all attendance request types	Authenticated
POST	/attendance-requests	Submit new attendance request	Employee
GET	/attendance-requests	Get all attendance requests	Manager/Admin
GET	/attendance-requests/{RequestID}	Get attendance request by ID	Authenticated
PUT	/attendance-requests/{RequestID}	Update attendance request	Employee
DELETE	/attendance-requests/{RequestID}	Delete/Cancel attendance request	Employee
POST	/attendance-requests/approve	Approve/reject attendance request	Manager/Admin
Leaves
Method	Endpoint	Description	Access
GET	/api/leaves	Get all leave requests	Authenticated
POST	/api/leaves	Request a leave	Employee
GET	/api/leaves/{LeaveID}	Get specific leave request	Authenticated
PUT	/api/leaves/{LeaveID}	Update leave request	Employee
DELETE	/api/leaves/{LeaveID}	Delete/Cancel leave request	Employee
POST	/api/leaves/approve	Approve/reject leave request	Admin/Manager
Leave Types
Method	Endpoint	Description	Access
GET	/api/leave-types	Get all leave types	Authenticated
POST	/api/leave-types	Add new leave type	Admin
PUT	/api/leave-types/{LeaveTypeID}	Update leave type	Admin
DELETE	/api/leave-types/{LeaveTypeID}	Delete leave type	Admin
Authentication
Login Request
http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
Response
json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@company.com",
    "role": "employee",
    "employeeId": 123
  }
}
Protected Routes
Include JWT token in Authorization header:

http
Authorization: Bearer your_jwt_token_here
User Roles
Employee: Basic access to personal data and requests

Manager: Access to team management and approvals

Admin: Full system access and user management
