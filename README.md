<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HRMS Backend API Docs</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800 font-sans">

  <!-- Header -->
  <header class="bg-indigo-600 text-white py-6 shadow-lg">
    <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">🏢 HRMS Backend API</h1>
      <span class="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-medium shadow">v1.0</span>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-6xl mx-auto px-6 py-10 space-y-12">

    <!-- Intro -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">Overview</h2>
      <p class="mt-2 text-gray-700">
        A complete <b>Human Resource Management System</b> backend built with
        <b>Node.js</b>, <b>Express</b>, and <b>SQL Server</b>. Provides
        RESTful APIs for employees, attendance, leaves, and authentication.
      </p>
    </section>

    <!-- Features -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">✨ Features</h2>
      <ul class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
        <li class="bg-white p-3 rounded-lg shadow">👨‍💼 Employee Management</li>
        <li class="bg-white p-3 rounded-lg shadow">🏢 Department Management</li>
        <li class="bg-white p-3 rounded-lg shadow">⏱️ Attendance System</li>
        <li class="bg-white p-3 rounded-lg shadow">🌴 Leave Management</li>
        <li class="bg-white p-3 rounded-lg shadow">🔒 JWT Authentication</li>
        <li class="bg-white p-3 rounded-lg shadow">🛡️ Role-based Access Control</li>
      </ul>
    </section>

    <!-- Tech Stack -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">🛠️ Tech Stack</h2>
      <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-white shadow p-3 rounded-lg">⚡ Node.js + Express</div>
        <div class="bg-white shadow p-3 rounded-lg">🗄️ SQL Server</div>
        <div class="bg-white shadow p-3 rounded-lg">🔑 JWT Auth</div>
        <div class="bg-white shadow p-3 rounded-lg">🔒 bcrypt.js</div>
        <div class="bg-white shadow p-3 rounded-lg">🌐 Swagger / OpenAPI</div>
        <div class="bg-white shadow p-3 rounded-lg">🛡️ CORS</div>
      </div>
    </section>

    <!-- Installation -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">📦 Installation</h2>
      <ol class="list-decimal list-inside mt-3 space-y-2 text-gray-700">
        <li>Clone repository: <code class="bg-gray-200 px-2 py-1 rounded">git clone https://github.com/your-username/hrms-backend.git</code></li>
        <li>Install dependencies: <code class="bg-gray-200 px-2 py-1 rounded">npm install</code></li>
        <li>Setup <code>.env</code> file with DB & JWT configs</li>
        <li>Run database setup scripts</li>
        <li>Start server: <code class="bg-gray-200 px-2 py-1 rounded">npm run dev</code></li>
      </ol>
    </section>

    <!-- API Docs -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">📖 API Documentation</h2>
      <p class="mt-2">
        Swagger docs available at:
        <a href="http://localhost:5000/api-docs" class="text-indigo-600 font-medium hover:underline">http://localhost:5000/api-docs</a>
      </p>
      <p class="mt-1 text-sm text-gray-600">Base URL: <code class="bg-gray-200 px-2 py-1 rounded">http://localhost:5000</code></p>
    </section>

    <!-- Endpoints -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">🚀 API Endpoints</h2>

      <!-- Auth -->
      <div class="mt-4">
        <h3 class="font-semibold text-lg">🔑 Authentication</h3>
        <table class="w-full mt-2 border border-gray-300 text-sm">
          <thead class="bg-gray-200">
            <tr>
              <th class="p-2 text-left">Method</th>
              <th class="p-2 text-left">Endpoint</th>
              <th class="p-2 text-left">Description</th>
              <th class="p-2 text-left">Access</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="p-2">POST</td>
              <td class="p-2">/api/auth/login</td>
              <td class="p-2">Login & get JWT</td>
              <td class="p-2">Public</td>
            </tr>
            <tr class="border-t">
              <td class="p-2">POST</td>
              <td class="p-2">/api/auth/register</td>
              <td class="p-2">Register user</td>
              <td class="p-2">Admin</td>
            </tr>
            <tr class="border-t">
              <td class="p-2">GET</td>
              <td class="p-2">/api/auth/profile</td>
              <td class="p-2">User profile</td>
              <td class="p-2">Authenticated</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Employees -->
      <div class="mt-6">
        <h3 class="font-semibold text-lg">👨‍💼 Employees</h3>
        <p class="text-sm text-gray-600">CRUD endpoints for employees with role-based access</p>
      </div>

      <!-- Add more tables for Departments, Attendance, Leaves -->
    </section>

    <!-- Example -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">🔒 Authentication Example</h2>
      <div class="bg-white p-4 rounded-lg shadow mt-3">
        <p class="font-medium">Login Request:</p>
        <pre class="bg-gray-800 text-white p-3 rounded mt-2 text-sm">POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}</pre>

        <p class="font-medium mt-4">Response:</p>
        <pre class="bg-gray-800 text-green-200 p-3 rounded mt-2 text-sm">{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@company.com",
    "role": "employee",
    "employeeId": 123
  }
}</pre>
      </div>
    </section>

    <!-- Roles -->
    <section>
      <h2 class="text-xl font-semibold text-indigo-600">👥 User Roles</h2>
      <ul class="mt-3 space-y-2 text-gray-700">
        <li><b>Employee:</b> Basic personal data & requests</li>
        <li><b>Manager:</b> Team management & approvals</li>
        <li><b>Admin:</b> Full system & user management</li>
      </ul>
    </section>
  </main>

  <!-- Footer -->
  <footer class="bg-gray-800 text-gray-200 py-4 mt-12">
    <div class="max-w-6xl mx-auto px-6 flex justify-between text-sm">
      <span>© 2025 HRMS Backend</span>
      <span>MIT License</span>
    </div>
  </footer>

</body>
</html>
