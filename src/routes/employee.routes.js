const express = require("express");
const router = express.Router();
const { 
  getEmployees, 
  getEmployeeById, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee, 
  getEmployeesByDepartment,
  getEmployeesByDepartmentAndManager,
  getManagersInDepartment 
} = require("../controllers/employee.controller");
const { auth, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management APIs
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/", auth, getEmployees);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee found
 *       404:
 *         description: Employee not found
 */
router.get("/:id", auth, getEmployeeById);

/**
 * @swagger
 * /api/employees/department/{departmentId}:
 *   get:
 *     summary: Get employees by department
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: integer
 *         description: Optional manager ID to filter by specific manager
 *     responses:
 *       200:
 *         description: List of employees in the department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 department:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 manager:
 *                   type: object
 *                   description: Only included when managerId filter is used
 *       404:
 *         description: Department not found
 */
router.get("/department/:departmentId", auth, getEmployeesByDepartment);

/**
 * @swagger
 * /api/employees/department/{departmentId}/manager/{managerId}:
 *   get:
 *     summary: Get employees by department and manager
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Manager ID
 *     responses:
 *       200:
 *         description: List of employees in the department managed by the specified manager
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 manager:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     jobTitle:
 *                       type: string
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *       404:
 *         description: Department or manager not found
 */
router.get("/department/:departmentId/manager/:managerId", auth, getEmployeesByDepartmentAndManager);

/**
 * @swagger
 * /api/employees/department/{departmentId}/managers:
 *   get:
 *     summary: Get all managers in a department
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of managers in the department
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 department:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 managers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       EmployeeID:
 *                         type: integer
 *                       FirstName:
 *                         type: string
 *                       LastName:
 *                         type: string
 *                       JobTitle:
 *                         type: string
 *                       Email:
 *                         type: string
 *                       TeamSize:
 *                         type: integer
 *       404:
 *         description: Department not found
 */
router.get("/department/:departmentId/managers", auth, getManagersInDepartment);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - FirstName
 *               - LastName
 *               - Email
 *               - JobTitle
 *               - Salary
 *               - DepartmentID
 *             properties:
 *               FirstName:
 *                 type: string
 *               LastName:
 *                 type: string
 *               Email:
 *                 type: string
 *               JobTitle:
 *                 type: string
 *               Salary:
 *                 type: number
 *               DepartmentID:
 *                 type: integer
 *               ManagerID:
 *                 type: integer
 *               DateOfBirth:
 *                 type: string
 *                 format: date
 *               Phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee added successfully
 */
router.post("/", auth, adminOnly, addEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FirstName:
 *                 type: string
 *               LastName:
 *                 type: string
 *               Email:
 *                 type: string
 *               JobTitle:
 *                 type: string
 *               Salary:
 *                 type: number
 *               DepartmentID:
 *                 type: integer
 *               ManagerID:
 *                 type: integer
 *               DateOfBirth:
 *                 type: string
 *                 format: date
 *               Status:
 *                 type: string
 *                 enum: [Active, Inactive, On Leave]
 *               Phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 */
router.put("/:id", auth, adminOnly, updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete("/:id", auth, adminOnly, deleteEmployee);

module.exports = router;