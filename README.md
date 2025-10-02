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
git clone https://github.com/BassamRamadan2611/HR-System-Backend.git
cd hrms-backend

# Install dependencies
npm install






🚀 API Endpoints
🔑 Authentication
Method	Endpoint	Description	Access
POST	/api/auth/login	Login & get JWT token	Public
POST	/api/auth/register	Register new user	Admin only
GET	/api/auth/users	Get all users	Admin only
PUT	/api/auth/users/{id}	Update user	Admin only
DELETE	/api/auth/users/{id}	Delete user	Admin only
GET	/api/auth/profile	Get user profile	Authenticated
PUT	/api/auth/profile	Update profile	Authenticated
POST	/api/auth/change-password	Change password	Authenticated
👨‍💼 Employees
Method	Endpoint	Description	Access
GET	/api/employees	Get all employees	Authenticated
POST	/api/employees	Add new employee	Admin
GET	/api/employees/{id}	Get employee by ID	Authenticated
PUT	/api/employees/{id}	Update employee	Admin/Manager
DELETE	/api/employees/{id}	Delete employee	Admin
GET	/api/employees/department/{departmentId}	Get employees by department	Authenticated
GET	/api/employees/department/{departmentId}/manager/{managerId}	Get employees by dept & manager	Manager
GET	/api/employees/department/{departmentId}/managers	Get managers in department	Authenticated
🏢 Departments
Method	Endpoint	Description	Access
GET	/api/departments	Get all departments	Authenticated
POST	/api/departments	Add new department	Admin
GET	/api/departments/{id}	Get department by ID	Authenticated
PUT	/api/departments/{id}	Update department	Admin
DELETE	/api/departments/{id}	Delete department	Admin
⏱️ Attendance
Method	Endpoint	Description	Access
GET	/api/attendance	Get all attendance records	Manager/Admin
GET	/api/attendance/{id}	Get attendance by ID	Authenticated
PUT	/api/attendance/{id}	Update attendance status	Admin only
DELETE	/api/attendance/{id}	Delete attendance record	Admin only
POST	/api/attendance/checkin	Employee check-in	Employee
POST	/api/attendance/checkout	Employee check-out	Employee
📋 Attendance Requests
Method	Endpoint	Description	Access
GET	/attendance-requests/types	Get all request types	Authenticated
POST	/attendance-requests	Submit new request	Employee
GET	/attendance-requests	Get all requests	Manager/Admin
GET	/attendance-requests/{RequestID}	Get request by ID	Authenticated
PUT	/attendance-requests/{RequestID}	Update request	Employee
DELETE	/attendance-requests/{RequestID}	Delete/Cancel request	Employee
POST	/attendance-requests/approve	Approve/reject request	Manager/Admin
🌴 Leaves
Method	Endpoint	Description	Access
GET	/api/leaves	Get all leave requests	Authenticated
POST	/api/leaves	Request leave	Employee
GET	/api/leaves/{LeaveID}	Get specific leave request	Authenticated
PUT	/api/leaves/{LeaveID}	Update leave request	Employee
DELETE	/api/leaves/{LeaveID}	Delete/Cancel leave request	Employee
POST	/api/leaves/approve	Approve/reject leave	Admin/Manager
📌 Leave Types
Method	Endpoint	Description	Access
GET	/api/leave-types	Get all leave types	Authenticated
POST	/api/leave-types	Add leave type	Admin
PUT	/api/leave-types/{LeaveTypeID}	Update leave type	Admin
DELETE	/api/leave-types/{LeaveTypeID}	Delete leave type	Admin
