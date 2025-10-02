const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword,
  getAllUsers,
  deleteUser,
  updateUser
} = require("../controllers/auth.controller");
const { auth, adminOnly } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

// Public routes
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Password
 *             properties:
 *               Username:
 *                 type: string
 *                 example: ahmed.ali
 *               Password:
 *                 type: string
 *                 example: StrongPass123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

// Admin only routes
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Username
 *               - Password
 *               - EmployeeID
 *             properties:
 *               Username:
 *                 type: string
 *                 example: johndoe
 *               Password:
 *                 type: string
 *                 example: StrongPass123
 *               EmployeeID:
 *                 type: integer
 *                 example: 1
 *               Role:
 *                 type: string
 *                 enum: [admin, manager, employee, user]
 *                 example: employee
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/register", auth, adminOnly, register);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       UserID:
 *                         type: integer
 *                       Username:
 *                         type: string
 *                       Role:
 *                         type: string
 *                       EmployeeID:
 *                         type: integer
 *                       FirstName:
 *                         type: string
 *                       LastName:
 *                         type: string
 *                       Email:
 *                         type: string
 *                       JobTitle:
 *                         type: string
 *                       DepartmentName:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/users", auth, adminOnly, getAllUsers);
/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *                 example: new.username
 *               Role:
 *                 type: string
 *                 enum: [admin, manager, employee, user]
 *                 example: manager
 *               IsActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     UserID:
 *                       type: integer
 *                     Username:
 *                       type: string
 *                     Role:
 *                       type: string
 *                     IsActive:
 *                       type: boolean
 *                     EmployeeID:
 *                       type: integer
 *                     FirstName:
 *                       type: string
 *                     LastName:
 *                       type: string
 *                     Email:
 *                       type: string
 *                     JobTitle:
 *                       type: string
 *                     DepartmentName:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put("/users/:id", auth, adminOnly, updateUser);  // Add this route
/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.delete("/users/:id", auth, adminOnly, deleteUser);

// Authenticated user routes
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     UserID:
 *                       type: integer
 *                     Username:
 *                       type: string
 *                     Role:
 *                       type: string
 *                     EmployeeID:
 *                       type: integer
 *                     FirstName:
 *                       type: string
 *                     LastName:
 *                       type: string
 *                     Email:
 *                       type: string
 *                     Phone:
 *                       type: string
 *                     DateOfBirth:
 *                       type: string
 *                     HireDate:
 *                       type: string
 *                     JobTitle:
 *                       type: string
 *                     DepartmentID:
 *                       type: integer
 *                     DepartmentName:
 *                       type: string
 *                     ManagerID:
 *                       type: integer
 *                     ManagerFirstName:
 *                       type: string
 *                     ManagerLastName:
 *                       type: string
 *                     Salary:
 *                       type: number
 *                     Status:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", auth, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FirstName:
 *                 type: string
 *                 example: John
 *               LastName:
 *                 type: string
 *                 example: Doe
 *               Email:
 *                 type: string
 *                 example: john.doe@example.com
 *               Phone:
 *                 type: string
 *                 example: +1234567890
 *               DateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", auth, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPass123
 *               newPassword:
 *                 type: string
 *                 example: NewPass456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/change-password", auth, changePassword);

module.exports = router;