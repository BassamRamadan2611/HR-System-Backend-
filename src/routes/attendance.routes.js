const express = require("express");
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendance.controller");
const { auth, adminOnly,managerOrAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management
 */

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get("/", auth, getAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get an attendance record by ID
 *     tags: [Attendance]
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
 *         description: Attendance record
 *       404:
 *         description: Not found
 */
router.get("/:id", auth, getAttendanceById);

/**
 * @swagger
 * /api/attendance/checkin:
 *   post:
 *     summary: Employee check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - EmployeeID
 *             properties:
 *               EmployeeID:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Employee checked in
 */
router.post("/checkin", auth, checkIn);

/**
 * @swagger
 * /api/attendance/checkout:
 *   post:
 *     summary: Employee check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - AttendanceID
 *             properties:
 *               AttendanceID:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Employee checked out
 */
router.post("/checkout", auth, checkOut);

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance status (Admin only)
 *     tags: [Attendance]
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
 *               Status:
 *                 type: string
 *                 example: Absent
 *     responses:
 *       200:
 *         description: Attendance updated
 */
router.put("/:id", auth, adminOnly, updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
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
 *         description: Attendance record deleted
 */
router.delete("/:id", auth, adminOnly, deleteAttendance);

module.exports = router;
