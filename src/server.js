const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const departmentRoutes = require("./routes/department.routes");
const leaveRoutes = require("./routes/leave.routes");
const leaveTypeRoutes = require("./routes/leaveType.routes");
const payrollRoutes = require("./routes/payroll.routes");
const performanceReviewRoutes = require("./routes/performanceReview.routes");
const attendanceRequestsRoutes = require("./routes/attendanceRequests.routes"); // Add this line


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS API",
      version: "1.0.0",
      description: "REST APIs for HR Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/performance-reviews", performanceReviewRoutes);
app.use('/api/attendance-requests', attendanceRequestsRoutes); // Add this line

// Test route
app.get("/", (req, res) => {
  res.send("🚀 HRMS API is running...");
});

// Connect DB + Start server
connectDB().then((pool) => {
  app.set("dbPool", pool); // Store pool globally
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📖 Swagger Docs available at http://localhost:${PORT}/api-docs`);
  });
}).catch((err) => {
  console.error("❌ Failed to start server:", err.message);
  process.exit(1);
});